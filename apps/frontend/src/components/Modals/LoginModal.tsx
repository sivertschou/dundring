import {Button} from '@chakra-ui/button';
import {
	FormControl,
	FormErrorMessage,
	FormLabel,
} from '@chakra-ui/form-control';
import {Input} from '@chakra-ui/input';
import {Stack, Text} from '@chakra-ui/layout';
import {
	Modal,
	ModalBody,
	ModalCloseButton,
	ModalContent,
	ModalFooter,
	ModalHeader,
	ModalOverlay,
} from '@chakra-ui/modal';
import {Spinner} from '@chakra-ui/react';
import * as React from 'react';
import * as api from '../../api';
import {useUser} from '../../context/UserContext';
import {useToast} from '@chakra-ui/react';
import {useLoginModal} from '../../context/ModalContext';
import {useNavigate, useSearchParams} from 'react-router-dom';
import {ApiStatus} from '@dundring/types';
import * as utils from '@dundring/utils';
import {maxUsernameLength} from '@dundring/utils';

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

interface RegisterState {
	type: 'register';
	mail: string;
	username: EditableString;
	ticket: string;
	isLoading: boolean;
	errorMessage?: string;
}

interface MailSentState {
	type: 'mail-sent';
	mail: string;
	userExists: boolean;
}

type State = LoginState | RegisterState | MailSentState;

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

