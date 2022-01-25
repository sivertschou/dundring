import { Button } from '@chakra-ui/button';
import Icon from '@chakra-ui/icon';
import { Download } from 'react-bootstrap-icons';
import { toTCX } from '../../createTcxFile';
import { useData } from '../../context/DataContext';

export const DownloadTCXButton = () => {
  const { data } = useData();
  return (
    <Button
      width="100%"
      onClick={() => toTCX(data)}
      leftIcon={<Icon as={Download} />}
    >
      Save TCX
    </Button>
  );
};
