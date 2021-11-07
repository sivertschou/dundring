import * as React from "react";
import { UserContextType } from "../types";

export const defaultUser: UserContextType = {
  loggedIn: false,
};
const UserContext = React.createContext<
  | {
      user: UserContextType;
      setUser: (user: UserContextType) => void;
    }
  | undefined
>(undefined);

export const UserContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [user, setUser] = React.useState<UserContextType>(defaultUser);
  const value = { user, setUser };
  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUser = () => {
  const context = React.useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserContextProvider");
  }
  return context;
};
