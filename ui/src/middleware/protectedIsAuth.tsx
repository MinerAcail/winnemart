import { useAuth } from "@/middleware/context/authContext";
import { Navigate } from "react-router";
// Make sure to import from your actual auth context location

interface ProtectedRouteProps {
  element: JSX.Element;
  expectedTypes:string[];
}

function ProtectedIsAuthRoute({ element ,expectedTypes}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading,user } = useAuth();
  const userTypes: string[] = Array.isArray(user?.type) ? user?.type : [];
  const hasExpectedTypes =  isAuthenticated && expectedTypes?.some((type) => userTypes.includes(type));

  if (!isAuthenticated && !hasExpectedTypes) {
    return <Navigate to="/job" replace />;
  }
  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (!isAuthenticated) {
    return <Navigate to="/job" replace />;
  }

  return element;
}

export default ProtectedIsAuthRoute;
