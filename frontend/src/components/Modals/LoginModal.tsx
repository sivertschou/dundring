import { Button } from "@chakra-ui/button";
import { FormControl, FormLabel } from "@chakra-ui/form-control";
import { useDisclosure } from "@chakra-ui/hooks";
import { Input } from "@chakra-ui/input";
import { Icon } from "@chakra-ui/icon";
import { Link, Stack, Text } from "@chakra-ui/layout";
import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from "@chakra-ui/modal";
import { Spinner } from "@chakra-ui/react";
import * as React from "react";
import * as api from "../../api";
import { useUser } from "../../context/UserContext";
import { BsPerson } from "react-icons/bs";
import { ActionBarItem } from "../ActionBarItem";

export const LoginModal = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [username, setUsername] = React.useState("");
  const [mail, setMail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState("");

  const [creatingUser, setCreatingUser] = React.useState(false);
  const { setUser } = useUser();

  const login = async () => {
    const trimmedUsername = username.trim();
    const trimmedPassword = password.trim();

    if (!trimmedUsername || !trimmedPassword) {
      setErrorMessage("Enter username and password.");
      return;
    }

    setIsLoading(true);
    const response = await api.login({
      username: trimmedUsername,
      password: trimmedPassword,
    });
    setIsLoading(false);

    if (response.status === "FAILURE") {
      setErrorMessage(response.message);
    } else if (response.status === "SUCCESS") {
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
      setErrorMessage("Enter mail, username and password.");
      return;
    }
    // https://emailregex.com/
    const mailIsValid = /.+@.+\..+/.test(trimmedMail);

    if (!mailIsValid) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }
    setIsLoading(true);
    const response = await api.register({
      username: trimmedUsername,
      password: trimmedPassword,
      mail: trimmedMail,
    });
    setIsLoading(false);

    if (response.status === "FAILURE") {
      setErrorMessage(response.message);
    } else if (response.status === "SUCCESS") {
      const { roles, token, username } = response.data;
      setUser({
        loggedIn: true,
        token,
        roles,
        username,
        workouts: [],
      });
      onClose();
    }
  };

  return (
    <>
      <ActionBarItem
        text="Login"
        ariaLabel="login"
        icon={<Icon as={BsPerson} boxSize="1.5rem" />}
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
                  <FormControl>
                    <FormLabel>Mail</FormLabel>
                    <Input
                      placeholder="Mail"
                      type="email"
                      name="email"
                      autoComplete="email"
                      value={mail}
                      onChange={(e) => {
                        setErrorMessage("");
                        setMail(e.target.value);
                      }}
                      onBlur={(_e) => {
                        setMail((mail) => mail.trim());
                      }}
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Username</FormLabel>
                    <Input
                      placeholder="Username"
                      name="username"
                      autoComplete="username"
                      value={username}
                      onChange={(e) => {
                        setErrorMessage("");
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
                        setErrorMessage("");
                        setPassword(e.target.value);
                      }}
                      onBlur={(_e) => {
                        setPassword((password) => password.trim());
                      }}
                    />
                  </FormControl>
                  <Link
                    onClick={() => {
                      setErrorMessage("");
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
                  <Button onClick={() => register()}>Register</Button>
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
                        setErrorMessage("");
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
                        setErrorMessage("");
                        setPassword(e.target.value);
                      }}
                      onBlur={(_e) => {
                        setPassword((password) => password.trim());
                      }}
                    />
                  </FormControl>
                  <Link
                    onClick={() => {
                      setErrorMessage("");
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
