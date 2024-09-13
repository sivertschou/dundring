import { Button } from '@chakra-ui/button';
import { Download } from 'react-bootstrap-icons';
import { toTCX } from '../../createTcxFile';
import { useData } from '../../context/DataContext';
import { Icon } from '@chakra-ui/react';

export const UploadToStravaButton = ({
  includeGPSData,
}: {
  includeGPSData: boolean;
}) => {
  const { data, distance } = useData();
  console.log(data);
  return (
    <Button width="100%" onClick={() => {}} leftIcon={<Icon as={Download} />}>
      Upload to Strava
    </Button>
  );
};

// const uploadToStrava
