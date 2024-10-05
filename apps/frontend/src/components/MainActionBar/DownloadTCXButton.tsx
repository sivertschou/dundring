import { Button } from '@chakra-ui/button';
import { Download } from 'react-bootstrap-icons';
import { useData } from '../../context/DataContext';
import { Icon } from '@chakra-ui/react';
import { downloadTcx } from '../../createTcxFile';

export const DownloadTCXButton = ({}: {}) => {
  const { data, distance } = useData();
  return (
    <Button
      width="100%"
      onClick={() => downloadTcx(data, distance)}
      leftIcon={<Icon as={Download} />}
    >
      Save TCX
    </Button>
  );
};
