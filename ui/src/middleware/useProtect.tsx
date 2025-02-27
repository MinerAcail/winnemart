import { useAuth } from "@/middleware/context/authContext";

const useProtect = (expectedTypes?: string[]) => {
  const { isAuthenticated, user } = useAuth();
  const userTypes = user?.type || [];

  // Check if the user is authenticated and has at least one of the expected types
  const hasAccess =
    isAuthenticated &&
    (!expectedTypes || expectedTypes.some((type) => userTypes.includes(type)));

  return { hasAccess, isAuthenticated };
};

export default useProtect;

export const ProtectType = {
  Driver: "Driver",

  Dispatch: "Dispatch",
};
