import { Box } from '@chakra-ui/react';
import { useUser } from '../../context/UserContext';
import { ConnectWithStravaButton } from '../ConnectWithStravaButton';

export const GetNewScopeButton = () => {
  const { user } = useUser();

  if (
    !user.loggedIn ||
    !user.stravaData ||
    user.stravaData.scopes.activityWrite
  ) {
    return;
  }

  return (
    <Box width="100%">
      To allow for upload to strava, you need to connect to strava and give
      activity write permissions
      <ConnectWithStravaButton />
    </Box>
  );
};
