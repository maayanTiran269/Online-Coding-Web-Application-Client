import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LobbyPage from '../pages/LobbyPage';
import CodeBlockPage from '../pages/CodeBlockPage';
import NotFoundPage from '../pages/NotFoundPage';

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LobbyPage />} />
        <Route path="/post/:id" element={<CodeBlockPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;