/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import { throttle } from 'lodash';

export const useBreakpoint = () => {
  const [breakPoint, setBreakPoint] = useState('md');
  useEffect(() => {
    const calcInnerWidth = throttle(function () {
      if (breakPoint !== getDeviceConfig(window.innerWidth)) {
        setBreakPoint(getDeviceConfig(window.innerWidth));
      }
    }, 200);
    window.addEventListener('resize', calcInnerWidth);
    return () => window.removeEventListener('resize', calcInnerWidth);
  }, []);
  return breakPoint;
};
const getDeviceConfig = (width) => {
  if (width < 575) {
    return 'x';
  } else if (width >= 575 && width < 767) {
    return 's';
  } else if (width >= 767 && width < 991) {
    return 'm';
  } else if (width >= 991 && width < 1199) {
    return 'l'; //large
  } else if (width >= 1199 && width < 1399) {
    return 'd'; //desk
  // } else if (width >= 1399 && width < 1400) {
  //   return 'xl';
  } else {
    return 'w'; //wide
  }
};
