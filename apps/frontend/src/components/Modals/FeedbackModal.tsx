import {
  Modal,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
} from '@chakra-ui/modal';
import * as api from '../../api';
import { useFeedbackModal } from '../../context/ModalContext';
import { useNavigate } from 'react-router-dom';
import {
  FormControl,
  FormLabel,
  ModalBody,
  Stack,
  Textarea,
  Text,
  useToast,
  ModalFooter,
  Button,
  Spinner,
  Input,
  FormHelperText,
} from '@chakra-ui/react';
import * as React from 'react';
import { EditableString } from '../../types';

interface State {
  content: EditableString;
  sender: EditableString;
  isLoading: boolean;
  errorMessage: string;
}

export const FeedbackModal = () => {
  const { isOpen } = useFeedbackModal();
  const navigate = useNavigate();
  const toast = useToast();
  const [state, setState] = React.useState<State>({
    content: { value: '', touched: false },
    sender: { value: '', touched: false },
    errorMessage: '',
    isLoading: false,
  });

  const feedbackIsInvalid = state.content.touched && !state.content.value;

  const sendFeedback = async () => {
    //TODO: Allow cmd+enter to trigger a send in the Textarea
    const trimmedContent = state.content.value.trim();
    const trimmedSender = state.sender.value.trim();

    if (!trimmedContent) {
      setState((state) => ({ ...state, errorMessage: 'Enter some content' }));
      return;
    }

    setState((state) => ({ ...state, isLoading: true }));
    const sender = trimmedSender ? { sender: trimmedSender } : undefined;
    console.log('sender:', sender);
    const response = await api.sendFeedback({
      content: trimmedContent,
      ...sender,
    });
    setState((state) => ({ ...state, isLoading: false }));

    if (response.status === 'FAILURE') {
      setState((state) => ({ ...state, errorMessage: response.message }));
    } else if (response.status === 'SUCCESS') {
      const text = {
        title: 'Thank you for your feedback!',
      };

      toast({
        title: text.title,
        isClosable: true,
        duration: 60000,
        status: 'success',
      });
      navigate('/');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={() => navigate('/')} size="2xl">
      <ModalOverlay />
      <ModalContent>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendFeedback();
          }}
        >
          <ModalHeader>Feedback</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Stack>
              <FormControl isInvalid={feedbackIsInvalid} isRequired={true}>
                <FormLabel>What do you have on your mind?</FormLabel>
                <Textarea
                  placeholder="Type whatever's on your mind!"
                  name="feedback"
                  id="feedback"
                  value={state.content.value}
                  onChange={(e) => {
                    setState((state) => ({
                      ...state,
                      content: { value: e.target.value, touched: true },
                      errorMessage: '',
                    }));
                  }}
                />
                <FormHelperText>
                  This could be anything from bugs/unexpected behaviour you've
                  encountered, features you would like to see or some other
                  general feedback.
                </FormHelperText>
              </FormControl>
              <FormControl>
                <FormLabel>Your name and/or contact info</FormLabel>
                <Input
                  type="text"
                  placeholder="E.g Sivert (sivert@dundring.com)"
                  name="sender"
                  id="sender"
                  value={state.sender.value}
                  onChange={(e) => {
                    setState((state) => ({
                      ...state,
                      sender: { value: e.target.value, touched: true },
                      errorMessage: '',
                    }));
                  }}
                />
                <FormHelperText>
                  Please provide some information if you wish to be contacted.
                  This is optional.
                </FormHelperText>
              </FormControl>

              {state.errorMessage ? (
                <Text color="red.500">{state.errorMessage}</Text>
              ) : null}
            </Stack>
          </ModalBody>

          <ModalFooter>
            {!state.isLoading ? (
              <Button
                onClick={() => sendFeedback()}
                isDisabled={feedbackIsInvalid}
                type="submit"
              >
                Send feedback
              </Button>
            ) : (
              <Spinner />
            )}
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};
