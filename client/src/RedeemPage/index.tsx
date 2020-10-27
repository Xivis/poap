import React, { FC, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import delve from 'dlv';
import { useToasts } from 'react-toast-notifications';
import classNames from 'classnames';
import { Formik, Form, Field, FieldProps } from 'formik';

// components
import { ScanHeader, ScanFooter } from '../ScanPage';
import { SubmitButton } from '../components/SubmitButton';

// lib
import { RedeemSchema } from '../lib/schemas';

// api
import { redeemWithEmail, TokenInfo, getTokensFor } from '../api';
import { RouteComponentProps } from 'react-router-dom';

type RedeemFormValues = {
  address: string;
};

const initialValues = { address: '' };

export const RedeemPage: FC<RouteComponentProps> = ({ match }) => {
  // react hooks
  const [isRedeemLoading, setIsRedeemLoading] = useState<boolean>(false);
  const [tokens, setTokens] = useState<TokenInfo[]>([]);

  // lib hooks
  const { addToast } = useToasts();

  // constants
  const uid = delve(match, 'params.uid');
  const email = delve(match, 'params.email');

  // effects
  useEffect(() => {
    getTokens();
  }, []) // eslint-disable-line

  // methods
  const getTokens = async () => {
    try {
      // TODO: Uncomment next line when backend supports email
      // How do we get the email? Will `/actions/scan/${email}` be a valid endpoint?
      // const tokens = await getTokensFor(email);

      // TODO: Remove next line when backend supports email
      const mockAddress = '0x5A384227B65FA093DEC03Ec34e111Db80A040615';
      const tokens = await getTokensFor(mockAddress);

      setTokens(tokens);
    } catch (error) {
      addToast(error.message, {
        appearance: 'error',
        autoDismiss: false,
      });
    }
  };

  // handlers
  const handleForm = async (values: RedeemFormValues) => {
    setIsRedeemLoading(true);
    const { address } = values;

    redeemWithEmail(address, uid)
      .then(() => {
        addToast('POAPs loaded successfully', {
          appearance: 'error',
          autoDismiss: false,
        });
      })
      .catch((error) => {
        addToast(error.message, {
          appearance: 'error',
          autoDismiss: false,
        });
      })
      .finally(() => setIsRedeemLoading(false));
  };

  return (
    <div className="landing">
      <ScanHeader sectionName="Redeem" />

      <div className="redeem-content-container">
        <Formik enableReinitialize onSubmit={handleForm} initialValues={initialValues} validationSchema={RedeemSchema}>
          {({ dirty, isValid, handleChange, values }) => {
            return (
              <Form className="claim-form">
                <span className="redeem-text">
                  This POAPs were claimed with email <span>{email}</span>, please enter your Ethereum address or ENS to
                  claim them
                </span>
                <Field
                  name="hash"
                  render={({ field, form }: FieldProps) => {
                    return (
                      <input
                        type="text"
                        autoComplete="off"
                        className={classNames('width500', !!form.errors[field.name] && 'error')}
                        placeholder="Input your Ethereum address or ENS"
                        name="address"
                        onChange={handleChange}
                        value={values.address}
                      />
                    );
                  }}
                />
                <SubmitButton
                  className="mb-24"
                  text="Continue"
                  isSubmitting={isRedeemLoading}
                  canSubmit={isValid && dirty}
                />
              </Form>
            );
          }}
        </Formik>

        <div className="redeem-text-container">
          <span className="redeem-text">Here is the list of the POAPs to be claimed:</span>
        </div>

        <div className="redeem-poaps-container events-logos">
          {tokens.length > 0 ? (
            tokens.map((token: TokenInfo) => (
              <Link
                key={token.tokenId}
                to={{ pathname: `/token/${token.tokenId}` }}
                className="event-circle"
                data-aos="fade-up"
              >
                {typeof token.event.image_url === 'string' && (
                  <img src={token.event.image_url} alt={token.event.name} />
                )}
              </Link>
            ))
          ) : (
            <span>Loading Tokens</span>
          )}
        </div>
      </div>

      <ScanFooter path="home" />
    </div>
  );
}
