import { MainPage } from './pages/MainPage';
import { Navigate, Route, Routes } from 'react-router-dom';

export const App = () => {
  return (
    <>
      <Routes>
        <Route path="/" element={<MainPage />}>
          <Route path="group" element={<MainPage />}>
            <Route path=":groupId" element={<MainPage />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
};
