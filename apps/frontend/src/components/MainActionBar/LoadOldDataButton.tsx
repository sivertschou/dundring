import { Button } from '@chakra-ui/button';
import Icon from '@chakra-ui/icon';
import { Recycle } from 'react-bootstrap-icons';
import { useData } from '../../context/DataContext';

export const LoadOldDataButton = () => {
  const { override } = useData();
  return (
    <Button width="100%" onClick={override} leftIcon={<Icon as={Recycle} />}>
      Load old data
    </Button>
  );
};
