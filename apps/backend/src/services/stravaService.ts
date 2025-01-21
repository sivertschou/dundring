import {
  Status,
  StravaToken,
  StravaTokenRefresh,
  StravaUpload,
} from '@dundring/types';
import { error, isSuccess, success } from '@dundring/utils';
import fetch from 'node-fetch';
import * as FormData from 'form-data';
import { monitoringService } from './index';

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

export const uploadFileToStrava = async (
  fileContent: string,
  activityName: string,
  accessToken: string
): Promise<Status<StravaUpload, string>> => {
  const formData = new FormData.default();
  formData.append('file', fileContent, {
    filename: 'dundring.tcx',
    contentType: 'application/xml',
  });
  formData.append('data_type', 'tcx');

  formData.append('name', activityName);

  try {
    const response = await fetch('https://www.strava.com/api/v3/uploads', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }

    const data = (await response.json()) as StravaUpload;

    const fetchStravaUpload = async () => {
      const uploadResponse = await fetch(
        `https://www.strava.com/api/v3/uploads/${data.id}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!uploadResponse.ok) {
        throw new Error(`Error: ${uploadResponse.statusText}`);
      }

      const uploadData = (await uploadResponse.json()) as StravaUpload;

      if (uploadData.activity_id) {
        console.log('API called successfully. Returned data:', uploadData);
        return success(uploadData);
      }

      if (uploadData.error) {
        console.error('Upload failed:', uploadData.error);
        return error('Something went wrong while uploading');
      }

      return null;
    };

    const pollCheckUpload = async () => {
      while (true) {
        await pause(2000);
        try {
          const stravaUploadResponse = await fetchStravaUpload();

          if (stravaUploadResponse) {
            if (isSuccess(stravaUploadResponse)) {
              monitoringService.logActivityUpload(
                stravaUploadResponse.data.activity_id
              );
            }
            return stravaUploadResponse;
          }
        } catch (err) {
          console.error('An error occurred:', err);
          return error('Something went wrong while uploading');
        }
      }
    };

    return pollCheckUpload();
  } catch (err) {
    console.error('Upload failed:', err);
    return error('Something went wrong while uploading');
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
    console.error('[getStravaTokenFromAuthCode]:', e);
    return error('Something went wrong while fetching Strava token');
  }
};

export const getStravaTokenFromRefreshToken = async (
  refreshToken: string
): Promise<
  Status<
    StravaTokenRefresh,
    | 'Invalid authorization code'
    | 'Something went wrong while fetching Strava token'
  >
> => {
  const url = `https://www.strava.com/api/v3/oauth/token`;

  const body = {
    client_id: process.env.STRAVA_CLIENT_ID,
    client_secret: process.env.STRAVA_CLIENT_SECRET,
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      console.log(response);
      return error('Invalid authorization code');
    }

    const token: StravaToken = await response.json();

    return success(token);
  } catch (e) {
    console.error('[getStravaTokenFromRefreshToken]:', e);
    return error('Something went wrong while fetching Strava token');
  }
};

const pause = (duration: number) =>
  new Promise((resolve) => setTimeout(resolve, duration));
