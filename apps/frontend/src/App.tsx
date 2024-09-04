import { MainPage } from './pages/MainPage';
import { Route, Routes } from 'react-router-dom';

export const App = () => {
  return (
    <>
      <Routes>
        <Route path="/group/:groupId" element={<MainPage />} />
        <Route path="/workout/:workoutId" element={<MainPage />} />
        <Route path="*" element={<MainPage />} />
      </Routes>
    </>
  );
};
