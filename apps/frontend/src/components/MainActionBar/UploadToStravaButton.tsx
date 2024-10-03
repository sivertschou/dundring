import { Button } from '@chakra-ui/button';
import { Download } from 'react-bootstrap-icons';
import { toTcxString } from '../../createTcxFile';
import { useData } from '../../context/DataContext';
import { Icon, useToast } from '@chakra-ui/react';
import * as api from '../../api';
import { useUser } from '../../context/UserContext';
import { ApiStatus } from '@dundring/types';
import { useState } from 'react';
import { useLinkPowerColor } from '../../hooks/useLinkColor';
import { useActiveWorkout } from '../../context/ActiveWorkoutContext';

export const UploadToStravaButton = ({
  includeGPSData,
}: {
  includeGPSData: boolean;
}) => {
  const { data, distance } = useData();
  const { user } = useUser();
  const { activeWorkout } = useActiveWorkout();

  const [state, setState] = useState<UploadState>({ type: 'NotAsked' });

  const linkColor = useLinkPowerColor();

  const toast = useToast();

  if (!user.loggedIn || !user.stravaData?.scopes.activityWrite) {
    return null;
  }
  if (state.type === 'Loading') {
    return (
      <Button as="a" color={linkColor} variant="link" isLoading={true}></Button>
    );
  }
  if (state.type === 'Success') {
    return (
      <Button
        as="a"
        color={linkColor}
        href={`https://www.strava.com/activities/${state.activityId}`}
        variant="link"
      >
        Go to Strava-activity
      </Button>
    );
  }
  return (
    <Button
      width="100%"
      onClick={async () => {
        setState({ type: 'Loading' });
        api
          .uploadActivity(user.token, {
            tcxFile: toTcxString(data, distance, includeGPSData),
            name: activeWorkout.workout?.name ?? null,
          })
          .then((response) => {
            if (response.status === ApiStatus.FAILURE) {
              setState({ type: 'Error', msg: response.message });
              toast({
                title: `Api Failure :  ${response.message}`,
                isClosable: true,
                duration: 10000,
                status: 'error',
              });
            } else {
              setState({
                type: 'Success',
                activityId: response.data.activity_id,
              });
              toast({
                title: `Activity upload to Strava!`,
                isClosable: true,
                duration: 5000,
                status: 'success',
              });
            }
          })
          .catch((err) => {
            console.error(err);
            setState({ type: 'Error', msg: err.toString });
            toast({
              title: `Upload failed : ${err}`,
              isClosable: true,
              duration: 10000,
              status: 'error',
            });
          });
      }}
      leftIcon={<Icon as={Download} />}
    >
      Upload to Strava
    </Button>
  );
};

type UploadState =
  | { type: 'NotAsked' }
  | { type: 'Loading' }
  | { type: 'Error'; msg: string }
  | { type: 'Success'; activityId: number };
