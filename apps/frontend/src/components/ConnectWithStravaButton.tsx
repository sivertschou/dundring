import * as React from 'react';
import { chakra, ImageProps, forwardRef, Link } from '@chakra-ui/react';
import logo from '../assets/connect-with-strava.svg';
import { getEnv } from '../utils/environment';

export const getStravaAuthorizeUrl = (params = { forcePrompt: false }) => {
  const clientId = getEnv().stravaClientId;
  return `https://www.strava.com/oauth/authorize?client_id=${clientId}&redirect_uri=${location.origin}/auth/strava&response_type=code&approval_prompt=auto&scope=read,activity:write&approval_prompt=${params.forcePrompt ? 'force' : 'auto'}`;
};

export const ConnectWithStravaButton = () => {
  return (
    <Link href={getStravaAuthorizeUrl()}>
      <ConnectWithStravaGraphics />
    </Link>
  );
};

const ConnectWithStravaGraphics = forwardRef<ImageProps, 'img'>(
  (props, ref) => {
    return <chakra.img src={logo} ref={ref} {...props} />;
  }
);
