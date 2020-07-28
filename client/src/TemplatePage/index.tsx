import React from 'react';
import { Link } from 'react-router-dom';

/* Assets */
import PoapLogo from '../images/POAP.svg';

export const TemplatePage = () => {
  return (
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
  )
}