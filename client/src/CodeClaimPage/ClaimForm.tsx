import React, { useState, useEffect } from 'react';
import classNames from 'classnames';
import { ErrorMessage, Field, FieldProps, Form, Formik, FormikActions } from 'formik';

/* Helpers */
import { tryGetAccount } from '../poap-eth';
import { HashClaim, postClaimHash } from '../api';
import { AddressSchema } from '../lib/schemas';
import { hasWeb3 } from '../poap-eth';

/* Components */
import { SubmitButton } from '../components/SubmitButton';
import ClaimFooterMessage from './ClaimFooterMessage';

// lib
import { COLORS } from '../lib/constants';

type QRFormValues = {
  address: string;
};

const ClaimForm: React.FC<{
  claim: HashClaim;
  method: string;
  onSubmit: (claim: HashClaim) => void;
}> = ({ claim, onSubmit, method }) => {
  const [enabledWeb3, setEnabledWeb3] = useState<boolean | null>(null);
  const [account, setAccount] = useState<string>('');

  const mobileImageUrl = claim?.event_template?.mobile_image_url;
  const mobileImageLink = claim?.event_template?.mobile_image_link;
  const mainColor = claim?.event_template?.main_color;

  useEffect(() => {
    hasWeb3().then(setEnabledWeb3);
  }, []);

  const getAddress = () => {
    tryGetAccount()
      .then((address) => {
        if (address) setAccount(address);
      })
      .catch((e) => {
        console.log('Error while fetching account: ', e);
      });
  };

  const handleFormSubmit = async (values: QRFormValues, actions: FormikActions<QRFormValues>) => {
    try {
      actions.setSubmitting(true);
      let newClaim = await postClaimHash(
        claim.qr_hash.toLowerCase(),
        values.address.toLowerCase(),
        claim.secret,
        method
      );
      onSubmit(newClaim);
    } catch (error) {
      actions.setStatus({
        ok: false,
        msg: `Badge couldn't be claimed: ${error.message}`,
      });
    } finally {
      actions.setSubmitting(false);
    }
  };

  return (
    <div className={'container'} data-aos="fade-up" data-aos-delay="300">
      <div>
        <Formik
          enableReinitialize
          onSubmit={handleFormSubmit}
          initialValues={{ address: account }}
          isInitialValid={account !== ''}
          validationSchema={AddressSchema}
        >
          {({ isValid, isSubmitting, status }) => {
            return (
              <Form className="claim-form">
                <Field
                  name="address"
                  render={({ field, form }: FieldProps) => {
                    return (
                      <input
                        type="text"
                        autoComplete="off"
                        style={{ borderColor: mainColor ? mainColor : COLORS.primaryColor }}
                        className={classNames(!!form.errors[field.name] && 'error')}
                        placeholder={'Input your Ethereum address or ENS name'}
                        {...field}
                      />
                    );
                  }}
                />
                <ErrorMessage name="gasPrice" component="p" className="bk-error" />
                {status && <p className={status.ok ? 'bk-msg-ok' : 'bk-msg-error'}>{status.msg}</p>}
                <div className={'web3-browser'}>
                  {enabledWeb3 && (
                    <div>
                      Web3 browser? <span onClick={getAddress}>Get my address</span>
                    </div>
                  )}
                </div>

                <SubmitButton
                  text="Claim POAP token"
                  style={{ backgroundColor: mainColor ? mainColor : COLORS.primaryColor }}
                  isSubmitting={isSubmitting}
                  canSubmit={isValid}
                />
              </Form>
            );
          }}
        </Formik>
      </div>
      <ClaimFooterMessage linkStyle={{ color: mainColor ? mainColor : COLORS.primaryColor }} />
      {mobileImageUrl ? (
        mobileImageLink ? (
          <a href={mobileImageLink} rel="noopener noreferrer">
            <img alt="Brand publicity" src={mobileImageUrl} className="mobile_image" />
          </a>
        ) : (
          <img alt="Brand publicity" src={mobileImageUrl} className="mobile_image" />
        )
      ) : null}
    </div>
  );
};

export default ClaimForm;
