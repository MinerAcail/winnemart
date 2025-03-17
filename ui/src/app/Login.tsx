import { ReactNode, useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useMutation, gql } from "@apollo/client";
import { useAuth } from "@/middleware/context/authContext";
import { Eye, EyeOff } from "lucide-react";
import { ProtectType } from "@/middleware/useProtect";

export const WORKERS_LOGIN = gql`
  mutation WorkersLogin($input: LoginInput!) {
    workersLogin(input: $input) {
      id
      name
      number
      type
    }
  }
`;

export const LOGIN = gql`
  mutation DeliveryLogin($input: LoginInput!) {
    deliveryLogin(input: $input) {
      __typename
      ... on Vendor {
        id
        name
        number
        type
      }
      ... on jobRequest {
        id
        name
        number
        type
      }
    }
  }
`;

const Login = ({ children }: { children: ReactNode }) => {
  const navigate = useNavigate();
  const { login: Auth } = useAuth();

  const [number, setNumber] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [deliveryLogin, { loading }] = useMutation(LOGIN, {
    onError: (error) => {
      setError(error.message || "Login failed. Please try again.");
    },
  });

  const handleLogin = async () => {
    try {
      setError("");
      if (!number || !password) {
        setError("Please fill in all fields");
        return;
      }

      const result = await deliveryLogin({
        variables: {
          input: {
            number,
            password,
          },
        },
      });

      // Check if login was successful
      if (result?.data?.deliveryLogin) {
        // Authenticate the user
        Auth(result.data.deliveryLogin);

        // You can check the type to navigate to different routes if needed
        const userType = result.data.deliveryLogin.type;
        if (userType === ProtectType.Driver) {
          navigate("/delivery");
        }
        if (userType === ProtectType.vendor) {
          navigate("/vendor");
        } else {
          navigate("/");
        }

        // For now, navigate to delivery page
      } else {
        setError("Login failed. Please check your credentials.");
      }
    } catch (err) {
      setError("An unexpected error occurred");
      navigate("/login");

      console.error("Login error:", err);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Hostel Store Login</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Input
              id="number"
              placeholder="Phone Number"
              value={number}
              onChange={(e) => setNumber(e.target.value)}
            />
          </div>
          <div className="grid gap-2 relative">
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 focus:outline-none"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
        <Button onClick={handleLogin} className="w-full" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default Login;
