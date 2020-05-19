import React, { FC, useState, useEffect } from 'react';
import classNames from 'classnames';

/* Libraries */
import ReactModal from 'react-modal';
import { ErrorMessage, Field, FieldProps, Form, Formik, FormikActions } from 'formik';

/* Helpers */
import { PoapSettingSchema } from '../lib/schemas';
import { getSettings, setSetting, PoapSetting } from '../api';
/* Components */
import { Loading } from '../components/Loading';
import { SubmitButton } from '../components/SubmitButton';
/* Assets */
import edit from '../images/edit.svg';

type PoapSettingFormValues = {
  setting: string;
};

const SettingsPage: FC = () => {
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [selectedSetting, setSelectedSetting] = useState<null | PoapSetting>(null);
  const [isFetchingSettings, setIsFetchingSettings] = useState<null | boolean>(null);
  const [settings, setSettings] = useState<null | PoapSetting[]>(null);

  useEffect(() => {
    fetchSettings();
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */

  const fetchSettings = () => {
    setIsFetchingSettings(true);
    setSettings(null);

    getSettings()
      .then(response => {
        if (!response) return;
        setSettings(response);
      })
      .catch(error => console.error(error))
      .finally(() => setIsFetchingSettings(false));
  };

  const handleFormSubmit = async (
    values: PoapSettingFormValues,
    actions: FormikActions<PoapSettingFormValues>
  ) => {
    if (!selectedSetting) return;
    try {
      actions.setStatus(null);
      actions.setSubmitting(true);
      await setSetting(selectedSetting.id, values.setting);
      fetchSettings();
      closeEditModal();
    } catch (error) {
      actions.setStatus({ ok: false, msg: `Setting couldn't be updated` });
    } finally {
      actions.setSubmitting(false);
    }
  };

  const openEditModal = (setting: PoapSetting) => {
    setModalOpen(true);
    setSelectedSetting(setting);
  };

  const closeEditModal = () => {
    setModalOpen(false);
    setSelectedSetting(null);
  };

  return (
    <div className={'admin-table settings'}>
      <h2>Settings</h2>
      <div className={'row table-header visible-md'}>
        <div className={'col-md-6'}>Setting</div>
        <div className={'col-md-3 center'}>Type</div>
        <div className={'col-md-3 center'}>Value</div>
      </div>
      <div className={'admin-table-row'}>
        {isFetchingSettings && <Loading />}

        {settings &&
          settings.map((each, i) => {
            return (
              <div className={`row ${i % 2 === 0 ? 'even' : 'odd'}`} key={each.id}>
                <div className={'col-md-6'}>
                  <span className={'visible-sm'}>Setting: </span>
                  <h4>{each.name}</h4>
                  <div>{each.description}</div>
                </div>
                <div className={'col-md-3 center'}>
                  <span className={'visible-sm'}>Type: </span>
                  {each.type}
                </div>
                <div className={'col-md-3 center'}>
                  <span className={'visible-sm'}>Value: </span>
                  {each.value}
                  <img
                    src={edit}
                    alt={'Edit'}
                    className={'edit-icon'}
                    onClick={() => openEditModal(each)}
                  />
                </div>
              </div>
            );
          })}

        {settings && settings.length === 0 && !isFetchingSettings && (
          <div className={'no-results'}>No settings found</div>
        )}
      </div>
      <ReactModal isOpen={modalOpen} shouldFocusAfterRender={true}>
        <div>
          <h3>Edit Setting</h3>
          {selectedSetting && (
            <>
              <div className={'description'}>
                Modify setting <b>{selectedSetting.name}</b>
              </div>
              <Formik
                enableReinitialize
                onSubmit={handleFormSubmit}
                initialValues={{ setting: selectedSetting.value }}
                validationSchema={PoapSettingSchema}
              >
                {({ dirty, isValid, isSubmitting, status }) => {
                  return (
                    <Form className="settings-modal-form">
                      <Field
                        name="setting"
                        render={({ field, form }: FieldProps) => {
                          return (
                            <input
                              type="text"
                              autoComplete="off"
                              className={classNames(!!form.errors[field.name] && 'error')}
                              placeholder={selectedSetting.description}
                              {...field}
                            />
                          );
                        }}
                      />
                      <ErrorMessage name="setting" component="p" className="bk-error" />
                      {status && (
                        <p className={status.ok ? 'bk-msg-ok' : 'bk-msg-error'}>{status.msg}</p>
                      )}
                      <SubmitButton
                        text="Submit"
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
            </>
          )}
        </div>
      </ReactModal>
    </div>
  );
};

export { SettingsPage };
