import React, { FC } from 'react';
import delve from 'dlv';
import { Link, RouteComponentProps } from 'react-router-dom';

/* Assets */
import PoapLogo from 'images/POAP.svg';

// components
import { NavigationMenu } from 'backoffice/Main';
import { TemplateForm } from './components/TemplateForm';

export const TemplateFormPage: FC<RouteComponentProps> = ({ match }) => {
  // constants
  const id = delve(match, 'params.id');

  return (
    <>
      <NavigationMenu />
      <header id="site-header" role="banner">
        <div className="container">
          <div className="col-xs-6 col-sm-6 col-md-6">
            <Link to="/admin" className="logo">
              <img src={PoapLogo} alt="POAP" />
            </Link>
          </div>
          <div className="col-xs-6 col-sm-6 col-md-6">
            <p className="page-title">Templates</p>
          </div>
        </div>
      </header>
      <div className="container">
        <div className={'admin-table'}>
          <TemplateForm id={id} />
        </div>
      </div>
    </>
  );
};
