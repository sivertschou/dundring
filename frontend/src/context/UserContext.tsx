import * as React from "react";
import { validateToken } from "../api";
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
  React.useEffect(() => {
    const locallyStoredToken = localStorage["usertoken"];
    if (locallyStoredToken) {
      validateToken(locallyStoredToken)
        .then((res) => {
          switch (res.status) {
            case "SUCCESS":
              setUser({
                loggedIn: true,
                roles: res.data.roles,
                token: locallyStoredToken,
                username: res.data.username,
                workouts: [],
              });
              break;
            default:
              localStorage["usertoken"] = "";
          }
        })
        .catch((e) => console.log("ERROR:", e));
    }
  }, []);

  const [user, setUser] = React.useState<UserContextType>(defaultUser);

  const setUserExternal = (user: UserContextType) => {
    localStorage["usertoken"] = user.loggedIn ? user.token : "";
    setUser(user);
  };
  const value = { user, setUser: setUserExternal };
  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUser = () => {
  const context = React.useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserContextProvider");
  }
  return context;
};
