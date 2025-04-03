import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';
import { SignIn } from './pages/SignIn';
import { SignUp } from './pages/SignUp';
import { AccountActivation } from './pages/AccountActivation';
import { Movies } from './pages/Movies';
import { MovieDetail } from './pages/MovieDetail';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  console.log('Rendering App component');
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public routes */}
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/activate" element={<AccountActivation />} />
            
            {/* Protected routes with Layout */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <MoviesWithLayout />
                </ProtectedRoute>
              }
            />
            <Route
              path="/movies/:id"
              element={
                <ProtectedRoute>
                  <Layout>
                    <MovieDetail />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

// Wrapper component to handle state and props between Movies and Layout
function MoviesWithLayout() {
  const [showForm, setShowForm] = React.useState(false);
  
  const toggleAddMovie = () => {
    setShowForm(!showForm);
  };
  
  return (
    <Layout onAddMovie={toggleAddMovie} showAddMovie={true}>
      <Movies showForm={showForm} />
    </Layout>
  );
}

export default App; 