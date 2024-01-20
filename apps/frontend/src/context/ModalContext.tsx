import { useDisclosure } from '@chakra-ui/hooks';
import * as React from 'react';

interface Modal {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  onToggle: () => void;
}

const ModalContext = React.createContext<{
  groupSessionModal: Modal;
  logModal: Modal;
  loginModal: Modal;
  profileModal: Modal;
  welcomeMessageModal: Modal;
  useOldDataModal: Modal;
  workoutEditorModal: Modal;
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
  const welcomeMessageModal: Modal = useDisclosure();
  const useOldDataModal: Modal = useDisclosure();
  const workoutEditorModal: Modal = useDisclosure();

  return (
    <ModalContext.Provider
      value={{
        groupSessionModal,
        logModal,
        loginModal,
        profileModal,
        welcomeMessageModal,
        useOldDataModal,
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

export const useWelcomeMessageModal = () => {
  const CURRENT_VERSION = 1;
  const KEY = 'lastViewedVersion';
  const context = React.useContext(ModalContext);
  if (context === null) {
    throw new Error(
      'useWelcomeMessageModal must be used within a ModalContextProvider'
    );
  }
  return {
    isOpen: context.welcomeMessageModal.isOpen,
    onOpen: () => {
      if (parseInt(window.localStorage.getItem(KEY) || '0') < CURRENT_VERSION) {
        context.welcomeMessageModal.onOpen();
      }
    },
    onClose: () => {
      window.localStorage.setItem(KEY, JSON.stringify(CURRENT_VERSION));
      context.welcomeMessageModal.onClose();
    },
    onToggle: context.welcomeMessageModal.onToggle,
  };
};

export const useLoadOldDataModal = () => {
  const context = React.useContext(ModalContext);
  if (context === null) {
    throw new Error(
      'useLoadOldDataModal must be used within a ModalContextProvider'
    );
  }
  return {
    isOpen: context.useOldDataModal.isOpen,
    onOpen: () => {
      if (localStorage.hasOwnProperty('other-data')) {
        console.log('woop');
        context.useOldDataModal.onOpen();
      }
    },
    onClose: () => {
      ('');
      context.useOldDataModal.onClose();
    },
    onToggle: context.useOldDataModal.onToggle,
  };
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
