import { Button } from '@chakra-ui/button';
import { Download } from 'react-bootstrap-icons';
import { downloadTCX } from '../../createTcxFile';
import { useData } from '../../context/DataContext';
import { Icon } from '@chakra-ui/react';

export const DownloadTCXButton = ({
  includeGPSData,
}: {
  includeGPSData: boolean;
}) => {
  const { trackedData, distance } = useData();
  return (
    <Button
      width="100%"
      onClick={() => /* TODO: Fix this downloadTCX(data, distance, includeGPSData) */ {}}
      leftIcon={<Icon as={Download} />}
    >
      Save TCX
    </Button>
  );
};
