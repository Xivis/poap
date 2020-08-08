import React, { FC } from 'react';

// assets
import PoapBadge from '../../images/POAP.svg';
import Twitter from '../../images/logo-twitter.svg';
import Telegram from '../../images/logo-telegram.svg';
import Github from '../../images/logo-git.svg';

// types
import { TemplatePageFormValues } from '../../templates/TemplateFormPage/components/TemplateForm';
import { HashClaim } from '../../api';
import { useImageSrc } from '../../lib/hooks/useImageSrc';

type Props = {
  template?: TemplatePageFormValues;
  claim?: HashClaim;
};

export const TemplateClaimFooter: FC<Props> = ({ template, claim }) => {
  const templateFooterIconRaw = claim?.event_template?.footer_icon
    ? claim?.event_template?.footer_icon
    : template?.footer_icon;
  const templateFooterColor = claim?.event_template?.footer_color
    ? claim?.event_template?.footer_color
    : template?.footer_color;

  const templateFooterIcon = useImageSrc(templateFooterIconRaw);

  return (
    <div
      className="template_claim_footer"
      style={{ backgroundColor: templateFooterColor || 'purple' }}
    >
      <div className="footer_icon_container ">
        {templateFooterIcon && (
          <img className="footer_icon" alt="Brand logo" src={templateFooterIcon} />
        )}
      </div>

      <div>
        <div className="footer-content">
          <div className="container">
            <a href={'https://www.poap.xyz'} target={'_blank'}>
              <img src={PoapBadge} alt="" className="decoration" />
            </a>
            <div className={'social-icons'}>
              <a href={'https://twitter.com/poapxyz/'} target={'_blank'}>
                <img src={Twitter} alt="Twitter" />
              </a>
              <a href={'https://t.me/poapxyz'} target={'_blank'}>
                <img src={Telegram} alt="Telegram" />
              </a>
              <a href={'https://github.com/poapxyz/poap'} target={'_blank'}>
                <img src={Github} alt="Github" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
