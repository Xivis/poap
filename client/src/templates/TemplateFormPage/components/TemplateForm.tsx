import React, { FC, useCallback, useMemo } from 'react';
import { Tooltip } from 'react-lightweight-tooltip';
import { useHistory } from 'react-router-dom';
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

// api
import { createTemplate, updateTemplate, getTemplateById } from '../../../api';

// helpers
import { useAsync } from '../../../react-helpers';

import { templateFormSchema } from '../../../lib/schemas';

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
  // methods
  const fetchTemplate = useCallback(() => (id ? getTemplateById(id) : null), [id]);

  // TODO: check this type
  // custom hooks
  const [template]: any = useAsync(fetchTemplate);

  // router hooks
  const history = useHistory();

  // handlers
  const onSubmit = (
    values: TemplatePageFormValues,
    formikActions: FormikActions<TemplatePageFormValues>
  ) => {
    const formData = new FormData();

    Object.entries(values).forEach(([key, value]: [string, string | Blob]) => {
      if (id) {
        if (
          (key.includes('image_url') ||
            key.includes('footer_icon') ||
            key.includes('title_image')) &&
          typeof value === 'string'
        ) {
          return;
        }
        formData.append(key, typeof value === 'number' ? String(value) : value);
      } else {
        formData.append(key, typeof value === 'number' ? String(value) : value);
      }
    });

    id
      ? updateTemplate(formData, id)
          .then(() => history.push('/admin/template'))
          .catch((error: Error) => console.error(error.message))
          .finally(() => {
            formikActions.setSubmitting(false);
          })
      : createTemplate(formData)
          .then(() => history.push('/admin/template'))
          .catch((error: Error) => console.error(error.message))
          .finally(() => {
            formikActions.setSubmitting(false);
          });
  };

  // constants
  const initialValues = useMemo(() => {
    if (template) {
      const values = {
        ...template,
        secret_code: template.secret_code ? template.secret_code.toString().padStart(6, '0') : '',
      };

      return values;
    } else {
      const values: TemplatePageFormValues = {
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

      return values;
    }
  }, [template]); /* eslint-disable-line react-hooks/exhaustive-deps */

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

  const editLabel = ({
    label,
    tooltipContent,
    tooltipText,
  }: {
    label: string;
    tooltipContent?: React.ReactNode;
    tooltipText?: string;
  }) => (
    <div className="info-label-container">
      <b className="info-label">{label}</b>
      <Tooltip content={tooltipContent ? tooltipContent : tooltipText}>
        <img alt="Informative icon" src={infoButton} className={'info-button'} />
      </Tooltip>
    </div>
  );

  return (
    <div className={'bk-container'}>
      <Formik
        enableReinitialize
        initialValues={initialValues}
        validateOnBlur={false}
        validateOnChange={false}
        validationSchema={templateFormSchema}
        onSubmit={onSubmit}
      >
        {({ values, errors, isSubmitting, setFieldValue }) => {
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
                <div>
                  <ImageContainer
                    name="title_image"
                    text="Title's image"
                    customLabel={editLabel({ label: "Title's image", tooltipText: 'Specs' })}
                    handleFileChange={handleFileChange}
                    setFieldValue={setFieldValue}
                    errors={errors}
                    shouldShowInfo={false}
                  />
                  {values?.title_image && typeof values?.title_image === 'string' && (
                    <img
                      alt={values.title_image}
                      src={values.title_image}
                      className={'template_image_preview'}
                    />
                  )}
                </div>
                <EventField title="Title's redirect link" name="title_link" />
              </div>
              <div className="bk-group">
                <EventField title="Header's text" name="header_link_text" />
                <EventField title="Header's text redirect link" name="header_link_url" />
              </div>
              <div className="bk-group">
                <div>
                  <ImageContainer
                    name="left_image_url"
                    text="Left image"
                    customLabel={editLabel({ label: 'Left image', tooltipText: 'Specs' })}
                    handleFileChange={handleFileChange}
                    setFieldValue={setFieldValue}
                    errors={errors}
                    shouldShowInfo={false}
                  />
                  {values?.left_image_url && typeof values?.left_image_url === 'string' && (
                    <img
                      alt={values.left_image_url}
                      src={values.left_image_url}
                      className={'template_image_preview'}
                    />
                  )}
                </div>
                <EventField title="Left image's redirect link" name="left_image_link" />
              </div>
              <div className="bk-group">
                <div>
                  <ImageContainer
                    name="right_image_url"
                    customLabel={editLabel({ label: 'Right image', tooltipText: 'Specs' })}
                    text="Right image"
                    handleFileChange={handleFileChange}
                    setFieldValue={setFieldValue}
                    errors={errors}
                    shouldShowInfo={false}
                  />
                  {values?.right_image_url && typeof values?.right_image_url === 'string' && (
                    <img
                      alt={values.right_image_url}
                      src={values.right_image_url}
                      className={'template_image_preview'}
                    />
                  )}
                </div>
                <EventField title="Right image's redirect link" name="right_image_link" />
              </div>
              <div className="bk-group">
                <div>
                  <ImageContainer
                    name="mobile_image_url"
                    customLabel={editLabel({ label: 'Mobile image', tooltipText: 'Specs' })}
                    text="Mobile image"
                    handleFileChange={handleFileChange}
                    setFieldValue={setFieldValue}
                    errors={errors}
                    shouldShowInfo={false}
                  />
                  {values?.mobile_image_url && typeof values?.mobile_image_url === 'string' && (
                    <img
                      alt={values.mobile_image_url}
                      src={values.mobile_image_url}
                      className={'template_image_preview'}
                    />
                  )}
                </div>
                <EventField title="Mobile image's redirect link" name="mobile_image_link" />
              </div>
              <div className="bk-group">
                <div>
                  <ImageContainer
                    text="Footer's logo"
                    customLabel={editLabel({ label: "Footer's logo", tooltipText: 'Specs' })}
                    name="footer_icon"
                    handleFileChange={handleFileChange}
                    setFieldValue={setFieldValue}
                    errors={errors}
                    shouldShowInfo={false}
                  />
                  {values?.footer_icon && typeof values?.footer_icon === 'string' && (
                    <img
                      alt={values.footer_icon}
                      src={values.footer_icon}
                      className={'template_image_preview'}
                    />
                  )}
                </div>
                <EventField
                  title={editLabel({ label: 'Edit Code', tooltipContent: warning })}
                  name="secret_code"
                />
              </div>
              <SubmitButton canSubmit text="Save" isSubmitting={isSubmitting} />
            </Form>
          );
        }}
      </Formik>
    </div>
  );
};
