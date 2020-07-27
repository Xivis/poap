import React from 'react';

/* Helpers */
import { HashClaim } from '../api';

/* Components */
import { LinkButton } from '../components/LinkButton';
import ClaimFooterMessage from './ClaimFooterMessage';

/*
 * @dev: Component to show minted token
 * */

type Props = {
  claim: HashClaim;
};

const ClaimFinished: React.FC<Props> = ({ claim }) => {
  const appLink = `/scan/${claim.beneficiary}`;
  const isEmailClaimed = claim.email_claimed;

  return (
    <div className={'claim-info'} data-aos="fade-up" data-aos-delay="300">
      <div className={'info-title'}>
        <p>Congratulations!</p>
        <p>{claim.event.name} badge is now in your wallet</p>
      </div>
      <div className={'text-info'}>Keep growing your POAP collection!</div>
      {isEmailClaimed && (
        <div className="scan-email-badge-container width700">
          <span className="scan-email-badge">
            This POAP was claimed with an email. Whenever you want, you can redeem it to your Ethereum address
          </span>
        </div>
      )}
      <LinkButton text={'Check my badges'} link={appLink} extraClass={'link-btn'} />
      <ClaimFooterMessage />
    </div>
  );
};

export default ClaimFinished;
