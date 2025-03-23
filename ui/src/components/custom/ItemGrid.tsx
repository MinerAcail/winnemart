import React, { memo, useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Item } from "@/hooks/CartContext.tsx";
import { useQuery, gql } from "@apollo/client";

// Currency symbol for Ghana Cedis
export const ghSim = "GH¢";

// GraphQL query for unavailable periods
const GET_UNAVAILABLE_PERIODS = gql`
  query GetAllUnavailablePeriods {
    getAllUnavailablePeriods {
      id
      day
      endTime
      startTime
      VendorId
    }
  }
`;

interface UnavailablePeriod {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
  VendorId: string;
}

interface ItemGridProps {
  filteredItems: Item[];
  addToCart: (item: Item) => void;
  onItemSelect: (item: Item) => void;
  className?: string;
}

// Helper function to check if current time is within a time range
const isTimeInRange = (startTime: string, endTime: string): boolean => {
  const now = new Date();
  const currentHours = now.getHours();
  const currentMinutes = now.getMinutes();
  
  const [startHours, startMinutes] = startTime.split(':').map(Number);
  const [endHours, endMinutes] = endTime.split(':').map(Number);
  
  const currentTimeInMinutes = currentHours * 60 + currentMinutes;
  const startTimeInMinutes = startHours * 60 + startMinutes;
  const endTimeInMinutes = endHours * 60 + endMinutes;
  
  return currentTimeInMinutes >= startTimeInMinutes && currentTimeInMinutes <= endTimeInMinutes;
};

// Helper function to get current day name
const getCurrentDayName = (): string => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[new Date().getDay()];
};

const ItemCard = memo(({ 
  item, 
  onAddToCart, 
  onItemSelect,
  isAvailable
}: { 
  item: Item; 
  onAddToCart: () => void; 
  onItemSelect: (e: React.MouseEvent) => void;
  isAvailable: boolean;
}) => (
  <Card className="hover:shadow-xl transition-all duration-300">
    <CardContent 
      onClick={isAvailable ? onItemSelect : undefined} 
      className="p-4 text-center cursor-pointer"
    >
      <div className=" overflow-hidden rounded-lg mb-4">
        <img
          src={item.imageUrls[0] || '/placeholder-image.jpg'}
          alt={item.name}
          className={`w-full h-40 object-cover transition-transform hover:scale-105 duration-300 ${!isAvailable ? 'opacity-60' : ''}`}
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/placeholder-image.jpg';
          }}
        />
       
      </div>
      
      <h3 className="font-bold text-lg truncate" title={item.name}>{item.name}</h3>
      <p className="text-muted-foreground mb-2 font-medium">
        {ghSim} {Number(item.commission).toFixed(2)}
      </p>
    </CardContent>
    <CardContent className="text-center p-4 pt-0">
      {isAvailable ? (
        <Button
          onClick={(e) => {
            e.stopPropagation();
            onAddToCart();
          }}
          className="w-full"
          variant="secondary"
        >
          Add to Cart
        </Button>
      ) : (
        <Button
          disabled
          className="w-full opacity-100 cursor-not-allowed"
          variant="outline"
        >
          Not available
        </Button>
      )}
    </CardContent>
  </Card>
));

const ItemGrid: React.FC<ItemGridProps> = ({ 
  filteredItems, 
  addToCart, 
  className, 
  onItemSelect 
}) => {
  const { data, loading, error } = useQuery(GET_UNAVAILABLE_PERIODS);
  const [unavailablePeriods, setUnavailablePeriods] = useState<UnavailablePeriod[]>([]);
  
  useEffect(() => {
    if (data?.getAllUnavailablePeriods) {
      setUnavailablePeriods(data.getAllUnavailablePeriods);
    }
  }, [data]);

  const isItemAvailable = (item: Item): boolean => {
    const currentDay = getCurrentDayName();
    
    // Find if this vendor has any unavailable periods for the current day
    const vendorUnavailablePeriods = unavailablePeriods.filter(
      period => period.VendorId === item.VendorId && period.day === currentDay
    );
    
    // If no unavailable periods for today, the item is available
    if (vendorUnavailablePeriods.length === 0) {
      return true;
    }
    
    // Check if current time falls within any unavailable period
    for (const period of vendorUnavailablePeriods) {
      if (isTimeInRange(period.startTime, period.endTime)) {
        return false; // Current time is within an unavailable period
      }
    }
    
    return true; // Current time is not within any unavailable period
  };

  if (loading) {
    return <div className="text-center py-8">Loading availability information...</div>;
  }

  if (error) {
    console.error("Error loading availability data:", error);
    // If we can't load availability data, we'll assume all items are available
  }

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 ${className || ''}`}>
      {filteredItems.length > 0 ? (
        filteredItems.map((item) => (
          <ItemCard 
            key={item.id || `item-${item.name}-${item.commission}`}
            item={item}
            onAddToCart={() => addToCart(item)}
            onItemSelect={(e) => {
              e.stopPropagation();
              onItemSelect(item);
            }}
            isAvailable={isItemAvailable(item)}
          />
        ))
      ) : (
        <div className="col-span-full text-center py-8">
          <p className="text-muted-foreground">No items found</p>
        </div>
      )}
    </div>
  );
};

export default ItemGrid;