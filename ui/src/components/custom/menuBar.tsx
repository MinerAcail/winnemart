import React from "react";
import { Store, ShoppingBasket, LogIn, Merge, MenuSquare } from "lucide-react";
import SelectCategoryFilter from "./SelectCategoryFilter";
import { SheetSide } from "./sideBar";
import { useDeviceType } from "@/hooks/useDeviceType";
import { CartSidebarProps } from "./CartSidebar";
import { Button } from "../ui/button";
import { Link } from "react-router";
import { useSidebar } from "../ui/sidebar";

interface SelectCategoryFilterProps {
  categories: string[];
  selectedCategory: string;
  setSelectedCategory: React.Dispatch<React.SetStateAction<string>>;
  CartSidebarProps: CartSidebarProps;
}

const MenuBar: React.FC<SelectCategoryFilterProps> = ({
  categories,
  selectedCategory,
  setSelectedCategory,
  CartSidebarProps: {
    cart,
    hostelDetails,
    setHostelDetails,
    removeFromCart,
    placeOrder,
  },
}) => {
  const { isDesktop } = useDeviceType();
  const { toggleSidebar } = useSidebar();

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-[#76a683] shadow-md py-3 px-4 flex justify-between items-center">
      {/* Logo */}
      <Link to={"/"} className="flex items-center space-x-2">
        <Store className="text-white w-6 h-6" />
        <span className="text-lg font-extrabold text-white tracking-wider">
          WinneMart
        </span>
      </Link>

      <div className="flex cursor-pointer items-center ">
        {/* Show the shopping basket icon on mobile */}
        {!isDesktop && (
          <SheetSide
            CartSidebarProps={{
              cart,
              hostelDetails,
              setHostelDetails,
              removeFromCart,
              placeOrder,
            }}
          >
            {/* Shopping Basket Icon with Cart Badge */}
            <div className="relative flex items-center">
              <ShoppingBasket className="w-6 h-6 text-slate-700" />

              {/* Conditionally render the badge if there are items in the cart */}
              {cart.length > 0 && (
                <div className="absolute top-[-8px] right-[20px] bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs z-50">
                  {cart.length}
                </div>
              )}
            </div>
          </SheetSide>
        )}
        <Link to={"/request"} className="px-3">
          <Button variant="outline" className="flex items-center gap-1 p3">
            Request Item
          </Button>
        </Link>
        {/* Show SelectCategoryFilter on desktop */}
        <SelectCategoryFilter
          categories={categories}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
        />
        {!isDesktop && (
          <MenuSquare
            onClick={toggleSidebar}
            className="text-white w-6 h-6 flex ml-2 items-center gap-2"
          />
        )}
      </div>
    </nav>
  );
};

export default MenuBar;
