import * as React from 'react';
import useSWR from 'swr';
import { fetchMyWorkouts, validateToken } from '../api';
import { UserContextType, Workout } from '../types';

export const defaultUser: UserContextType = {
  loggedIn: false,
};

const UserContext = React.createContext<{
  user: UserContextType;
  workouts: Workout[];
  localWorkouts: Workout[];
  saveLocalWorkout: (workout: Workout) => void;
  setUser: (user: UserContextType) => void;
  refetchData: () => void;
} | null>(null);

export const UserContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  React.useEffect(() => {
    const locallyStoredToken = localStorage['usertoken'];
    if (locallyStoredToken) {
      validateToken(locallyStoredToken)
        .then((res) => {
          switch (res.status) {
            case 'SUCCESS':
              setUser({
                loggedIn: true,
                token: locallyStoredToken,
                username: res.data.username,
                workouts: [],
                ftp: res.data.ftp,
              });
              break;
            default:
              localStorage['usertoken'] = '';
          }
        })
        .catch((e) => console.log('ERROR:', e));
    }
  }, []);

  const [user, setUser] = React.useState<UserContextType>(defaultUser);
  const { data: userWorkouts, mutate: refetchWorkouts } = useSWR(
    ['/me/workouts', user.loggedIn],
    () => (user.loggedIn ? fetchMyWorkouts(user.token) : null)
  );

  const [localWorkouts, setLocalWorkouts] = React.useState<Workout[]>(
    localStorage['workouts'] ? JSON.parse(localStorage['workouts']) : []
  );

  const setUserExternal = (user: UserContextType) => {
    localStorage['usertoken'] = user.loggedIn ? user.token : '';
    setUser(user);
  };

  const saveLocalWorkout = (workout: Workout) => {
    setLocalWorkouts((localWorkouts) => {
      if (workout.id) {
        const updatedWorkouts = [...localWorkouts].map((w) =>
          workout.id === w.id ? workout : w
        );
        localStorage['workouts'] = JSON.stringify(updatedWorkouts);
      } else {
        const updatedWorkouts = [
          ...localWorkouts,
          {
            ...workout,
            id:
              localWorkouts.reduce(
                (maxId, cur) => Math.max(maxId, parseInt(cur.id)),
                0
              ) + 1,
          },
        ];

        localStorage['workouts'] = JSON.stringify(updatedWorkouts);
      }
      return JSON.parse(localStorage['workouts']);
    });
  };

  const workouts =
    (userWorkouts &&
      userWorkouts.status === 'SUCCESS' &&
      userWorkouts.data.workouts) ||
    [];

  return (
    <UserContext.Provider
      value={{
        user,
        setUser: setUserExternal,
        workouts,
        refetchData: () => {
          console.log('refetch user data');
          refetchWorkouts();
        },
        localWorkouts,
        saveLocalWorkout,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = React.useContext(UserContext);
  if (context === null) {
    throw new Error('useUser must be used within a UserContextProvider');
  }
  return context;
};
