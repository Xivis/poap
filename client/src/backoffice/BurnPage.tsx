import React, { FC, useEffect, useState } from 'react';
import { Switch, Route, RouteComponentProps } from 'react-router-dom';
import { Formik, Form, Field, FieldProps, ErrorMessage } from 'formik';
import classNames from 'classnames';
import delve from 'dlv';

/* Helpers */
import { getTokenInfo, TokenInfo, burnToken } from '../api';
import { BurnFormSchema } from '../lib/schemas';
/* Components */
import { SubmitButton } from '../components/SubmitButton';

const BurnPage: FC = () => {
  return (
    <Switch>
      <Route exact path="/admin/burn" component={BurnForm} />
      <Route exact path="/admin/burn/:tokenId" component={BurnToken} />
    </Switch>
  );
};

const BurnForm: FC<RouteComponentProps> = ({ history }) => {
  return (
    <div className="content-event aos-init aos-animate" data-aos="fade-up" data-aos-delay="300">
      <p>From here you will be able to search and burn any token you desire</p>
      <Formik
        initialValues={{ tokenId: '' }}
        validationSchema={BurnFormSchema}
        onSubmit={values => history.push(`/admin/burn/${values.tokenId}`)}
      >
        {({ dirty, isValid, isSubmitting }) => (
          <Form className="login-form">
            <Field
              name="tokenId"
              render={({ field, form }: FieldProps) => (
                <input
                  type="text"
                  autoComplete="off"
                  placeholder="178223"
                  className={classNames(!!form.errors[field.name] && 'error')}
                  {...field}
                />
              )}
            />
            <ErrorMessage name="token" component="p" className="bk-error" />
            <SubmitButton text="Burn" isSubmitting={isSubmitting} canSubmit={isValid && dirty} />
          </Form>
        )}
      </Formik>
    </div>
  );
};

const BurnToken: FC = props => {
  const tokenId = delve(props, 'match.params.tokenId');
  const [token, setToken] = useState<null | TokenInfo>(null);
  const [errorTokenInfo, setErrorTokenInfo] = useState<null | Error>(null);
  // const [errorBurn, setErrorBurn] = useState<null | Error>(null);
  /*

  TODO:    - Set error and success for burn
           - Set loading for Burn Tokens
  */

  useEffect(() => {
    getTokenInfo(tokenId)
      .then(token => setToken(token))
      .catch(error => setErrorTokenInfo(error));
  }, [tokenId]);

  const handleBurn = async (tokenId: string) => {
    await burnToken(tokenId);
  };

  return (
    <div className="content-event aos-init aos-animate" data-aos="fade-up" data-aos-delay="300">
      <h2>Token Info</h2>

      {token && (
        <div className="card">
          <div className="content">
            <div>
              <img src={token.event.image_url} alt={token.event.description} className="avatar" />
            </div>
            <div>
              <h3>{token.event.name}</h3>
              <p>{token.event.description}</p>
            </div>
          </div>

          <div className="actions">
            <button className="action-btn" onClick={() => handleBurn(token.tokenId)}>
              Burn token
            </button>
          </div>
        </div>
      )}

      {errorTokenInfo && <p className="error">Couldn't find your token</p>}
    </div>
  );
};

export { BurnPage };
