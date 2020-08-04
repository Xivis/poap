import React, { FC } from 'react';

// assets
import Star from '../../images/white-star.svg';
import HeaderShadow from '../../images/header-shadow-desktop-white.svg';

// lib
import { COLORS } from '../../lib/constants';

type Props = {
  headerLinkColor: string;
  headerLinkText: string;
  headerLinkUrl: string;
  headerColor: string;
  titleImage: string;
  titleLink: string;
  title: string;
  mainColor: string;
  leftImageLink: string;
  leftImageUrl: string;
  rightImageLink: string;
  rightImageUrl: string;
  image: string;
  claimed: boolean;
};

export const TemplateClaimHeader: FC<Props> = ({
  headerLinkColor,
  headerLinkText,
  headerLinkUrl,
  headerColor,
  titleImage,
  titleLink,
  title,
  mainColor,
  leftImageLink,
  leftImageUrl,
  rightImageLink,
  rightImageUrl,
  image,
  claimed,
}) => (
  <>
    <div style={{ backgroundColor: headerColor }} className="template_claim_header">
      <div className="title_container">
        <a href={titleLink} rel="noopener noreferrer">
          <img alt="Brand title" src={titleImage} />
        </a>
      </div>
      <div className="header_link_container">
        <a style={{ color: headerLinkColor }} href={headerLinkUrl} rel="noopener noreferrer">
          {headerLinkText}
        </a>
      </div>
    </div>
    <div className={'claim-header template'}>
      <div
        style={{ color: mainColor ? mainColor : COLORS.primaryColor }}
        className={'template_title'}
      >
        {title}
      </div>
      <div className={'logo-event'}>
        <div className="image-wrapper">{image && <img src={image} alt="Event" />}</div>
        {claimed && (
          <div className={'claimed-badge'}>
            <img src={Star} alt={'Badge claimed'} />
          </div>
        )}
      </div>
      <div className={'wave-holder'}>
        <img src={HeaderShadow} alt={''} />
      </div>

      {leftImageUrl ? (
        leftImageLink ? (
          <a href={leftImageLink} rel="noopener noreferrer">
            <img alt="Brand publicity" src={leftImageUrl} className="left_image" />
          </a>
        ) : (
          <img alt="Brand publicity" src={leftImageUrl} className="left_image" />
        )
      ) : null}

      {rightImageUrl ? (
        rightImageLink ? (
          <a href={rightImageLink} rel="noopener noreferrer">
            <img alt="Brand publicity" src={rightImageUrl} className="right_image" />
          </a>
        ) : (
          <img alt="Brand publicity" src={rightImageUrl} className="right_image" />
        )
      ) : null}
    </div>
  </>
);
