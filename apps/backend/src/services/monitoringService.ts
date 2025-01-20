import fetch from 'node-fetch';

require('dotenv').config();

const getSlackUrl = (): string | null => {
  const path = process.env.SLACK_TOKEN;
  if (!path) return null;

  return `https://hooks.slack.com/services/${path}`;
};

const sendSlackMessage = (message: string) => {
  const url = getSlackUrl();

  if (process.env.NODE_ENV !== 'production') {
    console.log(`[slack]: ${message}`);
    return;
  }

  if (!url) return;

  try {
    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: message }),
    });
  } catch (e) {
    console.error('[sendSlackMessage]:', e);
  }
};

export const logActivityUpload = (activityId: number) => {
  const message = `New upload: www.strava.com/activities/${activityId}`;
  sendSlackMessage(message);
};

export const logUserCreation = (user: { username: string; mail: string }) => {
  const message = `New user: *${user.username}* (${user.mail})`;
  sendSlackMessage(message);
};

export const logRoomJoin = (username: string, roomId: string) => {
  const message = `*${username}* joined group session with id *#${roomId}*`;
  sendSlackMessage(message);
};

export const logRoomCreation = (username: string, roomId: string) => {
  const message = `*${username}* created group session with id *#${roomId}*`;
  sendSlackMessage(message);
};

export const logRoomLeave = (username: string, roomId: string) => {
  const message = `*${username}* left group session with id *#${roomId}*.`;
  sendSlackMessage(message);
};

export const logRoomDeletion = (username: string, roomId: string) => {
  const message = `*${username}* left group session with id *#${roomId}*. No more users in group session; deleting it.`;
  sendSlackMessage(message);
};

export const logAndReturn = <T>(message: string, data: T) => {
  sendSlackMessage(message);
  return data;
};

export const log = (message: string) => {
  sendSlackMessage(message);
};
