import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

import { ROUTES } from './lib/constants';
import { AuthProvider, AuthService } from './auth';
import { Callback } from './auth/Callback';
import { BackOffice } from './backoffice/Main';
import { SignerClaimPage } from './SignerClaimPage';
import { CodeClaimPage } from './CodeClaimPage';
import { ScanPage } from './ScanPage';
import { AdminLoginPage } from './AdminLoginPage';

type AppProps = { auth: AuthService };

const App: React.FC<AppProps> = ({ auth }) => (
  <AuthProvider value={auth}>
    <Router>
      <Switch>
        <Route exact path={ROUTES.callback} component={Callback} />
        <Route exact path={ROUTES.adminLogin.path} component={AdminLoginPage} />
        <Route path={ROUTES.admin} component={BackOffice} />
        <Route path={ROUTES.signerClaimPage} component={SignerClaimPage} />
        <Route path={ROUTES.codeClaimWeb3PageHash} component={CodeClaimPage} />
        <Route path={ROUTES.codeClaimPageHash} component={CodeClaimPage} />
        <Route path={ROUTES.codeClaimPage} component={CodeClaimPage} />
        <Route path={ROUTES.home} component={ScanPage} />
      </Switch>
    </Router>
  </AuthProvider>
);

export default App;
