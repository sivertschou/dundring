import {
  Modal,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
} from '@chakra-ui/modal';
import * as React from 'react';
import { Button } from '@chakra-ui/button';
import { Stack } from '@chakra-ui/layout';
import { useUser } from '../../context/UserContext';
import {
  FormControl,
  FormErrorMessage,
  FormLabel,
} from '@chakra-ui/form-control';
import { Input, InputGroup, InputRightAddon } from '@chakra-ui/input';
import * as utils from '../../utils';
import * as api from '../../api';
import { useToast } from '@chakra-ui/toast';
import { useProfileModal } from '../../context/ModalContext';

export const ProfileModal = () => {
  const { isOpen, onClose } = useProfileModal();
  const { user, setUser } = useUser();
  const [ftpInput, setFtpInput] = React.useState(
    '' + (user.loggedIn ? user.ftp : 250)
  );
  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState('');
  const toast = useToast();

  if (!user.loggedIn) return null;

  const updateFtp = async (input: string) => {
    if (isLoading || !inputIsValid(input.trim())) {
      return;
    }

    const response = await api.updateUser(user.token, {
      ftp: parseInt(input.trim()),
    });
    setIsLoading(false);

    if (response.status === 'FAILURE') {
      setErrorMessage(response.message);
    } else if (response.status === 'SUCCESS') {
      const { ftp } = response.data;
      setUser({ ...user, ftp });
      toast({
        title: `FTP set to ${ftp}`,
        isClosable: true,
        duration: 5000,
        status: 'success',
      });
    }
  };

  const inputIsValid = (input: string) =>
    input !== '' &&
    utils.stringIsValidUnsignedInt(input) &&
    parseInt(input) !== 0;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Profile: {user.username}</ModalHeader>
        <ModalCloseButton />
        <Stack p="5">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              updateFtp(ftpInput);
            }}
          >
            <Stack>
              <FormControl isInvalid={!inputIsValid(ftpInput.trim())}>
                <FormLabel>Your FTP</FormLabel>
                <InputGroup>
                  <Input
                    placeholder="E.g. 250"
                    type="ftp"
                    name="ftp"
                    value={ftpInput}
                    onChange={(e) => {
                      setFtpInput(e.target.value.replace(' ', ''));
                    }}
                    onBlur={(_e) => {
                      setFtpInput((guestUsername) => guestUsername.trim());
                    }}
                  />
                  <InputRightAddon children="Watt" />
                </InputGroup>
                <FormErrorMessage>
                  The FTP needs to be a positive unsigned integer
                </FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={errorMessage !== ''}>
                <Button
                  type="submit"
                  isDisabled={isLoading || ftpInput === '' + user.ftp}
                >
                  Update FTP
                </Button>
                <FormErrorMessage>{errorMessage}</FormErrorMessage>
              </FormControl>
            </Stack>
          </form>
        </Stack>
      </ModalContent>
    </Modal>
  );
};
