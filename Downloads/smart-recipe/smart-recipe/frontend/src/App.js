import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import RecipeDetail from './pages/RecipeDetail';
import AddEditRecipe from './pages/AddEditRecipe';
import MyRecipes from './pages/MyRecipes';
import SavedRecipes from './pages/SavedRecipes';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

function AppRoutes() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/recipes/:id" element={<RecipeDetail />} />
        <Route path="/add-recipe" element={<PrivateRoute><AddEditRecipe /></PrivateRoute>} />
        <Route path="/edit-recipe/:id" element={<PrivateRoute><AddEditRecipe /></PrivateRoute>} />
        <Route path="/my-recipes" element={<PrivateRoute><MyRecipes /></PrivateRoute>} />
        <Route path="/saved" element={<PrivateRoute><SavedRecipes /></PrivateRoute>} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
