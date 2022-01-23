import * as React from 'react';
import { MainPage } from './pages/MainPage';
import { Navigate, Route, Routes } from 'react-router-dom';
interface Props {
  clockWorker: Worker;
}
export const App = (props: Props) => {
  return (
    <>
      <Routes>
        <Route path="/" element={<MainPage {...props} />}>
          <Route path="group" element={<MainPage {...props} />}>
            <Route path=":groupId" element={<MainPage {...props} />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
};
