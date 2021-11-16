import * as React from "react";
import useSWR from "swr";
import { fetchMyWorkouts, validateToken } from "../api";
import { UserContextType, Workout } from "../types";

export const defaultUser: UserContextType = {
  loggedIn: false,
};

const UserContext = React.createContext<{
  user: UserContextType;
  workouts: Workout[];
  setUser: (user: UserContextType) => void;
  refetchData: () => void;
} | null>(null);

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
  const { data: userWorkouts, mutate: refetchWorkouts } = useSWR(
    ["/me/workouts", user.loggedIn],
    () => (user.loggedIn ? fetchMyWorkouts(user.token) : null)
  );

  const setUserExternal = (user: UserContextType) => {
    localStorage["usertoken"] = user.loggedIn ? user.token : "";
    setUser(user);
  };

  const workouts =
    (userWorkouts &&
      userWorkouts.status === "SUCCESS" &&
      userWorkouts.data.workouts) ||
    [];
  console.log("workouts:", workouts);
  return (
    <UserContext.Provider
      value={{
        user,
        setUser: setUserExternal,
        workouts,
        refetchData: () => {
          refetchWorkouts();
        },
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = React.useContext(UserContext);
  if (context === null) {
    throw new Error("useUser must be used within a UserContextProvider");
  }
  return context;
};
