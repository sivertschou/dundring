interface Environment {
  dundringHttpServerUrl: string;
  dundringWsServerUrl: string;
  stravaClientId: string;
}

export const getEnv = (): Environment => {
  const envOverride = import.meta.env.VITE_ENV_OVERRIDE || null;

  switch (envOverride) {
    case 'test':
      return {
        dundringHttpServerUrl: 'https://test.dundring.com/api',
        dundringWsServerUrl: 'wss://test.dundring.com/api',
        stravaClientId: '44718',
      };
    case 'prod':
      return {
        dundringHttpServerUrl: 'https://dundring.com/api',
        dundringWsServerUrl: 'wss://dundring.com/api',
        stravaClientId: '44718',
      };
    default:
      if (isSecureConnection()) {
        return {
          dundringHttpServerUrl: `https://${location.hostname}/api`,
          dundringWsServerUrl: `wss://${location.hostname}/api`,
          stravaClientId: '44718',
        };
      }

      const hostname = import.meta.env.VITE_HOST_OVERRIDE || 'localhost:8080';
      const stravaClientId = import.meta.env.VITE_STRAVA_CLIENT_ID || '44718';
      return {
        dundringHttpServerUrl: `http://${hostname}/api`,
        dundringWsServerUrl: `ws://${hostname}/api`,
        stravaClientId,
      };
  }
};

const isSecureConnection = () => location.protocol === 'https:';
