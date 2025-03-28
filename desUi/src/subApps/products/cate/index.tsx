import React, { useState } from "react";
import {
  DndContext,
  DragOverlay,
  useSensors,
  useSensor,
  PointerSensor,
  closestCenter,
  DragStartEvent,
  DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, rectSortingStrategy } from "@dnd-kit/sortable";
import { GalleryHorizontal, Plus, Upload, View, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useMutation, gql, useQuery } from "@apollo/client";
import { Box, Product } from "./types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ProductItem, ProductsContainer } from "./ProductCard";
import DroppableBox from "./drag";
import { GET_PRODUCTS } from "./gql";
import InputWithButton from "./input-with-button";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { Link } from "react-router";

const ADD_PRODUCT_TO_CATEGORY_BOX = gql`
  mutation AddProductToCategoryBox($input: [CategoryBoxInput!]!) {
    addProductToCategoryBox(input: $input) {
      id
      name
      itemsIds
    }
  }
`;

const DragDropBoxes: React.FC = () => {
  // State
  const [boxes, setBoxes] = useState<Box[]>([]);
  const [nextBoxId, setNextBoxId] = useState(1);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);
  const [isSearchExpanded, setIsSearchExpanded] = useState<boolean>(false);
  const [isNameDialogOpen, setIsNameDialogOpen] = useState<boolean>(false);
  const [newBoxName, setNewBoxName] = useState<string>("");
  const [boxImage, setBoxImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");

  const { toast } = useToast();

  const [
    addProductToCategoryBox,
    { data: mutationData, loading: mutationLoading, error: mutationError },
  ] = useMutation(ADD_PRODUCT_TO_CATEGORY_BOX);

  // Configure sensors for drag detection
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // 5px of movement required before drag starts
      },
    })
  );

  // Fetch products with Apollo Client
  const { data, loading, error,refetch } = useQuery(GET_PRODUCTS,{
    variables: { query: searchTerm },

  });
  const products: Product[] = data?.getAllProducts || [];

  // Open the name input dialog
  const openAddBoxDialog = () => {
    setNewBoxName("");
    setBoxImage(null);
    setImagePreview(null);
    setIsNameDialogOpen(true);
  };

  // Add a box with the name from the dialog
  const addBoxWithName = () => {
    const newBoxId = nextBoxId.toString();
    const name = newBoxName.trim() || `Box ${newBoxId}`;
    setBoxes((prevBoxes) => [
      ...prevBoxes, 
      { 
        id: newBoxId, 
        name, 
        items: [],
        imageFile: boxImage
      }
    ]);
    setNextBoxId((prevId) => prevId + 1);
    setIsNameDialogOpen(false);
  };

  // Remove a box
  const removeBox = (boxId: string) => {
    setBoxes((prevBoxes) => prevBoxes.filter((box) => box.id !== boxId));
  };

  // Remove item from a box
  const removeItemFromBox = (boxId: string, productId: string) => {
    setBoxes((prevBoxes) =>
      prevBoxes.map((box) => {
        if (box.id === boxId) {
          return {
            ...box,
            items: box.items.filter((item) => item.id !== productId),
          };
        }
        return box;
      })
    );
  };

  // Handle drag start
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id as string);

    // Find the product being dragged
    const product = products.find((p) => p.id === active.id);
    if (product) {
      setActiveProduct(product);
    }
  };

  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    // Reset active states
    setActiveId(null);
    setActiveProduct(null);

    // Return if no destination
    if (!over) return;

    const productId = active.id as string;
    const boxId = over.id as string;

    // Make sure we're not trying to add to "products" container
    if (boxId === "products") return;

    // Find the product
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    // Check if product is already in box
    const targetBox = boxes.find((b) => b.id === boxId);
    if (targetBox && targetBox.items.some((item) => item.id === productId))
      return;

    // Add product to box
    setBoxes((prevBoxes) =>
      prevBoxes.map((box) => {
        if (box.id === boxId) {
          return {
            ...box,
            items: [...box.items, product],
          };
        }
        return box;
      })
    );
  };

  // Handle image upload for box
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setBoxImage(file);
      
      // Create a preview URL for the image
      const preview = URL.createObjectURL(file);
      setImagePreview(preview);
    }
  };

  // Handle Done button click
  const handleDoneClick = async () => {
    if (boxes.length === 0) {
      toast({
        title: "No boxes to save",
        description: "Please create at least one box with products.",
        variant: "destructive",
      });
      return;
    }

    // Filter out empty boxes
    const nonEmptyBoxes = boxes.filter((box) => box.items.length > 0);

    if (nonEmptyBoxes.length === 0) {
      toast({
        title: "Empty boxes",
        description: "Please add at least one product to a box.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Format the data for the mutation
      const input = nonEmptyBoxes.map((box) => ({
        categoryName: box.name,
        productId: box.items.map((item) => item.id),
        // Only include files if imageFile exists
        ...(box.imageFile ? { files: box.imageFile } : {})
      }));
      
      console.log("input:", input);

      await addProductToCategoryBox({
        variables: { input },
      });

      toast({
        title: "Success!",
        description: `Saved ${nonEmptyBoxes.length} box${
          nonEmptyBoxes.length !== 1 ? "es" : ""
        }.`,
        variant: "default",
      });

      // Optional: Clear boxes or update UI based on successful submission
      setBoxes([]);
      setNextBoxId(1);
    } catch (err) {
      console.error("Error saving boxes:", err);
      toast({
        title: "Error",
        description: mutationError
          ? mutationError.message
          : "Failed to save boxes. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  function handleSearch(value: string): void {
    setSearchTerm(value);
    refetch({ query: value });
  }
  if (loading)
    return <div className="p-8 text-center">Loading products...</div>;
  if (error)
    return (
      <div className="p-8 text-center text-red-500">
        Error loading products: {error.message}
      </div>
    );

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="bg-white p-6 w-full h-full rounded-lg shadow-lg mx-auto space-y-8">

          {/* Boxes Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Selection 1: Boxes</h2>
              <div className="flex items-center justify-between gap-4">
                <Button
                  onClick={handleDoneClick}
                  className="flex items-center gap-1"
                  disabled={
                    isSubmitting ||
                    boxes.length === 0 ||
                    boxes.every((box) => box.items.length === 0)
                  }
                >
                  <GalleryHorizontal className="h-4 w-4" />
                  {isSubmitting ? "Saving..." : "Done"}
                </Button>
                <Button
                  onClick={openAddBoxDialog}
                  className="flex items-center gap-1"
                >
                  <Plus className="h-4 w-4" />
                  Add Box
                </Button>
                
                <Link to="/products/view" >
                <Button onClick={() => {}} className="flex items-center gap-1">
                  <View className="h-4 w-4" />
                  View
                </Button>
                </Link>
              </div>
            </div>

            {boxes.length === 0 ? (
              <div className="text-center p-8 border border-dashed rounded-lg text-muted-foreground">
                Click the "Add Box" button to create your first box
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {boxes.map((box) => (
                  <DroppableBox
                    key={box.id}
                    box={box}
                    removeBox={removeBox}
                    removeItem={removeItemFromBox}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Products Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Selection 2: Products</h2>
              <InputWithButton
                isExpanded={isSearchExpanded}
                setIsExpanded={setIsSearchExpanded}
                onSearch={handleSearch}
              />
            </div>

            <SortableContext
              items={products.map((p) => p.id)}
              strategy={rectSortingStrategy}
            >
              <ProductsContainer>
                {products.map((product) => (
                  <ProductItem key={product.id} product={product} />
                ))}
              </ProductsContainer>
            </SortableContext>
          </div>

          {/* Debug Info */}
          <div className="mt-8 p-4 border rounded-lg bg-gray-50">
            <h3 className="text-lg font-semibold mb-2">Debug Info</h3>
            <div className="text-xs overflow-auto max-h-40">
              <pre>{JSON.stringify(boxes, null, 2)}</pre>
            </div>
          </div>
        </div>

        {/* Drag Overlay - Shows what's being dragged */}
        <DragOverlay>
          {activeId && activeProduct ? (
            <Card className="p-4 shadow-lg bg-white opacity-90">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-primary/10 p-[3px] rounded-md">
                  <img
                    src={activeProduct.imageUrls[0]}
                    alt={activeProduct.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-medium">{activeProduct.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    ${activeProduct.price}
                  </p>
                </div>
              </div>
            </Card>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Name Input Dialog */}
      <Dialog open={isNameDialogOpen} onOpenChange={setIsNameDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Enter Box Name</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Input
              placeholder="Enter a name for the box"
              value={newBoxName}
              onChange={(e) => setNewBoxName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  addBoxWithName();
                }
              }}
              autoFocus
            />
            <div className="space-y-2">
              <Label htmlFor="images">Product Images</Label>
              <div className="flex items-center justify-center w-full">
                <label
                  htmlFor="images"
                  className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                >
                  {imagePreview ? (
                    <div className="relative w-full h-full">
                      <img 
                        src={imagePreview} 
                        alt="Box preview" 
                        className="w-full h-full object-cover rounded-lg"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 hover:bg-opacity-60 transition-all rounded-lg">
                        <p className="text-white text-sm font-medium">
                          Change image
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 mb-4 text-gray-500" />
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">Click to upload</span> or drag
                        and drop
                      </p>
                      <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                    </div>
                  )}
                  <Input
                    id="images"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsNameDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={addBoxWithName}>Create Box</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DragDropBoxes;