import { useNavigate } from "react-router";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { useAuth } from "./context/authContext";
import { useState } from "react";
import { useMutation } from "@apollo/client";
import { WORKERS_LOGIN } from "@/app/Login";

export default function ErrorLogin() {
  const navigate = useNavigate();
  const { login: Auth } = useAuth();

  const [formData, setFormData] = useState({
      number: "",
    password: "",
  });
  const [error, setError] = useState("");

  const [workersLogin, { loading }] = useMutation(WORKERS_LOGIN, {
    onCompleted: (data) => {
      if (data?.workersLogin?.id) {
        Auth(data.workersLogin);
        navigate("/delivery");
      }
    },
    onError: (error) => {
      setError(error.message || "Login failed. Please try again.");
    },
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleLogin = async () => {
    try {
      setError("");
      if (!formData.number || !formData.password) {
        setError("Please fill in all fields");
        return;
      }

      await workersLogin({
        variables: {
          input: {
            number: formData.number,
            password: formData.password,
          },
        },
      });
    } catch (err) {
      setError("An unexpected error occurred");
      console.error("Login error:", err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center gap-2 text-red-500">
            <AlertCircle className="h-5 w-5" />
            <h2 className="text-2xl font-bold">Session Expired</h2>
          </div>
          <p className="text-sm text-gray-500">
            Your session has expired. Please login again to continue.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Input
              id="number"
              placeholder="Phone Number"
              value={formData.number}
              onChange={handleInputChange}
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <Input
              id="password"
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleInputChange}
              className="w-full"
            />
          </div>
          {error && (
            <div className="text-sm text-red-500 flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button
            onClick={handleLogin}
            className="w-full"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}