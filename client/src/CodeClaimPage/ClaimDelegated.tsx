import React, { useEffect, useState } from 'react';
import Web3 from "web3";
import Web3Modal from "web3modal";
// @ts-ignore
import WalletConnectProvider from "@walletconnect/web3-provider";
// @ts-ignore
import Torus from "@toruslabs/torus-embed";
import Portis from "@portis/web3";
import { TransactionReceipt } from 'web3-core';
import { useToasts } from 'react-toast-notifications';

/* Helpers */
import { HashClaim } from '../api';

/* Components */
import { Button } from '../components/Button';
import { TxDetail } from '../components/TxDetail';

/* Assets */
import abi from '../abis/PoapDelegatedMint.json';
import ClaimFooterMessage from './ClaimFooterMessage';

const BUTTON_STATUS = {
  CONNECTED: 'connected',
  LOADING: 'loading',
  DISCONNECTED: 'disconected'
};

const NETWORK = process.env.REACT_APP_ETH_NETWORK;
const CONTRACT_ADDRESS = process.env.REACT_APP_MINT_DELEGATE_CONTRACT;

/*
 * @dev: Component to show user that transactions is being mined
 * */
const ClaimDelegated: React.FC<{ claim: HashClaim, checkTokens: () => void }> = ({ claim, checkTokens }) => {
  const [web3, setWeb3] = useState<any>(null);
  const [network, setNetwork] = useState<string | null>(null);
  const [account, setAccount] = useState<string | null>(null);
  const [connectStatus, setConnectStatus] = useState<string>(BUTTON_STATUS.DISCONNECTED);
  const [txHash, setTxHash] = useState<string>('');
  const [txReceipt, setTxReceipt] = useState<null | TransactionReceipt>(null);

  const { addToast } = useToasts();

  useEffect(() => {
    let localTxs = localStorage.getItem('claims')
    if (localTxs) {
      let claims = JSON.parse(localTxs)
      if (claim.qr_hash in claims) {
        connectWallet()
        setTxHash(claims[claim.qr_hash])
      }
    }
  }, []);

  useEffect(() => {
    if (txHash && web3 && !txReceipt) {
      const interval = setInterval(getReceipt, 3000);
      return () => clearInterval(interval);
    }

    // After getting the correct status, check if the user has the token already
    if (txReceipt && txReceipt.status) {
      const interval = setInterval(checkTokens, 10000);
      return () => clearInterval(interval);
    }
  }, [txHash, web3, txReceipt]); /* eslint-disable-line react-hooks/exhaustive-deps */

  const providerOptions = {
    portis: {
      package: Portis,
      options: {
        id: 'eaae9abb-f5b2-45ba-aeb6-65eea10b6bf2'
      }
    },
    walletconnect: {
      package: WalletConnectProvider,
      options: {
        infuraId: "11677cb84b37456da3f3b4a5e89cf511"
      }
    },
    torus: {
      package: Torus
    }
  };

  const web3Modal = new Web3Modal({
    network: NETWORK, // optional
    cacheProvider: true, // optional
    providerOptions // required
  });

  const connectWallet = async () => {
    setConnectStatus(BUTTON_STATUS.LOADING)
    try {
      const provider = await web3Modal.connect()
      const _web3: any = new Web3(provider)
      setWeb3(_web3)

      const accounts = await _web3.eth.getAccounts()
      setAccount(accounts[0])

      const _network = await _web3.eth.net.getNetworkType()
      setNetwork(_network)

      setConnectStatus(BUTTON_STATUS.CONNECTED)
    } catch (e) {
      setConnectStatus(BUTTON_STATUS.DISCONNECTED)
      return;
    }
  };

  const claimPoap = async () => {
    if (connectStatus !== BUTTON_STATUS.CONNECTED || !web3) return null

    if (NETWORK && network && NETWORK.indexOf(network) === -1) {
      let message = `Please connect to ${NETWORK}.\nCurrently on ${network}`
      addToast(message, {
        appearance: 'error',
        autoDismiss: false,
      });
      return null
    }

    setConnectStatus(BUTTON_STATUS.LOADING);

    try {
      const contract = new web3.eth.Contract(abi, CONTRACT_ADDRESS);
      contract.methods.mintToken(
        claim.event_id, claim.beneficiary.toLowerCase(), claim.delegated_signed_message
      ).send({ from: account }, (err: any, hash: string | null) => {
        if (err) {
          console.log('Error on Mint Token: ', err);
          setConnectStatus(BUTTON_STATUS.CONNECTED);
        }
        if (hash) {
          setTxHash(hash);

          // Save to local storage
          let localTxs = localStorage.getItem('claims')
          let claims = localTxs ? JSON.parse(localTxs) : {}
          claims = {
            ...claims,
            [claim.qr_hash]: hash
          }
          localStorage.setItem('claims', JSON.stringify(claims))
        }
      });
    } catch (e) {
      setConnectStatus(BUTTON_STATUS.CONNECTED);
    }
  };

  const getReceipt = async () => {
    if (web3 && txHash !== '' && !txReceipt) {
      let receipt = await web3.eth.getTransactionReceipt(txHash)
      if (receipt) {
        setTxReceipt(receipt)
      }
    }
  }

  const cleanState = () => {
    localStorage.clear();
    setTxHash('')
    setTxReceipt(null)
  }

  const appLink = `/scan/${claim.beneficiary}`;

  return (
    <div className={'claim-info claim-delegated'} data-aos="fade-up" data-aos-delay="300">
      <div className={'info-title'}>Your POAP is almost there</div>
      <div className={'text-info'}>
        <p>Connect your wallet and submit your claim to get your POAP.</p>
        <p>If you have already submitted your transaction, go <a href={appLink}>check your wallet</a></p>
      </div>

      {connectStatus === BUTTON_STATUS.DISCONNECTED && !txHash &&
        <Button
          text={'Connect my wallet'}
          action={connectWallet}
          extraClass={'link-btn'}
        />
      }

      {connectStatus === BUTTON_STATUS.LOADING && !txHash &&
      <Button
        text={''}
        action={() => {}}
        extraClass={'loading'}
      />
      }

      {connectStatus === BUTTON_STATUS.CONNECTED && !txHash &&
      <Button
        text={'Claim your POAP'}
        action={claimPoap}
        extraClass={'link-btn'}
      />
      }

      {txHash &&
      <TxDetail
        hash={txHash}
        receipt={txReceipt}
      />
      }

      {txReceipt && !txReceipt.status &&
        <>
          <div className={'text-info'}>
            <p>It seems that your transaction failed. Want to try again?</p>
          </div>
          <Button
            text={'Retry'}
            action={cleanState}
            extraClass={'link-btn'}
          />
        </>
      }

      <ClaimFooterMessage />
    </div>
  );
};

export default ClaimDelegated;
