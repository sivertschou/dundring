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
  deleteLocalWorkout: (workoutId: string) => void;
  setUser: (user: UserContextType) => void;
  refetchData: () => void;
} | null>(null);

export const UserContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  React.useEffect(() => {
    const abortController = new AbortController();
    const authenticate = async (
      localToken: string,
      abortController: AbortController
    ) => {
      try {
        console.log('send');
        const ret = await validateToken(localToken, abortController);
        console.log(ret.status);

        switch (ret.status) {
          case 'SUCCESS':
            setUser({
              loggedIn: true,
              token: localToken,
              username: ret.data.username,
              workouts: [],
              ftp: ret.data.ftp,
              stravaData: ret.data.stravaData,
            });
            break;
          default:
            localStorage['usertoken'] = '';
        }
      } catch (error) {
        console.log('ERROR:', error);
      }
    };

    const locallyStoredToken = localStorage['usertoken'];

    console.log(locallyStoredToken);

    if (locallyStoredToken) {
      authenticate(locallyStoredToken, abortController).catch(console.error);
    }
    console.log('hmm');
    return () => abortController.abort();
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

  const deleteLocalWorkout = (workoutId: string) => {
    setLocalWorkouts((localWorkouts) => {
      const filteredWorkouts = localWorkouts.filter(
        (workout) => workout.id !== workoutId
      );
      localStorage['workouts'] = JSON.stringify(filteredWorkouts);
      return JSON.parse(localStorage['workouts']);
    });
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
        deleteLocalWorkout,
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
