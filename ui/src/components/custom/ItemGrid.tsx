import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Item } from "@/app/HostelStoreApp";
export const ghSim = "GH¢"



interface ItemGridProps {
  filteredItems: Item[];
  addToCart: (item: Item) => void;
  onItemSelect: (item: Item) => void;
  className?: string;
}

const ItemGrid: React.FC<ItemGridProps> = ({ filteredItems, addToCart,className,onItemSelect }) => {
  const handleItemClick = (item: Item, e: React.MouseEvent) => {
    e.stopPropagation();
    onItemSelect(item);
  };
return   (
  
  <div className={className}>
    {filteredItems.map((item,idx) => (
      <Card key={idx}   className="hover:shadow-xl transition-all">
        <CardContent
        onClick={(e) => handleItemClick(item, e)}
        className="p-4 text-center">
          <img
            src={item.imageUrls[0]}
            alt={item.name}
            className="w-full h-40 object-cover rounded-lg mb-4"
            
          />
          <h3 className="font-bold">{item.name}</h3>
          <p className="text-muted-foreground mb-2">{ghSim}{item.price}</p>
         
        </CardContent>
        <CardContent className=" text-center bgred6">
         
          <Button
            onClick={() => addToCart(item)}
            className="w-full"
            variant="secondary"
          >
            Add to Cart
          </Button>
        </CardContent>
      </Card>
    ))}
  </div>
)};

export default ItemGrid;
