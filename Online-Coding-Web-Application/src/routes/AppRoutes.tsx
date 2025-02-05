import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LobbyPage from '../pages/LobbyPage';
import CodeBlockPage from '../pages/CodeBlockPage';

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LobbyPage />} /> 
        <Route path="/code-block/:id" element={<CodeBlockPage />} />
        <Route path="*" element={<LobbyPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;