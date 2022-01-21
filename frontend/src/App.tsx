import * as React from 'react';
import { MainPage } from './pages/MainPage';
import { BottomBar } from './components/BottomBar';
import { Navigate, Route, Routes } from 'react-router-dom';
interface Props {
  clockWorker: Worker;
}
export const App = (props: Props) => {
  return (
    <>
      <Routes>
        <Route path="/" element={<MainPage {...props} />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      <BottomBar />
    </>
  );
};
