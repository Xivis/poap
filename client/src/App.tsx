import React from 'react';
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';

import { ROUTES } from './lib/constants';
import { AuthProvider, AuthService } from './auth';
import { Callback } from './auth/Callback';
import { PrivateRoute } from './auth/PrivateRoute';
import { BackOffice } from './backoffice/Main';
import { SignerClaimPage } from './SignerClaimPage';
import { CodeClaimPage } from './CodeClaimPage';
import { ScanPage } from './ScanPage';

type AppProps = { auth: AuthService };

const App: React.FC<AppProps> = ({ auth }) => (
  <AuthProvider value={auth}>
    <Router>
      <Switch>
        <Route exact path={ROUTES.callback} component={Callback} />
        <PrivateRoute path={ROUTES.admin} component={BackOffice} />
        <Route path={ROUTES.signerClaimPage} component={SignerClaimPage} />
        <Route path={ROUTES.codeClaimPageHash} component={CodeClaimPage} />
        <Route path={ROUTES.codeClaimPage} component={CodeClaimPage} />
        <Route exact path={ROUTES.home} component={ScanPage} />
        <Route path='*' component={() => <Redirect to={'/'} />} />
      </Switch>
    </Router>
  </AuthProvider>
);

export default App;
