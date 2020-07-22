import * as yup from 'yup';

import { IMAGE_SUPPORTED_FORMATS } from './constants';

const AddressSchema = yup.object().shape({
  address: yup.string().required(),
});

const GasPriceSchema = yup.object().shape({
  gasPrice: yup.number().required().positive(),
});

const EMAIL_REGEX = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;
const ETH_REGEX = /.*\.eth$/;

const AddressPageSchema = yup.object().shape({
  address: yup
    .mixed()
    .test({
      test: (value) => {
        if (EMAIL_REGEX.test(value) || ETH_REGEX.test(value)) {
          return true;
        }

        return false;
      },
    })
    .required(),
});

const BurnFormSchema = yup.object().shape({
  tokenId: yup.number().required().positive().integer(),
});

const fileSchema = yup
  .mixed()
  .test('fileFormat', 'Unsupported format, please upload a png file', (value) =>
    IMAGE_SUPPORTED_FORMATS.includes(value.type),
  );

const PoapEventSchema = yup.object().shape({
  name: yup.string().required('A unique name is required'),
  year: yup
    .number()
    .required()
    .min(1990)
    .max(new Date().getFullYear() + 1),
  id: yup.number(),
  description: yup.string(),
  start_date: yup.string().required('The start date is required'),
  end_date: yup.string().required('The end date is required'),
  city: yup.string(),
  country: yup.string(),
  event_url: yup.string().url(),
  image: yup.mixed().when('isFile', {
    is: (value) => value,
    then: fileSchema,
    otherwise: yup.string(),
  }),
  secret_code: yup
    .string()
    .required('The secret code is required')
    .matches(/^[0-9]{6}$/, 'Must be exactly 6 digits'),
});

const IssueForEventFormValueSchema = yup.object().shape({
  eventId: yup.number().required().min(1),
  addressList: yup.string().required(),
  signer: yup
    .string()
    .required()
    .matches(/^0x[0-9a-fA-F]{40}$/, 'Not a valid address'),
});

const IssueForUserFormValueSchema = yup.object().shape({
  eventIds: yup.array().of(yup.number().min(1)).required().min(1),
  address: yup.string().required(),
  signer: yup
    .string()
    .required()
    .matches(/^0x[0-9a-fA-F]{40}$/, 'Not a valid address'),
});

const ClaimHashSchema = yup.object().shape({
  hash: yup.string().required().length(6),
});

const InboxFormSchema = yup.object().shape({
  title: yup.string().required(),
  description: yup.string().required(),
  recipientFilter: yup.string().required(),
  notificationType: yup.string().required(),
  selectedEvent: yup.number().nullable(),
});

const UpdateModalWithFormikRangeSchema = yup.object().shape({
  from: yup.number().positive().required(),
  to: yup.number().positive().required(),
});

const UpdateModalWithFormikListSchema = yup.object().shape({
  hashesList: yup.string().required(),
  event: yup
    .string()
    .matches(/^[0-9]{1,}$/)
    .required(),
});

const UpdateModalWithFormikSelectedQrsSchema = yup.object().shape({});

export {
  AddressSchema,
  GasPriceSchema,
  BurnFormSchema,
  PoapEventSchema,
  ClaimHashSchema,
  IssueForEventFormValueSchema,
  IssueForUserFormValueSchema,
  InboxFormSchema,
  UpdateModalWithFormikRangeSchema,
  UpdateModalWithFormikSelectedQrsSchema,
  UpdateModalWithFormikListSchema,
  AddressPageSchema,
};
