import React from 'react';
import CodingPractice from './pages/CodingPractice';
import History from './pages/History';
import Leaderboard from './pages/Leaderboard';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Quiz from './pages/Quiz';
import Results from './pages/Results';
import MockInterview from './pages/MockInterview';
import Profile from './pages/Profile';
import Feedback from './pages/Feedback';
import ChatBot from './components/ChatBot';
import ResumeAnalyzer from './pages/ResumeAnalyzer';

function PrivateRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
}

function App() {
  return (
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={
              <PrivateRoute><Dashboard /></PrivateRoute>
            } />
            <Route path="/history" element={
              <PrivateRoute><History /></PrivateRoute>
            } />
            <Route path="/coding" element={
              <PrivateRoute><CodingPractice /></PrivateRoute>
            } />
            <Route path="/quiz" element={
              <PrivateRoute><Quiz /></PrivateRoute>
            } />
            <Route path="/results" element={
              <PrivateRoute><Results /></PrivateRoute>
            } />
            <Route path="/leaderboard" element={
              <PrivateRoute><Leaderboard /></PrivateRoute>
            } />
            <Route path="/mock-interview" element={
              <PrivateRoute><MockInterview /></PrivateRoute>
            } />
            <Route path="/profile" element={
              <PrivateRoute><Profile /></PrivateRoute>
            } />
            <Route path="/feedback" element={<Feedback />} />
            <Route path="*" element={<Navigate to="/" />} />
            <Route path="/resume" element={
              <PrivateRoute><ResumeAnalyzer /></PrivateRoute>
            } />
          </Routes>
          <ChatBot />
        </BrowserRouter>
      </AuthProvider>
  );
}

export default App;