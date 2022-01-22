import { useDisclosure } from '@chakra-ui/hooks';
import * as React from 'react';

interface Modal {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  onToggle: () => void;
}

const ModalContext = React.createContext<{
  workoutEditorModal: Modal;
  logModal: Modal;
  loginModal: Modal;
  profileModal: Modal;
  groupSessionModal: Modal;
} | null>(null);

export const ModalContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const logModal: Modal = useDisclosure();
  const loginModal: Modal = useDisclosure();
  const profileModal: Modal = useDisclosure();
  const groupSessionModal: Modal = useDisclosure();
  const workoutEditorModal: Modal = useDisclosure();

  return (
    <ModalContext.Provider
      value={{
        logModal,
        loginModal,
        profileModal,
        groupSessionModal,
        workoutEditorModal,
      }}
    >
      {children}
    </ModalContext.Provider>
  );
};

export const useLogModal = () => {
  const context = React.useContext(ModalContext);
  if (context === null) {
    throw new Error('useLogModal must be used within a ModalContextProvider');
  }
  return context.logModal;
};

export const useLoginModal = () => {
  const context = React.useContext(ModalContext);
  if (context === null) {
    throw new Error('useLoginModal must be used within a ModalContextProvider');
  }
  return context.loginModal;
};

export const useProfileModal = () => {
  const context = React.useContext(ModalContext);
  if (context === null) {
    throw new Error(
      'useProfileModal must be used within a ModalContextProvider'
    );
  }
  return context.profileModal;
};

export const useGroupSessionModal = () => {
  const context = React.useContext(ModalContext);
  if (context === null) {
    throw new Error(
      'useGroupSessionModal must be used within a ModalContextProvider'
    );
  }
  return context.groupSessionModal;
};

export const useWorkoutEditorModal = () => {
  const context = React.useContext(ModalContext);
  if (context === null) {
    throw new Error(
      'useWorkoutEditorModal must be used within a ModalContextProvider'
    );
  }
  return context.workoutEditorModal;
};
