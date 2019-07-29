import React, { FC } from 'react';
import { Switch, Route } from 'react-router-dom';
import { Formik, Form, Field } from 'formik';
import * as yup from 'yup';

/* Helpers */
import { ADDRESS_REGEXP } from '../lib/constants';

const BurnPage: FC = () => {
  return (
    <Switch>
      <Route exact path="/admin/burn" component={BurnForm} />
      <Route exact path="/admin/burn/:tokenId" component={BurnToken} />
    </Switch>
  );
};

const BurnFormSchema = yup.object().shape({
  token: yup
    .string()
    .matches(ADDRESS_REGEXP, 'Must be a valid Ethereum Address')
    .nullable(),
});

const BurnForm: FC = () => {
  return (
    <div>
      <h2>My Form</h2>
      <Formik
        initialValues={{ token: '' }}
        validationSchema={BurnFormSchema}
        onSubmit={values => {
          // same shape as initial values
          console.log(values);
        }}
      >
        {({ errors, touched }) => (
          <Form>
            <Field name="token" />
            {errors.token && touched.token ? <div>{errors.token}</div> : null}
            <button type="submit">Burn</button>
          </Form>
        )}
      </Formik>
    </div>
  );
};

const BurnToken: FC = () => {
  return <div>hola soy el token</div>;
};

export { BurnPage };
