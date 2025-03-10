import fetch from 'node-fetch';

require('dotenv').config();

const monitoringConfigFromEnv = () => ({
  slackToken: process.env.SLACK_TOKEN,
  discordWebhookUrl: process.env.DISCORD_WEBHOOK_URL,
});

export const checkMonitoringConfig = () => {
  const config = monitoringConfigFromEnv();
  if (!config.slackToken) {
    console.log(
      '[.env]: No Slack token provided. Override this by setting SLACK_TOKEN in the environment config.'
    );
  }

  if (!config.discordWebhookUrl) {
    console.log(
      '[.env]: No Discord webhook URL provided. Override this by setting DISCORD_WEBHOOK_URL in the environment config.'
    );
  }
};

const getSlackUrl = (): string | null => {
  const path = monitoringConfigFromEnv().slackToken;
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

const getDiscordUrl = (): string | null => {
  const url = monitoringConfigFromEnv().discordWebhookUrl;

  if (!url) return null;

  return url;
};

const sendDiscordMessage = (message: string) => {
  const url = getDiscordUrl();

  if (process.env.NODE_ENV !== 'production') {
    console.log(`[discord]: ${message}`);
    return;
  }

  if (!url) return;

  try {
    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content: message }),
    });
  } catch (e) {
    console.error('[sendDiscordMessage]:', e);
  }
};

export const logActivityUpload = (activityId: number) => {
  const message = `New upload: www.strava.com/activities/${activityId}`;
  log(message);
};

export const logUserCreation = (user: { username: string; mail: string }) => {
  const message = `New user: *${user.username}* (${user.mail})`;
  log(message);
};

export const logRoomJoin = (username: string, roomId: string) => {
  const message = `*${username}* joined group session with id *#${roomId}*`;
  log(message);
};

export const logRoomCreation = (username: string, roomId: string) => {
  const message = `*${username}* created group session with id *#${roomId}*`;
  log(message);
};

export const logRoomLeave = (username: string, roomId: string) => {
  const message = `*${username}* left group session with id *#${roomId}*.`;
  log(message);
};

export const logRoomDeletion = (username: string, roomId: string) => {
  const message = `*${username}* left group session with id *#${roomId}*. No more users in group session; deleting it.`;
  log(message);
};

export const logAndReturn = <T>(message: string, data: T) => {
  log(message);
  return data;
};

export const log = (message: string) => {
  sendSlackMessage(message);
  sendDiscordMessage(message);
};
