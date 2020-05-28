import React, { useEffect, useState } from 'react';

/* Libraries */
import ReactModal from 'react-modal';

/* Helpers */
import { getSettings, HashClaim, createSubscription, getSubscriptionLock, SubscriptionLock } from '../api';
import { reduceHex } from '../lib/helpers';
import { SETTINGS, etherscanLinks } from '../lib/constants';

/* Components */
import ClaimFooterMessage from './ClaimFooterMessage';
import ClaimSubscriptionCard from './ClaimSubscriptionCard';

/* Assets */
import Spinner from '../images/etherscan-spinner.svg';
import Arrow from '../images/arrow-link.svg';
import CountdownTimer from '../components/CountdownTimer';

/*
 * @dev: Component to show user that transaction is being mined
 * */

const SubscriptionPlans: React.FC<{action: () => void}> = ({action}) => {
  const fire = <span role="img" aria-label="fire">🔥</span>;
  const subscriptionPlans = [
    {
      title: 'Free POAP',
      active: true,
      price: 0,
      body: (
        <>
          <p>We're paying for the Gas</p>
          <p>Slower Tx, please be patient <span role="img" aria-label="please">🙏</span></p>
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
          <p>Fuel your Tx with more Gas {fire}</p>
        </>
      ),
      button: 'Try it'
    },
    {
      title: 'POAP fans',
      active: false,
      price: 0.1,
      body: (
        <>
          <p>{fire} Worth <b>20</b> POAP claims {fire}</p>
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

    getSubscriptionLock(claim.beneficiary)
      .then(lock => {
        setSubscriptionLock(lock);
        openEditModal();
      })
      .catch(e => console.log('No lock found'));

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
      console.log(error)
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={'claim-info claim-pending'} data-aos="fade-up" data-aos-delay="300">
      <div className={'info-title'}>POAP token is on its way</div>
      <div className={`info-pending ${claim.bumped && 'pending-bumped'} `}>
        <span role={'img'} aria-label={'fire'} className={'emoji left-emoji'}>🔥</span>
        <img src={Spinner} alt={'Mining'} />
        Pending
        <span role={'img'} aria-label={'fire'} className={'emoji right-emoji'}>🔥</span>
      </div>
      <div className={'claim-tx-link'}>
        <a href={etherscanLinks.tx(claim.tx_hash)} target={"_blank"}>
          {reduceHex(claim.tx_hash)}
          <img src={Arrow} alt={'Link'} />
        </a>
      </div>
      {claim.bumped &&
      <div className={'claim-tx-bumped'}>
        <p>Your POAP is traveling to your wallet at higher speed <span role={'img'} aria-label={'rocket'}>🚀</span></p>
        <p>Thank you for using the POAP fueled transaction service!</p>
      </div>
      }
      {!claim.bumped &&
        <>
          <SubscriptionPlans action={openEditModal} />
          <ReactModal isOpen={modalOpen} shouldFocusAfterRender={true}>
            <div className={'subscription-modal'}>
              <h3>POAP fueled Transactions</h3>
              {!isSubmitting && !subscriptionLock &&
                <>
                  <p>Do you want to get your POAP faster?</p>
                  <p>The Ethereum network tends to gets congested and Gas prices skyrocket <span role={'img'} aria-label={'rocket'}>🚀</span></p>
                  <p>
                    We offer you to fuel your transaction to get you POAP faster. If you continue, we will enable an
                    address for you to <b>transfer funds within the next {lockTime} minutes</b>. The transfer can come
                    from any account.
                  </p>
                  <p>
                    Once we receive the funds, POAP claims for <a href={`/scan/${claim.beneficiary}`} target={'_blank'}>{claim.beneficiary}</a> will be fueled
                    <span role="img" aria-label="fire">🔥</span>
                    <span role="img" aria-label="fire">🔥</span>
                    <span role="img" aria-label="fire">🔥</span>
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
              <>
                <div className={'subscription-lock-body'}>
                  <div className={'subscription-lock-qr'}>
                    <img
                      src={subscriptionLock.subscription_address.qr_code_image}
                      alt={subscriptionLock.subscription_address.name}
                    />
                  </div>
                  <div className={'subscription-lock-detail'}>
                    <p>Transfer ETH to this address to get your TX moving!</p>
                    <p><a href={etherscanLinks.address(subscriptionLock.subscription_address.address)} target={'_blank'}>{subscriptionLock.subscription_address.address}</a></p>
                    <p><b>ENS: </b>{subscriptionLock.subscription_address.name}</p>
                    <br />
                    <p>The address is time limited blocked for you, hurry up!</p>
                    <CountdownTimer expiration={subscriptionLock.expires_at}/>
                    <div className={'subscription-lock-transfer'}>
                      <button>Transfer Ξ 0.01</button>
                      <button>Transfer Ξ 0.1</button>
                    </div>
                  </div>
                </div>
                <div className={'subscription-lock-footer'}>
                  <div className={'subscription-lock-help-text'}>
                    If you have already transferred funds to the address, wait a couple of seconds.
                    We're monitoring this address to validate transactions received.
                  </div>
                  <div onClick={closeEditModal} className={'close-modal'}>
                    Close
                  </div>
                </div>
              </>
              }

            </div>
          </ReactModal>
        </>
      }
      <ClaimFooterMessage />
    </div>
  );
};

export default ClaimPending;
