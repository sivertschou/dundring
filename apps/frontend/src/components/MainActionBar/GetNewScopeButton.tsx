import { Button } from '@chakra-ui/button';
import { Download } from 'react-bootstrap-icons';
import { Icon } from '@chakra-ui/react';
import { useUser } from '../../context/UserContext';

export const GetNewScopeButton = () => {
  const { user } = useUser();
  // if (!user.loggedIn || !user.stravaData || user.stravaData.scopes.activityWrite) {
  //   return;
  // }

  return (
    <Button width="100%" onClick={() => {}} leftIcon={<Icon as={Download} />}>
      GET SCOPE
    </Button>
  );
};
