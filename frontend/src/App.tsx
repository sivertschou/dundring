import { MainPage } from './pages/MainPage';
import { Navigate, Route, Routes } from 'react-router-dom';

export const App = () => {
  return (
    <>
      <Routes>
        <Route
          path="strava"
          element={<Navigate to="https://www.strava2.com" />}
        />
        <Route path="/" element={<MainPage />}>
          <Route path="group" element={<MainPage />}>
            <Route path=":groupId" element={<MainPage />} />
          </Route>
          <Route path="workout" element={<MainPage />}>
            <Route path=":workoutId" element={<MainPage />} />
          </Route>
          <Route path="profile" element={<MainPage />} />
          <Route path="logs" element={<MainPage />} />
          <Route path="login" element={<MainPage />} />
        </Route>
        {/* <Route path="*" element={<Navigate to="/" />} /> */}
      </Routes>
    </>
  );
};
