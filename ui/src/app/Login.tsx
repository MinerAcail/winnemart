"use client";

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

const Login = ({ children }: { children: ReactNode }) => {
  const navigate = useNavigate();
  const { login: Auth } = useAuth();

  const [number, setNumber] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const [workersLogin, { loading }] = useMutation(WORKERS_LOGIN, {
    // onCompleted: (data) => {
    //   // Handle successful login
    //   if (data?.workersLogin?.id) {
    //     navigate("/delivery");
    //   }
    // },
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

     const result = await workersLogin({
        variables: {
          input: {
            number,
            password,
          },
        },
      });
      Auth(result?.data?.workersLogin);
      navigate("/delivery");

    } catch (err) {
      setError("An unexpected error occurred");
      console.error("Login error:", err);
    }
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
          <div className="grid gap-2">
            <Input
              id="password"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
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
