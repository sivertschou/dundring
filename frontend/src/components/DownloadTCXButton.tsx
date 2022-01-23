import * as React from 'react';

import { Button } from '@chakra-ui/button';
import { useData } from '../context/DataContext';
import { toTCX } from '../createTcxFile';
import Icon from '@chakra-ui/icon';
import { Download } from 'react-bootstrap-icons';
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
