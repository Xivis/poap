import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';

/* Assets */
import PoapLogo from 'images/POAP.svg';

// components
import { NavigationMenu } from 'backoffice/Main';
import { TemplatesFilters } from './components/TemplatesFilters';
import { TemplatesTable } from './components/TemplatesTable';

// helpers
import { useAsync } from 'react-helpers';

// api
import { getTemplates, TemplateResponse } from 'api';

type PaginateAction = {
  selected: number;
};

export const TemplatePage = () => {
  // state hooks
  const [name, setName] = useState<string>('');
  const [page, setPage] = useState<number>(0);
  const [limit, setLimit] = useState<number>(10);
  const [total, setTotal] = useState<number>(0);

  const fetchTemplates = useCallback(() => getTemplates({ limit, offset: page * limit, name }), [
    limit,
    page,
    name,
  ]);

  // custom hooks
  const [templates, fetchingTemplates] = useAsync<TemplateResponse>(fetchTemplates);

  // effects
  useEffect(() => {
    if (templates) setTotal(templates?.total);
  }, [templates]);

  // handlers
  const handlePageChange = (obj: PaginateAction) => {
    setPage(obj.selected);
  };

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
        <div className={'admin-table templates'}>
          <h2>Templates</h2>
          <TemplatesFilters setLimit={setLimit} setName={setName} />
          <TemplatesTable
            isFetchingTemplates={fetchingTemplates}
            handlePageChange={handlePageChange}
            page={page}
            templates={templates}
            total={total}
            limit={limit}
          />
        </div>
      </div>
    </>
  );
};
