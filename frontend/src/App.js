import { BrowserRouter, Routes, Route } from 'react-router-dom';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ProtectedRoute from './components/ProtectedRoute';
import AddFood from './pages/AddFood';
import FoodList from './components/FoodList';
import FoodWasteChatBot from "./components/FoodWasteChatBot";
import ChatBotWidget from './components/ChatBorWidget'; // ✅ Import at the top

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route path="/add-food" element={<AddFood />} />
        <Route
  path="/food-list"
  element={
    <ProtectedRoute>
      <FoodList />
    </ProtectedRoute>
  }
/>

        <Route path="/chatbot" element={<FoodWasteChatBot />} />
      
      </Routes>
      <ChatBotWidget />
    </BrowserRouter>
  );
}

export default App;
