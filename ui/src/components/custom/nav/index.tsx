import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { gql, useMutation } from "@apollo/client";
import { CircleUser, Link2, LogIn, Package, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";
import Login from "@/app/Login";
import { useDeviceType } from "@/hooks/useDeviceType";
import { useAuth } from "@/middleware/context/authContext";
import useProtect, { ProtectType } from "@/middleware/useProtect";
import logo from "../../../assets/ww.png";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";

export const LOGOUT = gql`
  mutation logOut {
    logOut
  }
`;



function WorksNav() {
  const { logout, isAuthenticated } = useAuth();
  const { hasAccess: driver } = useProtect([ProtectType.Driver]);
  const { hasAccess: vendor } = useProtect([ProtectType.vendor]);
  const [logoutMutation] = useMutation(LOGOUT);
  const navigate = useNavigate();
  const { isDesktop } = useDeviceType();
  const [isSearchExpanded] = useState<boolean>(false);

  const handleLogout = async () => {
    try {
      await logoutMutation();
      logout();
      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 1000);
    } catch (err) {
      console.error("Error logging out:", err);
    }
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-[#76a683] shadow-md">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link to={"/"} className="flex items-center">
          <img src={logo} alt="WinneMart Logo" className="w-12 pr-[5px]" />
          {(isDesktop || !isSearchExpanded) && <></>}
        </Link>

        {isAuthenticated ? (
          <NavigationMenu>
            <NavigationMenuList>
              {vendor && (
                <>
                  <NavigationMenuItem>
                    <NavigationMenuTrigger>Products</NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <ul className="grid w-48 gap-3 p-4">
                        <li>
                          <NavigationMenuLink asChild>
                            <Link
                              to="/vendor"
                              className="flex items-center gap-2 p-2 hover:bg-slate-100 rounded-md"
                            >
                              <Link2 className="w-4 h-4" />
                              <span>Items</span>
                            </Link>
                          </NavigationMenuLink>
                        </li>
                        <li>
                          <NavigationMenuLink asChild>
                            <Link
                              to="/vendoritems"
                              className="flex items-center gap-2 p-2 hover:bg-slate-100 rounded-md"
                            >
                              <Link2 className="w-4 h-4" />
                              <span>Orders</span>
                            </Link>
                          </NavigationMenuLink>
                        </li>
                      </ul>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <NavigationMenuTrigger>Options</NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <ul className="grid w-48 gap-3 p-4">
                        <li>
                          <NavigationMenuLink asChild>
                            <Link
                              to="/time"
                              className="flex items-center gap-2 p-2 hover:bg-slate-100 rounded-md"
                            >
                              <Timer className="w-4 h-4" />
                              <span>Check Out</span>
                            </Link>
                          </NavigationMenuLink>
                        </li>

                        <li>
                          <NavigationMenuLink asChild>
                            <Link
                              to="/profile"
                              className="flex items-center gap-2 p-2 hover:bg-slate-100 rounded-md"
                            >
                              <CircleUser className="h-4 w-4" />
                              <span>Profile</span>
                            </Link>
                          </NavigationMenuLink>
                        </li>
                      </ul>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                </>
              )}

              {driver && (
                <NavigationMenuItem>
                  <NavigationMenuTrigger>Driver Options</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-48 gap-3 p-4">
                      <li>
                        <NavigationMenuLink asChild>
                          <Link
                            to="/delivery"
                            className="flex items-center gap-2 p-2 hover:bg-slate-100 rounded-md"
                          >
                            <Package className="w-4 h-4" />
                            <span>Delivery</span>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                      <li>
                        <NavigationMenuLink asChild>
                          <Link
                            to="/workerprofile"
                            className="flex items-center gap-2 p-2 hover:bg-slate-100 rounded-md"
                          >
                            <CircleUser className="h-4 w-4" />
                            <span>Profile</span>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              )}

              <NavigationMenuItem>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="flex items-center gap-2"
                >
                  <LogIn className="w-4 h-4" />
                  Sign Out
                </Button>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
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
