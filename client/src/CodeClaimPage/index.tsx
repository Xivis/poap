import React, { useEffect, useState } from 'react';
import { RouteComponentProps } from 'react-router';
import Web3 from 'web3'
// import Contract from "web3-eth-contract"

/* Helpers */
import { HashClaim, getClaimHash, getTokensFor } from '../api';

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
import abi from '../abis/PoapDelegatedMint.json'
import EmptyBadge from '../images/empty-badge.svg';

export const CodeClaimPage: React.FC<RouteComponentProps<{ hash: string, method: string }>> = ({ match }) => {
  const [claim, setClaim] = useState<null | HashClaim>(null);
  const [claimError, setClaimError] = useState<boolean>(false);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [initialStep, setInitialStep] = useState<boolean>(true);
  const [isClaimLoading, setIsClaimLoading] = useState<boolean>(false);
  const [beneficiaryHasToken, setBeneficiaryHasToken] = useState<boolean>(false);

  let { hash, method } = match.params;
  let title = 'POAP Claim';
  let image = EmptyBadge;

  useEffect(() => {
    if (hash) fetchClaim(hash);
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */

  useEffect(() => {
    if (claim) fetchClaim(claim.qr_hash)
  }, [initialStep]);

  useEffect(() => {
    if (claim && claim.delegated_mint && !isVerifying) {
      verifySignedMessage()
    }
  }, [claim]);

  const fetchClaim = (hash: string) => {
    setIsClaimLoading(true);
    getClaimHash(hash.toLowerCase())
      .then(claim => {
        setClaim(claim);
        setClaimError(false);
      })
      .catch(error => {
        setClaimError(true);
      })
      .finally(() => setIsClaimLoading(false));
  }

  const continueClaim = () => setInitialStep(false)

  const checkUserTokens = () => {
    if (!claim || !claim.beneficiary) return
    getTokensFor(claim.beneficiary)
      .then(tokens => {
        if(tokens.filter(token => token.event.id === claim.event_id).length > 0) {
          setBeneficiaryHasToken(true)
        }
      })

  }

  const verifySignedMessage = () => {
    if (isVerifying || !claim) return

    // Initiate the contract and check if the message was processed
    setIsVerifying(true)
    try {
      const web3 = new Web3(Web3.givenProvider || process.env.REACT_APP_INFURA_PROVIDER)
      const contract = new web3.eth.Contract(abi as any, process.env.REACT_APP_MINT_DELEGATE_CONTRACT)
      contract.methods.processed(claim.delegated_signed_message).call().then((processed: boolean) => {
        if (processed) setBeneficiaryHasToken(processed)
        setIsVerifying(false)
      })
    } catch (e) {
      console.log(e)
      setIsVerifying(false)
      checkUserTokens()
    }
  }

  let body = <QRHashForm loading={isClaimLoading} checkClaim={fetchClaim} error={claimError} />;

  if (claim) {
    body = <ClaimForm claim={claim} onSubmit={continueClaim} method={method} />;
    title = claim.event.name;
    if (claim.event.image_url) {
      image = claim.event.image_url;
    }
    if (claim.claimed) {
      // Delegated minting
      if (claim.delegated_mint) {
        body = <ClaimDelegated claim={claim} verifyClaim={verifySignedMessage} initialStep={initialStep} />;
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

  if ((hash && !claim && !claimError) || isVerifying) {
    body = <ClaimLoading />;
  }

  return (
    <div className={'code-claim-page'}>
      <ClaimHeader
        title={title}
        image={image}
        claimed={!!(claim && (claim.tx_status === TX_STATUS.passed || beneficiaryHasToken))}
      />
      <div className={'claim-body'}>{body}</div>
      <ClaimFooter />
    </div>
  );
};
