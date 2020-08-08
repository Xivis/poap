import React, { FC } from 'react';

// types
import { TemplatePageFormValues } from '../../templates/TemplateFormPage/components/TemplateForm';

// assets
import EmptyBadge from '../../images/empty-badge.svg';

// components
import { TemplateClaimHeader } from './TemplateClaimHeader';
import { TemplateClaimFooter } from './TemplateClaimFooter';
import ClaimForm from '../ClaimForm';

type Props = {
  template: TemplatePageFormValues;
};

export const TemplatePreview: FC<Props> = ({ template }) => {
  let image = EmptyBadge;
  let title = 'POAP Claim';

  return (
    <div className={'code-claim-page'}>
      <TemplateClaimHeader title={title} image={image} claimed={false} template={template} />
      <div className="claim-body template">
        <ClaimForm template={template} onSubmit={() => false} method="POST" />
      </div>
      <TemplateClaimFooter template={template} />
    </div>
  );
};
