import { Button } from '@chakra-ui/button';
import { Download } from 'react-bootstrap-icons';
import { Icon } from '@chakra-ui/react';
import { downloadTcx } from '../../createTcxFile';
import * as db from '../../db';

export const DownloadTCXButton = ({}: {}) => {
  return (
    <Button
      width="100%"
      onClick={async () => {
        const trackedData = await db.getTrackedData();
        downloadTcx(trackedData);
      }}
      leftIcon={<Icon as={Download} />}
    >
      Download TCX
    </Button>
  );
};
