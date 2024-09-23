import { Button } from '@chakra-ui/button';
import { FormControl, FormLabel } from '@chakra-ui/form-control';
import { Input } from '@chakra-ui/input';
import { Stack, Text } from '@chakra-ui/layout';
import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from '@chakra-ui/modal';
import {
  AbsoluteCenter,
  Box,
  Center,
  Divider,
  Flex,
  HStack,
  Spinner,
} from '@chakra-ui/react';
import * as React from 'react';
import * as api from '../../api';
import { useUser } from '../../context/UserContext';
import { useToast } from '@chakra-ui/react';
import { useLoginModal } from '../../context/ModalContext';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { ApiStatus } from '@dundring/types';
import * as utils from '@dundring/utils';
import { ConnectWithStravaButton } from '../ConnectWithStravaButton';

interface EditableString {
  value: string;
  touched: boolean;
}

interface LoginState {
  type: 'login';
  mail: EditableString;
  errorMessage?: string;
  isLoading: boolean;
}

interface MailSentState {
  type: 'mail-sent';
  mail: string;
  userExists: boolean;
}

type State = LoginState | MailSentState;
const codesSent: Map<string, boolean> = new Map();

const MailSent = ({
  state,
  isOpen,
  onClose,
}: {
  state: MailSentState;
  isOpen: boolean;
  onClose: () => void;
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Sign in</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Stack>
            {state.userExists ? (
              <Text>
                Mail sent to {state.mail}! Check your mail to sign in!
              </Text>
            ) : (
              <>
                <Text>
                  We could not find a user registered to {state.mail}, so we
                  have sent you a link that can be used to create a user.
                </Text>

                <Text>
                  If you know that you already have created a user, try signing
                  in with one of the other alternatives.
                </Text>
              </>
            )}
          </Stack>
        </ModalBody>
        <ModalFooter />
      </ModalContent>
    </Modal>
  );
};

