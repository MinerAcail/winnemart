import Login from "@/app/Login";
import { Button } from "@/components/ui/button";
// import { useSidebar } from "@/components/ui/sidebar";
import { useDeviceType } from "@/hooks/useDeviceType";
import { useAuth } from "@/middleware/context/authContext";
import useProtect, { ProtectType } from "@/middleware/useProtect";
import { gql, useMutation } from "@apollo/client";
import { CircleUser, Link2, LogIn, Package, Timer } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router";
import logo from "../../../assets/ww.png";

export const LOGOUT = gql`
  mutation logOut {
    logOut
  }
`;

interface WorksNavProps {
  to?: string;
  navName?: string;
}

function WorksNav({ to = "/", navName }: WorksNavProps) {
  const { logout, isAuthenticated } = useAuth(); // Access the logout function from the auth context
  const { hasAccess: driver } = useProtect([ProtectType.Driver]);
  const { hasAccess: vendor } = useProtect([ProtectType.vendor]);
  const [logoutMutation] = useMutation(LOGOUT); // Apollo useMutation hook
  const navigate = useNavigate(); // Initialize the navigate hook

  const { isDesktop } = useDeviceType();
  // const { toggleSidebar } = useSidebar();
  const [isSearchExpanded] = useState<boolean>(false);
  const handleLogout = async () => {
    try {
      // Call the GraphQL logout mutation
      await logoutMutation();

      // Perform the local logout (clear localStorage and update state)
      logout();

      // Optionally, you can display a message or redirect elsewhere
      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 1000);
    } catch (err) {
      console.error("Error logging out:", err);
    }
  };
  return (
    <nav className="fixed top-0  left-0 w-full z-50 bg-[#76a683] shadow-md flex justify-between items-center">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link to={"/"} className="flex items-center">
          <img src={logo} alt="WinneMart Logo" className="w-12 pr-[5px]" />

          {(isDesktop || !isSearchExpanded) && (
            <>
              {/* <span className="text-lg font-extrabold text-white tracking-wider font-mono">
              winne
            </span>
            <span className="text-lg font-extrabold text-black tracking-wider pl-[2px] font-mono">
              mart
            </span> */}
            </>
          )}
        </Link>
        {isAuthenticated ? (
          <div className="flex items-center gap-2">
            {driver && (
              <Link to="/delivery">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Package className="w-4 h-4" />
                  Delivery
                </Button>
              </Link>
            )}
               {vendor && (
              <Link to="/time">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Timer className="w-4 h-4" />
                  Check Out
                </Button>
              </Link>
            )}

            {isAuthenticated && vendor && navName && (
              <Link to={to}>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Link2 className="w-4 h-4" />
                  {navName}
                </Button>
              </Link>

            )}
            <Link to={vendor ? "/profile" : "/workerprofile"}>
              <Button
                variant="outline"
                size="sm"
                // onClick={handleLogout}
                className="flex items-center gap-2"
              >
                <CircleUser className="h-4 w-4" />
                Profile
              </Button>
            </Link>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="flex items-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              Sign Out
            </Button>
          </div>
        ) : (
          <Login>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              Sign In
            </Button>
          </Login>
        )}
      </div>
    </nav>
  );
}

export default WorksNav;
