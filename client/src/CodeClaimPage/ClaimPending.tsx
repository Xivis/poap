import React, { useEffect, useState } from 'react';

/* Libraries */
import ReactModal from 'react-modal';

/* Helpers */
import { getSettings, HashClaim, createSubscription, SubscriptionLock } from '../api';
import { reduceHex } from '../lib/helpers';
import { SETTINGS } from '../lib/constants';

/* Components */
import ClaimFooterMessage from './ClaimFooterMessage';
import ClaimSubscriptionCard from './ClaimSubscriptionCard';

/* Assets */
import Spinner from '../images/etherscan-spinner.svg';
import Arrow from '../images/arrow-link.svg';

/*
 * @dev: Component to show user that transaction is being mined
 * */

const MODAL_STATUS = {
  DETAIL: 'detail',
  LOADING: 'loading',
  ERROR: 'error',
  FINAL: 'final'
};

const SubscriptionPlans: React.FC<{action: () => void}> = ({action}) => {
  const subscriptionPlans = [
    {
      title: 'Free POAP',
      active: true,
      price: 0,
      body: (
        <>
          <p>We're paying for the Gas</p>
          <p>Slower Tx, please be patient 🙏</p>
        </>
      ),
      button: null
    },
    {
      title: 'One time only',
      active: false,
      price: 0.01,
      body: (
        <>
          <p>Get your POAP token faster!</p>
          <p>Fuel your Tx with more Gas 🔥</p>
        </>
      ),
      button: 'Try it'
    },
    {
      title: 'Free POAP',
      active: false,
      price: 0.1,
      body: (
        <>
          <p>🔥 Worth <b>20</b> POAP claims 🔥</p>
          <p>Purchase for your next claims!</p>
        </>
      ),
      button: 'Hell yes!'
    }
  ];
  return (
    <div className={'claim-subscriptions-card'}>
      {subscriptionPlans.map(plan => {
        return (
          <ClaimSubscriptionCard
            key={plan.price}
            title={plan.title}
            active={plan.active}
            price={plan.price}
            body={plan.body}
            button={plan.button}
            action={action}
          />
        )
      })}
    </div>
  )
};

const ClaimPending: React.FC<{ claim: HashClaim; checkClaim: (hash: string) => void }> = ({
  claim,
  checkClaim,
}) => {
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [lockTime, setLockTime] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [subscriptionLock, setSubscriptionLock] = useState<SubscriptionLock | null>(null);

  useEffect(() => {
    getSettings()
      .then(response => {
        if (!response) return;
        let lockTimeSetting = response.find(setting => setting.key === SETTINGS.lockTime);
        if (lockTimeSetting) setLockTime(lockTimeSetting.value);
      });

    const interval = setInterval(() => {
      checkClaim(claim.qr_hash);
    }, 10000);
    return () => clearInterval(interval);
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */

  const openEditModal = () => {
    setModalOpen(true);
  };

  const closeEditModal = () => {
    setModalOpen(false);
  };

  const submitModal = async () => {
    setIsSubmitting(true);
    try {
      let lock = await createSubscription(claim.qr_hash);
      setSubscriptionLock(lock)
    } catch (error) {
      console.log('error')
    } finally {
      setIsSubmitting(false);
      console.log('Done')
    }
  };

  const etherscanTxLink = `https://etherscan.io/tx/${claim.tx_hash}`;
  const etherscanAddressLink = `https://etherscan.io/address/${claim.beneficiary}`;

  return (
    <div className={'claim-info claim-pending'} data-aos="fade-up" data-aos-delay="300">
      <div className={'info-title'}>POAP token is on its way</div>
      <div className={'info-pending'}>
        <img src={Spinner} alt={'Mining'} />
        Pending
      </div>
      <div className={'claim-tx-link'}>
        <a href={etherscanTxLink} target={"_blank"}>
          {reduceHex(claim.tx_hash)}
          <img src={Arrow} alt={'Link'} />
        </a>
      </div>
      <SubscriptionPlans action={openEditModal} />
      <ClaimFooterMessage />

      <ReactModal isOpen={modalOpen} shouldFocusAfterRender={true}>
        <div className={'subscription-modal'}>
          <h3>POAP fueled Transactions</h3>
          {!isSubmitting && !subscriptionLock &&
            <>
              <p>Do you want to get your POAP faster?</p>
              <p>The Ethereum network tends to gets congested and Gas prices skyrocket 🚀</p>
              <p>
                We offer you to fuel your transaction to get you POAP faster. If you continue, we will enable an
                address for you to <b>transfer funds within the next {lockTime} minutes</b>. The transfer can come
                from any account.
              </p>
              <p>
                Once we receive the funds, POAP claims for <a href={etherscanAddressLink} target={'_blank'}>{claim.beneficiary}</a> will be fueled 🔥🔥🔥
              </p>
              <div className={'subscription-modal-buttons text-center'}>
                <button onClick={submitModal}>Continue</button>
                <div onClick={closeEditModal} className={'close-modal'}>
                  Cancel
                </div>
              </div>
            </>
          }

          {isSubmitting && !subscriptionLock &&
            <div className={'loading'} />
          }

          {subscriptionLock &&
          <div>
            <img src={subscriptionLock.subscription_address.qr_code_image} />
            <div>{subscriptionLock.subscription_address.name}</div>
            <div onClick={closeEditModal} className={'close-modal'}>
              Cancel
            </div>
          </div>
          }

        </div>
      </ReactModal>
    </div>
  );
};

export default ClaimPending;
