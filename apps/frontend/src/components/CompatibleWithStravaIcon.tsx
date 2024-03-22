import * as React from 'react';
import { chakra, ImageProps, forwardRef } from '@chakra-ui/react';
import logo from '../assets/compatible-with-strava.svg';

export const CompatibleWithStravaIcon = forwardRef<ImageProps, 'img'>(
  (props, ref) => {
    return <chakra.img src={logo} ref={ref} {...props} />;
  }
);
