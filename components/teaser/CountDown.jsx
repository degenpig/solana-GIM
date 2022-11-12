import { useState, useEffect } from 'react';
import { calculateTimeLeft } from './calculateTimeLeft';
import styles from './CountDown.module.scss';

export const CountDown = ({title, paragraph}) => {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearTimeout(timer);
  });

  const timerComponents = [];

  Object.keys(timeLeft).forEach((interval) => {
    if (!timeLeft[interval]) {
      return;
    }
      timerComponents.push(
        <span key={`Countdown-${interval}`}>
          {timeLeft[interval]}{interval}{""}
        </span>
      );
  });

  return (
    <div className={styles.container}>
      <div><span><h2>{title}</h2></span></div>
      <div><span><h3 dangerouslySetInnerHTML={{__html: paragraph}} /></span></div>
      {/* <div className={styles.timer}>{timerComponents.length ? timerComponents : <span></span>}</div> */}
      {/* <div>more to come 2.22.22</div> */}
    </div>
  )
}