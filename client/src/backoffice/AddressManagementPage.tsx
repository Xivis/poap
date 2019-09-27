import React, { FC, useState, useEffect } from 'react';
import classNames from 'classnames';

/* Libraries */
import ReactModal from 'react-modal';
import { Formik, FormikActions, Form, Field, FieldProps, ErrorMessage } from 'formik';

/* Helpers */
import { GasPriceSchema } from '../lib/schemas';
import { getSigners, setSigner, AdminAddress } from '../api';
import { convertToGWEI, convertFromGWEI, convertToETH, reduceAddress } from '../lib/helpers';

/* Components */
import { SubmitButton } from '../components/SubmitButton';
import { Loading } from '../components/Loading';

/* Assets */
import edit from '../images/edit.svg';

type GasPriceFormValues = {
  gasPrice: string;
};

ReactModal.setAppElement('#root');

const AddressManagementPage: FC = () => {
  const [isFetchingAddresses, setIsFetchingAddresses] = useState<null | boolean>(null);
  const [addresses, setAddresses] = useState<null | AdminAddress[]>(null);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [selectedAddress, setSelectedAddress] = useState<null | AdminAddress>(null);

  useEffect(() => {
    fetchSigners();
  }, []);

  const fetchSigners = () => {
    setIsFetchingAddresses(true);
    setAddresses(null);

    getSigners()
      .then(addresses => {
        if (!addresses) return;
        setAddresses(addresses);
      })
      .catch(error => console.error(error))
      .finally(() => setIsFetchingAddresses(false));
  }

  const handleFormSubmit = async (
    values: GasPriceFormValues,
    actions: FormikActions<GasPriceFormValues>
  ) => {
    if (!selectedAddress) return;
    try {
      actions.setStatus(null);
      actions.setSubmitting(true);

      const gasPriceInWEI = convertFromGWEI(values.gasPrice);
      await setSigner(selectedAddress.id, gasPriceInWEI);
      fetchSigners();
      closeEditModal();
    } catch (error) {
      actions.setStatus({ ok: false, msg: `Gas price couldn't be changed` });
    } finally {
      actions.setSubmitting(false);
    }
  };

  const openEditModal = (address: AdminAddress) => {
    setModalOpen(true);
    setSelectedAddress(address);
  };

  const closeEditModal = () => {
    setModalOpen(false);
    setSelectedAddress(null);
  };


  return (
    <div className={'admin-table'}>
      <h2>Admin addresses management</h2>
      <div className={'row table-header'}>
        <div className={'col-xs-1 center'}>#</div>
        <div className={'col-xs-5'}>Address</div>
        <div className={'col-xs-2'}>Role</div>
        <div className={'col-xs-2 center'}>Balance (ETH)</div>
        <div className={'col-xs-2 center'}>Gas Price (GWei)</div>
      </div>
      <div className={'admin-table-row'}>
        {isFetchingAddresses && <Loading />}
        {addresses && addresses.map((address, i) => {
          return (
            <div className={`row ${i % 2 === 0 ? 'even' : 'odd'}`} key={address.id}>
              <div className={'col-xs-1 center'}>{address.id}</div>
              <div className={'col-xs-5'}>
                <a href={`https://etherscan.io/address/${address.signer}`} target={"_blank"}>{reduceAddress(address.signer)}</a>
              </div>
              <div className={'col-xs-2 capitalize'}>{address.role}</div>
              <div className={'col-xs-2 center'}>
                {Math.round(convertToETH(address.balance) * 1000) / 1000}
              </div>
              <div className={'col-xs-2 center'}>
                {convertToGWEI(address.gas_price)}
                <img src={edit} alt={'Edit'} className={'edit-icon'} onClick={() => openEditModal(address)} />
              </div>
            </div>
          )
        })}
      </div>
      <ReactModal
        isOpen={modalOpen}
        shouldFocusAfterRender={true}
      >
        <div>
          <h3>Edit Gas Price</h3>
          {selectedAddress &&
            <Formik
              enableReinitialize
              onSubmit={handleFormSubmit}
              initialValues={{ gasPrice: convertToGWEI(selectedAddress.gas_price) }}
              validationSchema={GasPriceSchema}
            >
              {({ dirty, isValid, isSubmitting, status, touched }) => {
                return (
                  <Form className="price-gas-modal-form">
                    <Field
                      name="gasPrice"
                      render={({ field, form }: FieldProps) => {
                        return (
                          <input
                            type="text"
                            autoComplete="off"
                            className={classNames(!!form.errors[field.name] && 'error')}
                            placeholder={'Gas price in GWEI'}
                            {...field}
                          />
                        );
                      }}
                    />
                    <ErrorMessage name="gasPrice" component="p" className="bk-error"/>
                    {status && (
                      <p className={status.ok ? 'bk-msg-ok' : 'bk-msg-error'}>{status.msg}</p>
                    )}
                    <SubmitButton
                      text="Modify gas price"
                      isSubmitting={isSubmitting}
                      canSubmit={isValid && dirty}
                    />
                    <div onClick={closeEditModal} className={'close-modal'}>
                      Cancel
                    </div>
                  </Form>
                );
              }}
            </Formik>
          }
        </div>
      </ReactModal>
    </div>
  );
};

export { AddressManagementPage };
