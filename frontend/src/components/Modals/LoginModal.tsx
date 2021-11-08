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
    setIsLoading(true);
    const response = await api.login({ username, password });
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
    setIsLoading(true);
    const response = await api.register({ username, password, mail });
    setIsLoading(false);

    if (response.status === "FAILURE") {
      setErrorMessage(response.message);
    } else if (response.status === "SUCCESS") {
      const { roles, token, username } = response.data;
      setUser({ loggedIn: true, token, roles, username, workouts: [] });
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
            <>
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
                      onChange={(e) => setMail(e.target.value)}
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Username</FormLabel>
                    <Input
                      placeholder="Username"
                      name="username"
                      autoComplete="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
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
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </FormControl>
                  <Link onClick={() => setCreatingUser(false)}>
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
            </>
          ) : (
            <>
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
                      onChange={(e) => setUsername(e.target.value)}
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
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </FormControl>
                  <Link onClick={() => setCreatingUser(true)}>Create user</Link>
                  {errorMessage ? (
                    <Text color="red.500">{errorMessage}</Text>
                  ) : null}
                </Stack>
              </ModalBody>

              <ModalFooter>
                {!isLoading ? (
                  <Button onClick={() => login()}>Login</Button>
                ) : (
                  <Spinner />
                )}
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};
