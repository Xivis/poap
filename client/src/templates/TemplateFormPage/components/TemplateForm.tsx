import React, { FC } from 'react';
import { Tooltip } from 'react-lightweight-tooltip';
import { Formik, Form, FormikActions } from 'formik';

// lib
import { generateSecretCode } from '../../../lib/helpers';

// components
import { ImageContainer } from '../../../backoffice/EventsPage';
import { ColorPicker } from './ColorPicker';
import { SubmitButton } from '../../../components/SubmitButton';
import { EventField } from '../../../backoffice/EventsPage';

// assets
import infoButton from '../../../images/info-button.svg';

import { createTemplate } from '../../../api';

const initialValues = {
  name: '',
  title_image: '',
  title_link: '',
  header_link_text: '',
  header_link_url: '',
  header_color: '',
  header_link_color: '',
  main_color: '',
  footer_color: '',
  left_image_url: '',
  left_image_link: '',
  right_image_url: '',
  right_image_link: '',
  mobile_image_url: '',
  mobile_image_link: '',
  footer_icon: '',
  secret_code: generateSecretCode(),
};

const validationSchema = {};

type TemplatePageFormValues = {
  name: string;
  title_image: Blob | string;
  title_link: string;
  header_link_text: string;
  header_link_url: string;
  header_color: string;
  header_link_color: string;
  main_color: string;
  footer_color: string;
  left_image_url: Blob | string;
  left_image_link: string;
  right_image_url: Blob | string;
  right_image_link: string;
  mobile_image_url: Blob | string;
  mobile_image_link: string;
  footer_icon: Blob | string;
  secret_code: string;
};

type SetFieldValue = FormikActions<TemplatePageFormValues>['setFieldValue'];

type Props = {
  id?: number;
};

export const TemplateForm: FC<Props> = ({ id }) => {
  // handlers
  const onSubmit = (
    values: TemplatePageFormValues,
    formikActions: FormikActions<TemplatePageFormValues>
  ) => {
    const formData = new FormData();

    Object.entries(values).forEach(([key, value]: [string, string | Blob]) => {
      formData.append(key, typeof value === 'number' ? String(value) : value);
    });

    createTemplate(formData).finally(() => {
      formikActions.setSubmitting(false);
    });
  };

  // constants
  const warning = (
    <div className={'backoffice-tooltip'}>
      {id ? (
        <span>
          Be sure to save the 6 digit <b>Edit Code</b> to make any further updateTemplates
        </span>
      ) : (
        <span>
          Be sure to complete the 6 digit <b>Edit Code</b> that was originally used
        </span>
      )}
    </div>
  );

  const editLabel = (
    <>
      <b>Edit Code</b>
      <Tooltip content={warning}>
        <img alt="Informative icon" src={infoButton} className={'info-button'} />
      </Tooltip>
    </>
  );

  return (
    <div className={'bk-container'}>
      <Formik
        initialValues={initialValues}
        validateOnBlur={false}
        validateOnChange={false}
        validationSchema={validationSchema}
        onSubmit={onSubmit}
      >
        {({ values, errors, isSubmitting, setFieldValue }) => {
          console.log('isSubmitting', isSubmitting);
          const handleFileChange = (
            event: React.ChangeEvent<HTMLInputElement>,
            setFieldValue: SetFieldValue,
            name: string
          ) => {
            event.preventDefault();
            const { files } = event.target;

            if (!files || !files.length) return;

            const firstFile = files[0];
            setFieldValue(name, firstFile);
          };

          return (
            <Form>
              <h2>{`${id ? 'Update' : 'Create'}`} Event</h2>
              <EventField title="Name of the POAP" name="name" />
              <div className="bk-group">
                <ColorPicker
                  title="Header's color"
                  name="header_color"
                  setFieldValue={setFieldValue}
                  values={values}
                />
                <ColorPicker
                  title="Header's link color"
                  name="header_link_color"
                  setFieldValue={setFieldValue}
                  values={values}
                />
              </div>
              <div className="bk-group">
                <ColorPicker
                  title="Main color"
                  name="main_color"
                  setFieldValue={setFieldValue}
                  values={values}
                />
                <ColorPicker
                  title="Footer's color"
                  name="footer_color"
                  setFieldValue={setFieldValue}
                  values={values}
                />
              </div>
              <div className="bk-group">
                <ImageContainer
                  name="title_image"
                  text="Title's image"
                  handleFileChange={handleFileChange}
                  setFieldValue={setFieldValue}
                  errors={errors}
                  shouldShowInfo={false}
                />
                <EventField title="Title's link" name="title_link" />
              </div>
              <div className="bk-group">
                <EventField title="Header's text" name="header_link_text" />
                <EventField title="Header's text link" name="header_link_url" />
              </div>
              <div className="bk-group">
                <ImageContainer
                  name="left_image_url"
                  text="Left image"
                  handleFileChange={handleFileChange}
                  setFieldValue={setFieldValue}
                  errors={errors}
                  shouldShowInfo={false}
                />
                <EventField title="Left image's link" name="left_image_link" />
              </div>
              <div className="bk-group">
                <ImageContainer
                  name="right_image_url"
                  text="Right image"
                  handleFileChange={handleFileChange}
                  setFieldValue={setFieldValue}
                  errors={errors}
                  shouldShowInfo={false}
                />
                <EventField title="Right image's link" name="right_image_link" />
              </div>
              <div className="bk-group">
                <ImageContainer
                  name="mobile_image_url"
                  text="Mobile image"
                  handleFileChange={handleFileChange}
                  setFieldValue={setFieldValue}
                  errors={errors}
                  shouldShowInfo={false}
                />
                <EventField title="Mobile image's link" name="mobile_image_link" />
              </div>
              <div className="bk-group">
                <ImageContainer
                  text="Footer's logo"
                  name="footer_icon"
                  handleFileChange={handleFileChange}
                  setFieldValue={setFieldValue}
                  errors={errors}
                  shouldShowInfo={false}
                />
                <EventField title={editLabel} name="secret_code" />
              </div>
              <SubmitButton canSubmit text="Save" isSubmitting={isSubmitting} />
            </Form>
          );
        }}
      </Formik>
    </div>
  );
};
