import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import * as api from '../../api';

// This component is used after redirecting from strava auth.
// It takes the code query param and sends it to the backend
// and navigates back to the main page (/)
export const StravaLogin = () => {
  const [searchParams] = useSearchParams();
  const code = searchParams.get('code');
  const scope = searchParams.get('scope');
  console.log(code, scope);

  const navigate = useNavigate();

  React.useEffect(() => {
    if (code) {
      api.stravatoken(code).then(console.log);
    } else {
      throw Error(
        '/strava missing code search param. Current search params : ' +
          searchParams.toString
      );
    }
  });

  React.useEffect(() => navigate('/'));

  // Maybe not best practice react dev 🙃
  return <></>;
};

export const stravaAuthUrl =
  'https://www.strava.com/oauth/authorize?' +
  new URLSearchParams({
    client_id: '39382',
    redirect_uri: 'http://localhost:3000/strava',
    response_type: 'code',
    scope: 'activity:write,read',
    approval_prompt: 'auto',
  });
