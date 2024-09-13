import * as React from 'react';
import { chakra, ImageProps, forwardRef, Link } from '@chakra-ui/react';
import logo from '../assets/connect-with-strava.svg';
import { getEnv } from '../utils/environment';

const ConnectWithStravaGraphics = forwardRef<ImageProps, 'img'>(
  (props, ref) => {
    return <chakra.img src={logo} ref={ref} {...props} />;
  }
);

export const ConnectWithStravaButton = () => {
  const clientId = getEnv().stravaClientId;
  const url = `https://www.strava.com/oauth/authorize?client_id=39382&redirect_uri=http://localhost:5173/auth/strava&response_type=code&approval_prompt=auto&scope=read,activity:write,activity:read_all`;

  return (
    <Link href={url}>
      <ConnectWithStravaGraphics />
    </Link>
  );
};
