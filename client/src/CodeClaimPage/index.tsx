import React, { useEffect, useState } from 'react';
import { RouteComponentProps } from 'react-router';

/* Helpers */
import { HashClaim, getClaimHash, getTokensFor } from '../api';
import { hasWeb3 } from '../poap-eth';

/* Components*/
import ClaimHeader from './ClaimHeader';
import QRHashForm from './QRHashForm';
import ClaimLoading from './ClaimLoading';
import ClaimForm from './ClaimForm';
import ClaimPending from './ClaimPending';
import ClaimFinished from './ClaimFinished';
import ClaimBumped from './ClaimBumped';
import ClaimDelegated from './ClaimDelegated';
import { ClaimFooter } from '../components/ClaimFooter';

/* Constants */
import { TX_STATUS } from '../lib/constants';

/* Assets */
import EmptyBadge from '../images/empty-badge.svg';

export const CodeClaimPage: React.FC<RouteComponentProps<{ hash: string }>> = ({ match }) => {
  const [web3, setWeb3] = useState<boolean | null>(null);
  const [claim, setClaim] = useState<null | HashClaim>(null);
  const [claimError, setClaimError] = useState<boolean>(false);
  const [isClaimLoading, setIsClaimLoading] = useState<boolean>(false);
  const [beneficiaryHasToken, setBeneficiaryHasToken] = useState<boolean>(false);

  let { hash } = match.params;
  let title = 'POAP Claim';
  let image = EmptyBadge;

  useEffect(() => {
    hasWeb3().then(setWeb3);
    if (hash) fetchClaim(hash);
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */

  const fetchClaim = (hash: string) => {
    setIsClaimLoading(true);
    getClaimHash(hash.toLowerCase())
      .then(claim => {
        setClaim(claim);
        setClaimError(false);
      })
      .catch(error => {
        console.error(error);
        setClaimError(true);
      })
      .finally(() => setIsClaimLoading(false));
  };

  const checkUserTokens = () => {
    if (!claim) return
    getTokensFor(claim.beneficiary)
      .then(tokens => {
        if(tokens.filter(token => token.event.id === claim.event_id).length > 0) {
          setBeneficiaryHasToken(true)
        }
      })

  }

  let body = <QRHashForm loading={isClaimLoading} checkClaim={fetchClaim} error={claimError} />;

  if (claim) {
    body = <ClaimForm enabledWeb3={web3} claim={claim} checkClaim={fetchClaim} />;
    title = claim.event.name;
    if (claim.event.image_url) {
      image = claim.event.image_url;
    }
    if (claim.claimed) {
      // Delegated minting
      if (claim.delegated_mint) {
        body = <ClaimDelegated claim={claim} checkTokens={checkUserTokens} />;
      }

      // POAP minting
      if (claim.tx_status && claim.tx_status === TX_STATUS.pending) {
        body = <ClaimPending claim={claim} checkClaim={fetchClaim} />;
      }
      if ((claim.tx_status && claim.tx_status === TX_STATUS.passed) || beneficiaryHasToken) {
        body = <ClaimFinished claim={claim} />;
      }
      if (claim.tx_status && claim.tx_status === TX_STATUS.bumped) {
        body = <ClaimBumped claim={claim} />;
      }
    }
  }

  if (hash && !claim && !claimError) {
    body = <ClaimLoading />;
  }

  return (
    <div className={'code-claim-page'}>
      <ClaimHeader
        title={title}
        image={image}
        claimed={!!(claim && claim.tx_status === TX_STATUS.passed)}
      />
      <div className={'claim-body'}>{body}</div>
      <ClaimFooter />
    </div>
  );
};
