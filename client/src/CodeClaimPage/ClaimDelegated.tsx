import React, { useEffect, useState } from 'react';
import Web3 from 'web3';
import Web3Modal from 'web3modal';
// @ts-ignore
import WalletConnectProvider from '@walletconnect/web3-provider';
// @ts-ignore
import { TransactionReceipt } from 'web3-core';
import { useToasts } from 'react-toast-notifications';

/* Helpers */
import { HashClaim } from '../api';
import { reduceAddress } from '../lib/helpers';

/* Components */
import { Button } from '../components/Button';
import { TxDetail } from '../components/TxDetail';

/* Assets */
import abi from '../abis/PoapDelegatedMint.json';
import ClaimFooterMessage from './ClaimFooterMessage';

const PAGE_STATUS = {
  CONNECTED: 'connected',
  LOADING: 'loading',
  DISCONNECTED: 'disconected',
};

const NETWORK = process.env.REACT_APP_ETH_NETWORK;
const CONTRACT_ADDRESS = process.env.REACT_APP_MINT_DELEGATE_CONTRACT;
const TX_RETRY_LIMIT = 100; // ~5m

/*
 * @dev: Component to show user that transactions is being mined
 * */
const ClaimDelegated: React.FC<{
  claim: HashClaim;
  verifyClaim: () => void;
  initialStep: boolean;
}> = ({ claim, verifyClaim, initialStep }) => {
  const [web3, setWeb3] = useState<any>(null);
  const [network, setNetwork] = useState<string | null>(null);
  const [connectStatus, setConnectStatus] = useState<string>(
    !initialStep ? PAGE_STATUS.LOADING : PAGE_STATUS.DISCONNECTED,
  );
  const [txHash, setTxHash] = useState<string>('');
  const [txRetry, setTxRetry] = useState<number>(0);
  const [txReceipt, setTxReceipt] = useState<null | TransactionReceipt>(null);

  const { addToast } = useToasts();

  useEffect(() => {
    if (initialStep) {
      let localTxs = localStorage.getItem('claims');
      if (localTxs) {
        let claims = JSON.parse(localTxs);
        if (claim.qr_hash in claims) {
          setTxHash(claims[claim.qr_hash]);
        }
        const _web3 = new Web3(Web3.givenProvider || process.env.REACT_APP_INFURA_PROVIDER);
        setWeb3(_web3);
      }
    } else {
      claimPoap();
    }
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */

  useEffect(() => {
    if (txHash && web3) {
      const interval = setInterval(() => {
        verifyClaim();
        getReceipt();
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [txHash, web3, txReceipt, txRetry]); /* eslint-disable-line react-hooks/exhaustive-deps */

  const connectWallet = async () => {
    const providerOptions = {
      walletconnect: {
        package: WalletConnectProvider,
        options: {
          infuraId: process.env.REACT_APP_INFURA_ID,
        },
      },
    };

    const web3Modal = new Web3Modal({
      network: NETWORK,
      cacheProvider: false,
      providerOptions,
    });

    try {
      const provider = await web3Modal.connect();
      const _web3: any = new Web3(provider);

      const _network = await _web3.eth.net.getNetworkType();
      setNetwork(_network);

      setConnectStatus(PAGE_STATUS.CONNECTED);

      return _web3;
    } catch (e) {
      setConnectStatus(PAGE_STATUS.DISCONNECTED);
      return null;
    }
  };

  const claimPoap = async () => {
    let _web3 = web3;
    if (!_web3) {
      _web3 = await connectWallet();
      if (!_web3) return null;

      setWeb3(_web3);
    }

    const accounts = await _web3.eth.getAccounts();
    if (accounts.length === 0) return null;

    const account = accounts[0];

    if (NETWORK && network && NETWORK.indexOf(network) === -1) {
      let message = `Wrong network, please connect to ${NETWORK}.\nCurrently on ${network}`;
      addToast(message, {
        appearance: 'error',
        autoDismiss: false,
      });
      return null;
    }

    setConnectStatus(PAGE_STATUS.LOADING);

    try {
      const contract = new _web3.eth.Contract(abi, CONTRACT_ADDRESS);
      let gas = 1000000;
      try {
        gas = await contract.methods
          .mintToken(claim.event_id, claim.beneficiary, claim.delegated_signed_message)
          .estimateGas({ from: account });
        gas = Math.floor(gas * 1.3);
      } catch (e) {
        console.log('Error calculating gas');
      }

      contract.methods
        .mintToken(claim.event_id, claim.beneficiary, claim.delegated_signed_message)
        .send({ from: account, gas: gas }, (err: any, hash: string | null) => {
          if (err) {
            console.log('Error on Mint Token: ', err);
            setConnectStatus(PAGE_STATUS.CONNECTED);
          }
          if (hash) {
            setTxHash(hash);

            // Save to local storage
            let localTxs = localStorage.getItem('claims');
            let claims = localTxs ? JSON.parse(localTxs) : {};
            claims = { ...claims, [claim.qr_hash]: hash };
            localStorage.setItem('claims', JSON.stringify(claims));
          }
        });
    } catch (e) {
      setConnectStatus(PAGE_STATUS.CONNECTED);
    }
  };

  const getReceipt = async () => {
    let receipt: null | TransactionReceipt = null;
    if (web3 && txHash !== '' && !txReceipt) {
      receipt = await web3.eth.getTransactionReceipt(txHash);
      if (receipt) {
        setTimeout(() => setTxReceipt(receipt), 3000);
      }
    }

    if (!receipt || !receipt.status || (txReceipt && !txReceipt.status)) {
      setTxRetry(txRetry + 1);
    }
  };

  const cleanState = () => {
    localStorage.clear();
    setTxHash('');
    setTxReceipt(null);
  };

  const fadeEffect = initialStep ? 'fade-up' : '';

  let beneficiary = claim.beneficiary;

  if (claim.user_input) {
    beneficiary =
      claim.user_input === beneficiary ? beneficiary : `${claim.user_input} (${reduceAddress(claim.beneficiary)})`;
  }

  return (
    <div className={'container claim-info claim-delegated'} data-aos={fadeEffect} data-aos-delay="300">
      <form className={'claim-form'}>
        <input type={'text'} disabled={true} value={beneficiary} />

        <div className={'web3-browser'}>
          This POAP hasn’t been claimed. <a href={'mailto:hello@poap.xyz'}>Need help?</a>
        </div>
      </form>

      {connectStatus !== PAGE_STATUS.LOADING && !txHash && (
        <Button text={'Claim POAP token'} action={claimPoap} extraClass={'link-btn'} />
      )}

      {connectStatus === PAGE_STATUS.LOADING && !txHash && (
        <Button text={''} action={() => {}} extraClass={'loading'} />
      )}

      {txHash && <TxDetail hash={txHash} receipt={txReceipt} />}

      {txHash && txRetry > TX_RETRY_LIMIT && (!txReceipt || (txReceipt && txReceipt.status)) && (
        <>
          <div className={'text-info'}>
            <p>We can't verify your transaction. If you cancel it, please try again</p>
          </div>
          <Button text={'Try again'} action={cleanState} extraClass={'link-btn'} />
        </>
      )}

      {txReceipt && txReceipt.status && (
        <>
          <div className={'text-info'}>
            <p>Your transaction was mined but we can't verify that the POAP is in your wallet</p>
            <p>Please, click below to refresh and try again</p>
          </div>
          <Button text={'Try again'} action={cleanState} extraClass={'link-btn'} />
        </>
      )}

      {txReceipt && !txReceipt.status && (
        <>
          <div className={'text-info'}>
            <p>It seems that your transaction failed. Want to try again?</p>
          </div>
          <Button text={'Retry'} action={cleanState} extraClass={'link-btn'} />
        </>
      )}

      <ClaimFooterMessage />
    </div>
  );
};

export default ClaimDelegated;
