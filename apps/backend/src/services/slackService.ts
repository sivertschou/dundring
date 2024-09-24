import fetch from 'node-fetch';

require('dotenv').config();

export const checkSlackConfig = () => {
  if (!process.env.SLACK_USER_CREATION) {
    console.log(
      '[.env]: No Slack service for user creation provided. Override this by setting the SLACK_USER_CREATION in the environment config.'
    );
  }
  if (!process.env.SLACK_ERRORS) {
    console.log(
      '[.env]: No Slack service for errors provided. Override this by setting the SLACK_ERRORS in the environment config.'
    );
  }
  if (!process.env.SLACK_GROUP_SESSION) {
    console.log(
      '[.env]: No Slack service for group session provided. Override this by setting the SLACK_GROUP_SESSION in the environment config.'
    );
  }
  if (!process.env.SLACK_FEEDBACK) {
    console.log(
      '[.env]: No Slack service for feedback provided. Override this by setting the SLACK_FEEDBACK in the environment config.'
    );
  }
  if (!process.env.SLACK_STRAVA_UPLOAD) {
    console.log(
      '[.env]: No Slack service for feedback provided. Override this by setting the SLACK_FEEDBACK in the environment config.'
    );
  }
};

enum SlackService {
  USER_CREATION,
  ERRORS,
  GROUP_SESSION,
  FEEDBACK,
  STRAVA_UPLOAD,
}

const getServicePath = (service: SlackService): string | null => {
  switch (service) {
    case SlackService.USER_CREATION:
      return process.env.SLACK_USER_CREATION || null;
    case SlackService.ERRORS:
      return process.env.SLACK_ERRORS || null;
    case SlackService.GROUP_SESSION:
      return process.env.SLACK_GROUP_SESSION || null;
    case SlackService.FEEDBACK:
      return process.env.SLACK_FEEDBACK || null;
    case SlackService.STRAVA_UPLOAD:
      return process.env.SLACK_STRAVA_UPLOAD || null;
  }
};

const getServiceUrl = (service: SlackService): string | null => {
  const path = getServicePath(service);
  if (!path) return null;

  return `https://hooks.slack.com/services/${path}`;
};

const sendSlackMessage = (service: SlackService, message: string) => {
  const url = getServiceUrl(service);

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
  sendSlackMessage(SlackService.STRAVA_UPLOAD, message);
};

export const logUserCreation = (user: { username: string; mail: string }) => {
  const message = `New user: *${user.username}* (${user.mail})`;
  sendSlackMessage(SlackService.USER_CREATION, message);
};

export const logRoomJoin = (username: string, roomId: string) => {
  const message = `*${username}* joined group session with id *#${roomId}*`;
  sendSlackMessage(SlackService.GROUP_SESSION, message);
};

export const logRoomCreation = (username: string, roomId: string) => {
  const message = `*${username}* created group session with id *#${roomId}*`;
  sendSlackMessage(SlackService.GROUP_SESSION, message);
};

export const logRoomLeave = (username: string, roomId: string) => {
  const message = `*${username}* left group session with id *#${roomId}*.`;
  sendSlackMessage(SlackService.GROUP_SESSION, message);
};

export const logRoomDeletion = (username: string, roomId: string) => {
  const message = `*${username}* left group session with id *#${roomId}*. No more users in group session; deleting it.`;
  sendSlackMessage(SlackService.GROUP_SESSION, message);
};

export const logAndReturn = <T>(message: string, data: T) => {
  sendSlackMessage(SlackService.ERRORS, message);
  return data;
};

export const log = (message: string) => {
  sendSlackMessage(SlackService.ERRORS, message);
};
