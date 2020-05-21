import React from 'react';

/*
 * @dev: Subscription pricing card on QR claim system
 * */
type SubscriptionCardProps = {
  title: string;
  active: boolean;
  price: number;
  body: any;
  button: string | null;
  action: () => void;
}

const ClaimSubscriptionCard: React.FC<SubscriptionCardProps> = ({title, price, body, button, active, action}) => (
  <div className={'claim-subscription-card'}>
    <div className={`card-title ${active && 'active'}`}>{title}</div>
    <div className={'card-body'}>
      <div className={'card-price'}>Ξ {price}</div>
      <div className={'card-text'}>{body}</div>
    </div>
    <div className={'card-action'}>
      {button &&
        <button onClick={action}>{button}</button>
      }
    </div>
  </div>
);

export default ClaimSubscriptionCard;
