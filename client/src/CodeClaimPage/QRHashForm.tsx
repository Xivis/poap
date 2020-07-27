import React, {useState}  from 'react';
import classNames from 'classnames';
import ReactModal from 'react-modal';

import { Formik, Form, Field, FieldProps } from 'formik';

/* Schemas */
import { ClaimHashSchema } from '../lib/schemas';
/* Components */
import { SubmitButton } from '../components/SubmitButton';
import ClaimFooterMessage from './ClaimFooterMessage';

type HashFormValues = {
  hash: string;
};

/*
* @dev: Form component to get the QR if code was not scanned
* */
const QRHashForm: React.FC<{error: boolean, loading: boolean, checkClaim: (hash: string) => void}> = ({error, loading, checkClaim}) => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(true)

  // handlers
  const handleForm = (
    values: HashFormValues
  ) => {
    checkClaim(values.hash)
  };

  const handleModal = () => setIsModalOpen(false);

  return (
    <div className={'container'}>
      <div>
        <Formik
          enableReinitialize
          onSubmit={handleForm}
          initialValues={{ hash: '' }}
          validationSchema={ClaimHashSchema}
        >
          {({ dirty, isValid }) => {
            return (
              <Form className="claim-form">
                <div className={'web3-browser'}>
                  Please complete the form below to continue
                </div>
                <Field
                  name="hash"
                  render={({ field, form }: FieldProps) => {
                    return (
                      <input
                        type="text"
                        autoComplete="off"
                        className={classNames(!!form.errors[field.name] && 'error')}
                        placeholder={'Six-digit code'}
                        {...field}
                      />
                    );
                  }}
                />
                {error && (
                  <p className={'bk-msg-error'}>
                    We couldn't find the code, please try again.
                  </p>
                )}
                <SubmitButton
                  text="Continue"
                  isSubmitting={loading}
                  canSubmit={isValid && dirty}
                />
              </Form>
            );
          }}
        </Formik>
      </div>
      <ClaimFooterMessage />

      <ReactModal isOpen={isModalOpen} shouldFocusAfterRender={true}>
        <div className="admin-list-modal">
          <div className='claim-modal-text-container'>
            <p>The current surge in gas prices makes a POAP minting have a cost of between $2 and $6 in mining fees.</p>
            <p>We are working hard on a scaling solution that should be ready in 6-8 weeks. </p>
            <p>In the meantime please input your address in the field below and click on claim. 
              That’s going to block this POAP to be minted for free once our new deployment is ready. 
              Afterwards you can continue the process at your expense or just close this page. 
              For learning more about what our plans are visit our discord. 
            </p>
            <p><a href="http://poap.xyz/discord" target="_blank" rel="noopener noreferrer">http://poap.xyz/discord</a></p>
          </div>
          <div className="claim-modal-cancel-container">
            <div onClick={() => handleModal()} className={'close-modal'}>
              Close
            </div>
          </div>
        </div>
      </ReactModal>
    </div>
  );
};

export default QRHashForm;
