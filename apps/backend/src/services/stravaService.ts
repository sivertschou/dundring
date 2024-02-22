import { ApiStatus, Status, StravaToken } from '@dundring/types';
import { error, success } from '@dundring/utils';
import fetch from 'node-fetch';
import * as db from '../db';

require('dotenv').config();

export const checkStravaConfig = () => {
  if (!process.env.STRAVA_CLIENT_ID) {
    console.log(
      '[.env]: No Strava client id provided. Override this by setting the STRAVA_CLIENT_ID in the environment config.'
    );
  }
  if (!process.env.STRAVA_CLIENT_SECRET) {
    console.log(
      '[.env]: No Strava client secret provided. Override this by setting the STRAVA_CLIENT_SECRET in the environment config.'
    );
  }
};

export const getStravaTokenFromAuthCode = async (
  code: string
): Promise<
  Status<
    StravaToken,
    | 'Invalid authorization code'
    | 'Something went wrong while fetching Strava token'
  >
> => {
  const url = `https://www.strava.com/api/v3/oauth/token`;

  const body = {
    client_id: process.env.STRAVA_CLIENT_ID,
    client_secret: process.env.STRAVA_CLIENT_SECRET,
    grant_type: 'authorization_code',
    code,
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) return error('Invalid authorization code');

    const token: StravaToken = await response.json();
    console.log('token:', token);

    return success(token);
  } catch (e) {
    console.error('[sendSlackMessage]:', e);
    return error('Something went wrong while fetching Strava token');
  }
};

export const updateRefreshToken = async (data: {
  athleteId: number;
  refreshToken: string;
  scopes: string[];
}) => {
  db.updateStravaRefreshToken(data);
};
