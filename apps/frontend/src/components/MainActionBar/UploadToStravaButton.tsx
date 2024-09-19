import { Button } from '@chakra-ui/button';
import { Download } from 'react-bootstrap-icons';
import { toTcxString } from '../../createTcxFile';
import { useData } from '../../context/DataContext';
import { Icon, useToast } from '@chakra-ui/react';
import * as api from '../../api';
import { useUser } from '../../context/UserContext';
import { ApiStatus } from '@dundring/types';
import { useState } from 'react';
import { Link } from '@chakra-ui/layout';
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

  const [activityId, setActivityId] = useState<number | null>(null);

  const linkColor = useLinkPowerColor();

  const toast = useToast();
  console.log(user);
  if (!user.loggedIn) {
    return null;
  }
  console.log(activityId);
  if (activityId) {
    console.log('her');
    return (
      <Button variant="link">
        heihei
        <Link
          color={linkColor}
          href={`www.strava.com/activities/${activityId}`}
        />
      </Button>
    );
  }
  return (
    <Button
      width="100%"
      onClick={async () => {
        api
          .uploadActivity(user.token, {
            tcxFile: toTcxString(data, distance, includeGPSData),
            name: activeWorkout.workout?.name ?? null,
          })
          .then((response) => {
            if (response.status === ApiStatus.FAILURE) {
              return toast({
                title: `FAILURE ${response.message}`,
                isClosable: true,
                duration: 10000,
                status: 'error',
              });
            }
            setActivityId(response.data.activity_id);
            toast({
              title: `Strava upload success! ${response.data.activity_id}`,
              isClosable: true,
              duration: 10000,
              status: 'success',
            });
          })
          .catch((err) => {
            console.error(err);
            toast({
              title: `FAILURE ${err}`,
              isClosable: true,
              duration: 10000,
              status: 'error',
            });
          });
      }}
      leftIcon={<Icon as={Download} />}
    >
      Upload to Stxrava
    </Button>
  );
};

// const uploadToStrava
