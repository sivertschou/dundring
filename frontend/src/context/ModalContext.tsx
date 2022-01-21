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
} | null>(null);

export const ModalContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const workoutEditorModal: Modal = useDisclosure();
  const logModal: Modal = useDisclosure();
  const loginModal: Modal = useDisclosure();

  return (
    <ModalContext.Provider
      value={{
        workoutEditorModal,
        logModal,
        loginModal,
      }}
    >
      {children}
    </ModalContext.Provider>
  );
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
