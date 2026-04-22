import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Home               from './pages/Home';
import Login              from './pages/Login';
import StudentDashboard   from './pages/student/Dashboard';
import InstructorDashboard from './pages/instructor/Dashboard';

// Guard — redirects to login if not authenticated
function PrivateRoute({ children, allowedRoles }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role))
    return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/"      element={<Home />} />
      <Route path="/login" element={<Login />} />

      <Route path="/student-dashboard" element={
        <PrivateRoute allowedRoles={['student', 'admin']}>
          <StudentDashboard />
        </PrivateRoute>
      } />

      <Route path="/instructor-dashboard" element={
        <PrivateRoute allowedRoles={['instructor', 'admin']}>
          <InstructorDashboard />
        </PrivateRoute>
      } />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
