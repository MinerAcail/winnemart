import MenuBar from '@/components/custom/menuBar'
import { useCart } from '@/hooks/CartContext';
import  { useState } from 'react'

function NavBar() {
      const [selectedCategory, setSelectedCategory] = useState<string>("All");
    
      const { cart, hostelDetails, setHostelDetails, removeFromCart,  placeOrder } = useCart();
      const categories: string[] = [
        "All",
        // ...new Set(products.flatMap((item) => item.categories)),
      ];
  return (
    <MenuBar
    CartSidebarProps={{
      cart,
      hostelDetails,
      setHostelDetails,
      removeFromCart,
      placeOrder,
    }}
    categories={categories}
    selectedCategory={selectedCategory}
    setSelectedCategory={setSelectedCategory}
  />
  )
}

export default NavBar