const Login = ({
  state,
  setErrorMessage,
  setIsLoading,
  setMail,
  goToMailSent,
  isOpen,
  onClose,
}: {
  state: LoginState;
  setErrorMessage: (message?: string) => void;
  setMail: (mail: string, touched: boolean) => void;
  setIsLoading: (isLoading: boolean) => void;
  goToMailSent: (mail: string, userExists: boolean) => void;
  isOpen: boolean;
  onClose: () => void;
}) => {
  const toast = useToast();

  const mail = state.mail.value;
  const mailIsTouched = state.mail.touched;
  const mailIsValid = utils.mailIsValid(mail);

  const loginWithMail = async () => {
    const trimmedMail = state.mail.value.trim();

    if (!trimmedMail) {
      setErrorMessage('Enter your e-mail address.');
      return;
    }

    setIsLoading(true);
    const response = await api.requestLoginLinkMail({
      mail: trimmedMail,
    });
    setIsLoading(false);

    if (response.status === 'FAILURE') {
      setErrorMessage(response.message);
    } else if (response.status === 'SUCCESS') {
      goToMailSent(trimmedMail, response.data === 'Login link sent');

      const text =
        response.data === 'Login link sent'
          ? {
              title: 'Login link sent!',
              description: `An e-mail with a sign in link has been sent to ${trimmedMail}!`,
            }
          : {
              title: 'Sign up link sent!',
              description: `We couldn't find a user registered to ${trimmedMail}, so we sent you a link that can be used to create a user.`,
            };

      toast({
        title: text.title,
        description: text.description,
        isClosable: true,
        duration: 60000,
        status: 'success',
      });
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        {
          <form
            onSubmit={(e) => {
              e.preventDefault();
              loginWithMail();
            }}
          >
            <ModalHeader>Sign in</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Stack spacing="10">
                <HStack>
                  <FormControl isInvalid={!mailIsValid && mailIsTouched}>
                    <FormLabel>Mail</FormLabel>
                    <Input
                      placeholder="Mail"
                      type="email"
                      name="email"
                      autoComplete="email"
                      id="email"
                      value={mail}
                      onChange={(e) => {
                        setMail(e.target.value, false);
                        setErrorMessage('');
                      }}
                      onBlur={(_) => setMail(mail.replace(' ', ''), true)}
                    />
                  </FormControl>

                  {state.errorMessage ? (
                    <Text color="red.500">{state.errorMessage}</Text>
                  ) : null}
                  {!state.isLoading ? (
                    <Flex alignSelf="end">
                      <Button
                        onClick={() => loginWithMail()}
                        isDisabled={!mailIsValid}
                        type="submit"
                      >
                        Continue with mail
                      </Button>
                    </Flex>
                  ) : (
                    <Spinner />
                  )}
                </HStack>
                <Box position="relative">
                  <Divider />
                  <AbsoluteCenter px="4">or</AbsoluteCenter>
                </Box>
                <Center>
                  <ConnectWithStravaButton />
                </Center>
              </Stack>
            </ModalBody>
          </form>
        }
      </ModalContent>
    </Modal>
  );
};

const setMail = (state: State, mail: string, touched: boolean): State => {
  switch (state.type) {
    case 'login':
      return { ...state, mail: { value: mail, touched } };
    case 'mail-sent':
      return state;
  }
};

const setErrorMessage = (state: State, msg?: string): State => {
  switch (state.type) {
    case 'login':
      return { ...state, errorMessage: msg };
    case 'mail-sent':
      return state;
  }
};

const setIsLoading = (state: State, isLoading: boolean): State => {
  switch (state.type) {
    case 'login':
      return { ...state, isLoading };
    case 'mail-sent':
      return state;
  }
};
export const LoginModal = () => {
  const { isOpen } = useLoginModal();
  const navigate = useNavigate();
  const location = useLocation();
  const [state, setState] = React.useState<State>({
    type: 'login',
    mail: { value: '', touched: false },
    isLoading: false,
  });

  const { setUser } = useUser();
  const toast = useToast();

  const code = useSearchParams()[0].get('code');
  const scopes = useSearchParams()[0].get('scope');

  const onClose = React.useCallback(() => {
    navigate('/');
  }, [navigate]);

  React.useEffect(() => {
    const authenticate = async (code: string, scope: string) => {
      try {
        console.log('try');
        if (codesSent.get(code)) return;
        codesSent.set(code, true);

        const ret = location.pathname.includes('/auth/strava')
          ? await api.authenticateStravaLogin({ code, scope })
          : await api.authenticateMailLogin({ code });

        if (ret.status === ApiStatus.SUCCESS) {
          setUser({
            ...ret.data.data,
            loggedIn: true,
            workouts: [],
          });
          if (ret.data.user_created || utils.settingUpProfile(ret.data.data)) {
            navigate('/profile');
          } else {
            toast({
              title: `Logged in as ${ret.data.data.username}`,
              isClosable: true,
              duration: 5000,
              status: 'success',
            });
            onClose();
          }
        }
      } catch (error) {
        console.error(error);
      }
    };

    if (code && scopes) {
      authenticate(code, scopes).catch(console.error);
    }
  }, [code, scopes]);

  switch (state.type) {
    case 'mail-sent':
      return <MailSent state={state} isOpen={isOpen} onClose={onClose} />;
    case 'login':
      return (
        <Login
          state={state}
          setMail={(mail, touched) =>
            setState((s) => setMail(s, mail, touched))
          }
          setIsLoading={(isLoading) =>
            setState((s) => setIsLoading(s, isLoading))
          }
          setErrorMessage={(error) =>
            setState((s) => setErrorMessage(s, error))
          }
          goToMailSent={(mail: string, userExists: boolean) =>
            setState({ type: 'mail-sent', mail, userExists })
          }
          isOpen={isOpen}
          onClose={onClose}
        />
      );
  }
};
