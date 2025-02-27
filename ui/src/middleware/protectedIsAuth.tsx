import { useAuth } from "@/middleware/context/authContext";
import { Navigate } from "react-router";
// Make sure to import from your actual auth context location

interface ProtectedRouteProps {
  element: JSX.Element;
}

function ProtectedIsAuthRoute({ element }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return element;
}

export default ProtectedIsAuthRoute;
