import React, { useState, useEffect } from 'react';
import classNames from 'classnames';
import { ErrorMessage, Field, FieldProps, Form, Formik, FormikActions } from 'formik';
import ReactModal from 'react-modal';

/* Helpers */
import { tryGetAccount } from '../poap-eth';
import { HashClaim, postClaimHash } from '../api';
import { AddressSchema } from '../lib/schemas';
import { hasWeb3 } from '../poap-eth';

/* Components */
import { SubmitButton } from '../components/SubmitButton';
import ClaimFooterMessage from './ClaimFooterMessage';

/* Assets */
// import checkbox from '../images/check-box.svg';
// import checkboxEmpty from '../images/check-box-empty.svg';

type QRFormValues = {
  address: string;
};

/*
 * @dev: Form component to get the address and submit mint request
 * Logic behind web3 enabled status
 * We will always try to populate the address field, but as Metamask requires
 * that the user 'connect' their wallet to the site (`ethereum.enable()`),
 * we ask if the user has a web3 instance that is not Metamask or if it's, it should
 * be already logged-in: `if(enabledWeb3 && (!hasMetamask() || isMetamaskLogged()))`
 * If the user has another provider, we will try to get the account at the moment
 * */
const ClaimForm: React.FC<{
  claim: HashClaim;
  web3Claim: boolean;
  onSubmit: () => void;
}> = ({ claim, onSubmit, web3Claim }) => {
  const [enabledWeb3, setEnabledWeb3] = useState<boolean | null>(null);
  const [account, setAccount] = useState<string>('');
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  // const [delegatedMint, setDelegatedMint] = useState<boolean>(web3Claim);

  useEffect(() => {
    // getAddress();
    hasWeb3().then(setEnabledWeb3);
  }, []);

  // useEffect(() => {
  //   if (account) {
  //     setDelegatedMint(true);
  //   }
  // }, [account]);

  const getAddress = () => {
    tryGetAccount()
      .then(address => {
        if (address) setAccount(address);
      })
      .catch(e => {
        console.log('Error while fetching account: ', e);
      });
  };

  // const updateDelegateSelection = () => {
  //   if (web3Claim) return
  //   setDelegatedMint(!delegatedMint);
  // }

  const handleFormSubmit = async (values: QRFormValues, actions: FormikActions<QRFormValues>) => {
    try {
      actions.setSubmitting(true);
      await postClaimHash(
        claim.qr_hash.toLowerCase(),
        values.address.toLowerCase(),
        claim.secret,
        web3Claim
      );
      onSubmit();
    } catch (error) {
      actions.setStatus({
        ok: false,
        msg: `Badge couldn't be claimed: ${error.message}`,
      });
    } finally {
      actions.setSubmitting(false);
    }
  };

  // const openModal = () => {
  //   setModalOpen(true);
  // };

  const closeModal = () => {
    setModalOpen(false);
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
                        className={classNames(!!form.errors[field.name] && 'error')}
                        placeholder={'Input your Ethereum address or ENS name'}
                        {...field}
                      />
                    );
                  }}
                />
                <div className={'claim-delegated-selector'}>

                  {/* if not web3 claim, do not show any option */}

                  {/*{!web3Claim &&*/}
                  {/*  <>*/}
                  {/*    <img src={delegatedMint ? checkbox : checkboxEmpty}*/}
                  {/*         alt={'Selector'} className={'checkbox'}*/}
                  {/*         onClick={updateDelegateSelection}*/}
                  {/*    />*/}
                  {/*    <div className={'text-holder'}>*/}
                  {/*      <span onClick={updateDelegateSelection}>I want to claim the POAP with my account.</span> <a href={'#'} onClick={openModal}>Learn more</a>*/}
                  {/*    </div>*/}
                  {/*  </>*/}
                  {/*}*/}

                </div>
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
                  isSubmitting={isSubmitting}
                  canSubmit={isValid}
                />
              </Form>
            );
          }}
        </Formik>
      </div>
      <ClaimFooterMessage />
      <ReactModal isOpen={modalOpen} shouldFocusAfterRender={true}>
        <div className={'help-modal'}>
          <h3>POAP claims</h3>
          <div>
            <p>Do you want to get your POAP faster?</p>
            <p>
              The Ethereum network tends to gets congested and Gas prices skyrocket. We can't cover a high Gas price for everyone,
              so if you want, submit the claim from your address at a higher Gas price.
            </p>
            <p>Don't worry if you don't have ETH to pay for it, we've got you covered. Just please be patient!</p>
          </div>
          <div>
            <div onClick={closeModal} className={'close-modal'}>
              Close
            </div>
          </div>

        </div>
      </ReactModal>
    </div>
  );
};

export default ClaimForm;