const Register = ({
	state,
	setErrorMessage,
	setIsLoading,
	setUsername,
	isOpen,
	onClose,
}: {
	state: RegisterState;
	setErrorMessage: (message?: string) => void;
	setUsername: (username: string, touched: boolean) => void;
	setIsLoading: (isLoading: boolean) => void;
	isOpen: boolean;
	onClose: () => void;
}) => {
	const {setUser} = useUser();
	const toast = useToast();

	const mail = state.mail;
	const username = state.username.value;
	const usernameIsTouched = state.username.touched;

	const usernameIsTooLong = utils.usernameIsTooLong(username);
	const illegalCharacters = utils.illegalCharactersInUsername(username);
	const usernameContainsIllegalCharacters = illegalCharacters.length > 0;

	const registerWithMail = async () => {
		const trimmedUsername = username;

		if (!trimmedUsername) {
			setErrorMessage('Enter a username');
			return;
		}

		setIsLoading(true);
		const response = await api.registerMailLogin({
			username: trimmedUsername,
			ticket: state.ticket,
		});
		setIsLoading(false);

		if (response.status === 'FAILURE') {
			setErrorMessage(response.message);
		} else if (response.status === 'SUCCESS') {
			const {token, username, ftp} = response.data;
			setUser({
				loggedIn: true,
				token,
				username,
				ftp,
				workouts: [],
			});
			toast({
				title: `Created user ${username}`,
				isClosable: true,
				duration: 5000,
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
						onSubmit={e => {
							e.preventDefault();
							registerWithMail();
						}}
					>
						<ModalHeader>Sign in</ModalHeader>
						<ModalCloseButton />
						<ModalBody>
							<Stack>
								<FormControl>
									<FormLabel>Mail</FormLabel>
									<Input
										isDisabled={true}
										placeholder="Mail"
										type="email"
										name="email"
										autoComplete="email"
										id="email"
										value={mail}
									/>
								</FormControl>

								<FormControl
									isInvalid={
										!utils.usernameIsValid(username) && usernameIsTouched
									}
								>
									<FormLabel>Username</FormLabel>
									<Input
										placeholder="username"
										type="text"
										name="username"
										autoComplete="username"
										id="username"
										value={username}
										onChange={e => {
											setUsername(e.target.value, false);
											setErrorMessage('');
										}}
										onBlur={_ => setUsername(username.replace(' ', ''), true)}
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

								{state.errorMessage ? (
									<Text color="red.500">{state.errorMessage}</Text>
								) : null}
							</Stack>
						</ModalBody>

						<ModalFooter>
							{!state.isLoading ? (
								<Button
									isDisabled={!utils.usernameIsValid(username)}
									type="submit"
								>
									Create user
								</Button>
							) : (
								<Spinner />
							)}
						</ModalFooter>
					</form>
				}
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
						onSubmit={e => {
							e.preventDefault();
							loginWithMail();
						}}
					>
						<ModalHeader>Sign in</ModalHeader>
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
										id="email"
										value={mail}
										onChange={e => {
											setMail(e.target.value, false);
											setErrorMessage('');
										}}
										onBlur={_ => setMail(mail.replace(' ', ''), true)}
									/>
								</FormControl>

								{state.errorMessage ? (
									<Text color="red.500">{state.errorMessage}</Text>
								) : null}
							</Stack>
						</ModalBody>

						<ModalFooter>
							{!state.isLoading ? (
								<Button
									onClick={() => loginWithMail()}
									isDisabled={!mailIsValid}
									type="submit"
								>
									Continue with e-Mail
								</Button>
							) : (
								<Spinner />
							)}
						</ModalFooter>
					</form>
				}
			</ModalContent>
		</Modal>
	);
};

const setMail = (state: State, mail: string, touched: boolean): State => {
	switch (state.type) {
		case 'login':
			return {...state, mail: {value: mail, touched}};
		case 'mail-sent':
		case 'register':
			return state;
	}
};

const setUsername = (
	state: State,
	username: string,
	touched: boolean,
): State => {
	switch (state.type) {
		case 'register':
			return {...state, username: {value: username, touched}};
		case 'login':
		case 'mail-sent':
			return state;
	}
};
const setErrorMessage = (state: State, msg?: string): State => {
	switch (state.type) {
		case 'login':
		case 'register':
			return {...state, errorMessage: msg};
		case 'mail-sent':
			return state;
	}
};

const setIsLoading = (state: State, isLoading: boolean): State => {
	switch (state.type) {
		case 'login':
		case 'register':
			return {...state, isLoading};
		case 'mail-sent':
			return state;
	}
};
export const LoginModal = () => {
	const {isOpen} = useLoginModal();
	const navigate = useNavigate();
	const [state, setState] = React.useState<State>({
		type: 'login',
		mail: {value: '', touched: false},
		isLoading: false,
	});

	const {setUser} = useUser();
	const toast = useToast();

	const ticket = useSearchParams()[0].get('ticket');

	const onClose = React.useCallback(() => {
		navigate('/');
	}, [navigate]);

	React.useEffect(() => {
		const abortController = new AbortController();
		const authenticate = async (
			ticket: string,
			abortController: AbortController,
		) => {
			try {
				const ret = await api.authenticateMailLogin({ticket}, abortController);

				if (ret.status === ApiStatus.SUCCESS) {
					switch (ret.data.type) {
						case 'user_exists': {
							setUser({
								...ret.data.data,
								loggedIn: true,
								workouts: [],
							});
							toast({
								title: `Logged in as ${ret.data.data.username}`,
								isClosable: true,
								duration: 5000,
								status: 'success',
							});
							onClose();
							break;
						}
						case 'user_does_not_exist': {
							setState({
								type: 'register',
								mail: ret.data.mail,
								username: {value: '', touched: false},
								ticket,
								isLoading: false,
								errorMessage: '',
							});
							break;
						}
					}
				}
			} catch (error) {}
		};

		if (ticket) {
			authenticate(ticket, abortController).catch(console.error);
		}
		return () => abortController.abort();
	}, [ticket, onClose, setUser, toast]);

	switch (state.type) {
		case 'mail-sent':
			return <MailSent state={state} isOpen={isOpen} onClose={onClose} />;
		case 'login':
			return (
				<Login
					state={state}
					setMail={(mail, touched) => setState(s => setMail(s, mail, touched))}
					setIsLoading={isLoading => setState(s => setIsLoading(s, isLoading))}
					setErrorMessage={error => setState(s => setErrorMessage(s, error))}
					goToMailSent={(mail: string, userExists: boolean) =>
						setState({type: 'mail-sent', mail, userExists})
					}
					isOpen={isOpen}
					onClose={onClose}
				/>
			);
		case 'register':
			return (
				<Register
					state={state}
					setUsername={(username, touched) =>
						setState(s => setUsername(s, username, touched))
					}
					setIsLoading={isLoading => setState(s => setIsLoading(s, isLoading))}
					setErrorMessage={error => setState(s => setErrorMessage(s, error))}
					isOpen={isOpen}
					onClose={onClose}
				/>
			);
	}
};
