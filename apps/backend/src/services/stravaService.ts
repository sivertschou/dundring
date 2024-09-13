import { ApiStatus, Status, StravaToken } from '@dundring/types';
import { error, success } from '@dundring/utils';
import fetch from 'node-fetch';
import * as db from '../db';
// Import necessary Node modules
import * as fs from 'fs';
import * as FormData from 'form-data';

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

// Define the types for the options
interface UploadOptions {
  file: string; // File path to the uploaded file
  name: string; // The desired name of the resulting activity
  description: string; // The desired description of the resulting activity
  trainer: string; // Whether the activity is performed on a trainer
  commute: string; // Whether the activity should be tagged as a commute
  dataType: string; // Format of the uploaded file (e.g., 'gpx', 'fit', 'tcx')
  externalId: string; // External identifier of the resulting activity
}

// Function to upload a file to Strava
async function uploadToStrava(opts: UploadOptions, accessToken: string) {
  const fileStream = fs.createReadStream(opts.file);

  if (!fs.existsSync(opts.file)) {
    throw new Error(`File not found: ${opts.file}`);
  }

  const formData = new FormData.default();
  formData.append('file', fileStream); // Append the file stream
  formData.append('name', opts.name);
  formData.append('description', opts.description);
  formData.append('trainer', opts.trainer);
  formData.append('commute', opts.commute);
  formData.append('data_type', opts.dataType);
  formData.append('external_id', opts.externalId);

  console.log(formData);

  try {
    const response = await fetch('https://www.strava.com/api/v3/uploads', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        // Do NOT set 'Content-Type' explicitly; 'form-data' will set it automatically
      },
      body: formData, // TypeScript may complain about this, so we cast it to `any`
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('API called successfully. Returned data:', data);
  } catch (error) {
    console.error('Upload failed:', error);
  }
}

// Example usage
const opts: UploadOptions = {
  file: '/Users/mortenkolstad/Downloads/dundring_2024-09-10T2107.tcx',
  name: 'Sample Activity',
  description: 'A test activity',
  trainer: 'false',
  commute: 'false',
  dataType: 'tcx', // for example: gpx, fit, tcx
  externalId: '12345',
};
// VirtualRide;
// Call the function
//uploadToStrava(opts, '2864f41ab8fd36b995ebb6b25c49318ae6ff8907').then(console.log).catch(console.log);
// editActivity('12377793225', '2864f41ab8fd36b995ebb6b25c49318ae6ff8907');

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

  console.log(code);

  // throw Error();

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

// getStravaTokenFromAuthCode('cf9354ae6aea0518f42b5fcd8a6c81fe05c99093').then(console.log).catch(console.log);

export const updateRefreshToken = async (data: {
  athleteId: number;
  refreshToken: string;
}) => {
  db.updateStravaRefreshToken(data);
};
