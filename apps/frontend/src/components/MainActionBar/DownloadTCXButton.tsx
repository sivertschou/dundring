import { Button } from '@chakra-ui/button';
import { Download } from 'react-bootstrap-icons';
import { useData } from '../../context/DataContext';
import { Icon } from '@chakra-ui/react';
import { downloadTcx } from '../../createTcxFile';

export const DownloadTCXButton = ({}: {}) => {
  const { trackedData } = useData();
  return (
    <Button
      width="100%"
      onClick={() => downloadTcx(trackedData)}
      leftIcon={<Icon as={Download} />}
    >
      Download TCX
    </Button>
  );
};
