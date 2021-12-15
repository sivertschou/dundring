import { Button } from '@chakra-ui/button';
import {
  FormControl,
  FormErrorMessage,
  FormLabel,
} from '@chakra-ui/form-control';
import { useDisclosure } from '@chakra-ui/hooks';
import { Input } from '@chakra-ui/input';
import { Icon } from '@chakra-ui/icon';
import { Link, Stack, Text } from '@chakra-ui/layout';
import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from '@chakra-ui/modal';
import { Spinner } from '@chakra-ui/react';
import * as React from 'react';
import * as api from '../../api';
import { useUser } from '../../context/UserContext';
import { ActionBarItem } from '../ActionBarItem';
import { useToast } from '@chakra-ui/react';
import { Person } from 'react-bootstrap-icons';
import * as utils from '../../utils';

export const LoginModal = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [username, setUsername] = React.useState('');
  const [mail, setMail] = React.useState('');
  const [mailIsTouched, setMailIsTouched] = React.useState(false);
  const [password, setPassword] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState('');

  const [creatingUser, setCreatingUser] = React.useState(false);
  const { setUser } = useUser();
  const toast = useToast();

  const illegalCharacters = utils.removeDuplicateWords(
    utils.getIllegalUsernameCharacters(username)
  );
  const maxUsernameLength = 20;
  const usernameContainsIllegalCharacters = illegalCharacters.length > 0;
  const usernameIsTooLong = username.length > maxUsernameLength;
  const usernameIsValid =
    !usernameIsTooLong && !usernameContainsIllegalCharacters;
  const mailIsValid = utils.mailIsValid(mail);
  const passwordIsValid = password.length > 0;
  const login = async () => {
    const trimmedUsername = username.trim();
    const trimmedPassword = password.trim();

    if (!trimmedUsername || !trimmedPassword) {
      setErrorMessage('Enter username and password.');
      return;
    }

    setIsLoading(true);
    const response = await api.login({
      username: trimmedUsername,
      password: trimmedPassword,
    });
    setIsLoading(false);

    if (response.status === 'FAILURE') {
      setErrorMessage(response.message);
    } else if (response.status === 'SUCCESS') {
      const { roles, token, username } = response.data;
      setUser({ loggedIn: true, token, roles, username, workouts: [] });
      onClose();
    }
  };

  const register = async () => {
    const trimmedMail = mail.trim();
    const trimmedUsername = username.trim();
    const trimmedPassword = password.trim();

    if (!trimmedUsername || !trimmedPassword || !trimmedMail) {
      setErrorMessage('Enter mail, username and password.');
      return;
    }
    const mailIsValid = utils.mailIsValid(mail);

    if (!mailIsValid) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    setIsLoading(true);
    const response = await api.register({
      username: trimmedUsername,
      password: trimmedPassword,
      mail: trimmedMail,
    });
    setIsLoading(false);

    if (response.status === 'FAILURE') {
      setErrorMessage(response.message);
    } else if (response.status === 'SUCCESS') {
      const { roles, token, username } = response.data;
      setUser({
        loggedIn: true,
        token,
        roles,
        username,
        workouts: [],
      });
      toast({
        title: `Created user '${username}'`,
        isClosable: true,
        duration: 5000,
        status: 'success',
      });
      onClose();
    }
  };

  return (
    <>
      <ActionBarItem
        text="Login"
        icon={<Icon as={Person} />}
        onClick={onOpen}
      />

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          {creatingUser ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                register();
              }}
            >
              <ModalHeader>Register</ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                <Stack>
                  <FormControl isInvalid={!mailIsValid && mailIsTouched}>
                    <FormLabel>Mail</FormLabel>
                    <Input
                      placeholder="Mail"
                      type="email"
                      name="email"
                      autoComplete="email"
                      value={mail}
                      onChange={(e) => {
                        setMail(e.target.value);
                        setMailIsTouched(false);
                        setErrorMessage('');
                      }}
                      onBlur={(_e) => {
                        setMailIsTouched(true);
                        setMail((mail) => mail.replace(' ', ''));
                      }}
                    />
                  </FormControl>

                  <FormControl isInvalid={!usernameIsValid}>
                    <FormLabel>Username</FormLabel>
                    <Input
                      placeholder="Username"
                      name="username"
                      autoComplete="username"
                      value={username}
                      onChange={(e) => {
                        setErrorMessage('');
                        setUsername(e.target.value.replace(' ', ''));
                      }}
                    />
                    <FormErrorMessage>
                      The username can't
                      {usernameIsTooLong
                        ? ` be more than ${maxUsernameLength} characters long`
                        : ''}
                      {usernameIsTooLong && usernameContainsIllegalCharacters
                        ? ' or'
                        : ''}
                      {usernameContainsIllegalCharacters
                        ? ` contain ${illegalCharacters.join(',')}`
                        : ''}
                      .
                    </FormErrorMessage>
                  </FormControl>

                  <FormControl>
                    <FormLabel>Password</FormLabel>
                    <Input
                      placeholder="Password"
                      type="password"
                      name="password"
                      autoComplete="password"
                      value={password}
                      onChange={(e) => {
                        setErrorMessage('');
                        setPassword(e.target.value);
                      }}
                      onBlur={(_e) => {
                        setPassword((password) => password.trim());
                      }}
                    />
                  </FormControl>
                  <Link
                    onClick={() => {
                      setErrorMessage('');
                      setCreatingUser(false);
                    }}
                  >
                    Already have an account? Login
                  </Link>
                  {errorMessage ? (
                    <Text color="red.500">{errorMessage}</Text>
                  ) : null}
                </Stack>
              </ModalBody>

              <ModalFooter>
                {!isLoading ? (
                  <Button
                    onClick={() => register()}
                    isDisabled={
                      !usernameIsValid || !mailIsValid || !passwordIsValid
                    }
                    type="submit"
                  >
                    Register
                  </Button>
                ) : (
                  <Spinner />
                )}
              </ModalFooter>
            </form>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                login();
              }}
            >
              <ModalHeader>Login</ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                <Stack>
                  <FormControl>
                    <FormLabel>Username</FormLabel>
                    <Input
                      placeholder="Username"
                      name="username"
                      autoComplete="username"
                      value={username}
                      onChange={(e) => {
                        setErrorMessage('');
                        setUsername(e.target.value);
                      }}
                      onBlur={(_e) => {
                        setUsername((username) => username.trim());
                      }}
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Password</FormLabel>
                    <Input
                      placeholder="Password"
                      type="password"
                      name="password"
                      autoComplete="password"
                      value={password}
                      onChange={(e) => {
                        setErrorMessage('');
                        setPassword(e.target.value);
                      }}
                      onBlur={(_e) => {
                        setPassword((password) => password.trim());
                      }}
                    />
                  </FormControl>
                  <Link
                    onClick={() => {
                      setErrorMessage('');
                      setCreatingUser(true);
                    }}
                  >
                    Create user
                  </Link>
                  {errorMessage ? (
                    <Text color="red.500">{errorMessage}</Text>
                  ) : null}
                </Stack>
              </ModalBody>

              <ModalFooter>
                {!isLoading ? (
                  <Button onClick={() => login()} type="submit">
                    Login
                  </Button>
                ) : (
                  <Spinner />
                )}
              </ModalFooter>
            </form>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};
