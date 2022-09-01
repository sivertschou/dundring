import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import * as api from '../../api';

export const StravaLogin = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const code = searchParams.get('code');
  const scope = searchParams.get('scope');
  console.log(code, scope);
  sessionStorage.setItem('code', code || '??');

  const navigate = useNavigate();

  React.useEffect(() => {
    api.stravatoken(code || '????').then(console.log);
  });

  React.useEffect(() => navigate('/'));

  return <></>;
};
