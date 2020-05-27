import React, { useEffect, useState } from 'react';

interface timeObject {
  minutes: number;
  seconds: number;
}

const CountdownTimer: React.FC<{expiration: string}>= ({expiration}) => {

  const calculateTimeLeft = ():  timeObject | null  => {
    const difference = +new Date(expiration) - +new Date();

    if (difference > 0) {
      return {
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60)
      };
    }

    return null;
  };
  const [timeLeft, setTimeLeft] = useState<timeObject | null>(calculateTimeLeft());

  useEffect(() => {
    setTimeout(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
  }); /* eslint-disable-line react-hooks/exhaustive-deps */

  return (
    <div className={'countdown'}>
        {timeLeft ?
          <>{`${timeLeft.minutes}`.padStart(2, '0')}:{`${timeLeft.seconds}`.padStart(2, '0')}</> :
          <span>Time's up!</span>
        }
    </div>
  )
};

export default CountdownTimer;
