import React, { useEffect } from 'react';

/* Helpers */
import { HashClaim } from '../api';
import { etherscanLinks } from '../lib/constants';

/* Components */
import { LinkButton } from '../components/LinkButton';

/* Assets */
import Spinner from '../images/etherscan-spinner.svg';

/*
* @dev: Component to show user that transactions is being mined
* */
const ClaimPending: React.FC<{claim: HashClaim, checkClaim: (hash: string) => void}> = ({claim, checkClaim}) => {
  useEffect(() => {
    const interval = setInterval(() => {
      checkClaim(claim.qr_hash);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  let body = (
    <div className={'text-info'}>
      Our servers are processing your request. Come back in a few minutes to check the status of your claim
    </div>
  );

  if (claim.tx_hash) {
    body = (
      <>
        <div className={'text-info'}>
          Come back in a few minutes to check the status, or follow the transaction on Etherscan
        </div>
        <LinkButton
          text={'View on Etherscan'}
          link={etherscanLinks.tx(claim.tx_hash)}
          extraClass={'link-btn'}
          target={'_blank'} />
      </>
    )
  }

  return (
    <div className={'claim-info'} data-aos="fade-up" data-aos-delay="300">
      <div className={'info-title'}>
        Your badge is on it's way to your wallet
      </div>
      <div className={'info-pending'}>
        <img src={Spinner} alt={'Mining'} />
        Pending
      </div>
      {body}
    </div>
  )
};

export default ClaimPending;