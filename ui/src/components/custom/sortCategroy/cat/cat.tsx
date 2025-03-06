

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../../../ui/card.tsx"
import { ScrollArea } from "../../../ui/scroll-area.tsx"
import { Button } from "../../../ui/button.tsx"
import { Plus } from "lucide-react"
import { CardPreview } from "@/components/custom/sortCategroy/cat/Preview.tsx"
import data from "./data.tsx"

// Define types for category and item
interface Item {
    id: string
    name: string
    description: string
    price: number
    imageUrl: string
}

interface Category {
    id: string
    name: string
    description: string
    imageUrl: string
    items: Item[]
}

const App = () => {
    const [categories, setCategories] = useState<Category[]>(data)
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)

    const openPreview = (category: Category) => {
        setSelectedCategory(category)
    }

    const closePreview = () => {
        setSelectedCategory(null)
    }

    const handleDeleteItem = (categoryId: string, itemId: string) => {
        setCategories((prevCategories) => {
            const updatedCategories = prevCategories.map((category) =>
                category.id === categoryId
                    ? { ...category, items: category.items.filter((item) => item.id !== itemId) }
                    : category
            )

            if (selectedCategory?.id === categoryId) {
                setSelectedCategory(updatedCategories.find((c) => c.id === categoryId) || null)
            }

            return updatedCategories
        })
    }

    return (
        <div className="container mx-auto py-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories.map((category) => (
                    <Card
                        key={category.id}
                        className="overflow-hidden flex flex-row h-[400px] transition-all duration-300 hover:shadow-xl hover:scale-[1.02] cursor-pointer"
                        onClick={() => openPreview(category)}
                    >
                        {/* Image Section */}
                        <div className="relative h-full w-1/2 p-2 flex items-center justify-center">
                            <div className="rounded-2xl overflow-hidden shadow-sm w-full h-auto">
                                <img
                                    src={category.imageUrl || "/placeholder.svg?height=200&width=200"}
                                    alt={category.name}
                                    className="w-[900px] h-full object-cover rounded-2xl"
                                />
                            </div>
                        </div>

                        {/* Content Section */}
                        <div className="w-2/3 flex flex-col">
                            <CardHeader>
                                <CardTitle>{category.name}</CardTitle>
                            </CardHeader>
                            <CardContent className="flex flex-col flex-grow">
                                <p className="text-gray-600 mb-3">{category.description}</p>

                                {/* Items List */}
                                <ScrollArea className="m-0 h-[200px]">
                                    <div className="p-2">
                                        <ul className="text-sm text-gray-800">
                                            {category.items.map((item) => (
                                                <li key={item.id} className="border-b last:border-0 py-1">
                                                    {item.name}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </ScrollArea>

                                {/* Button Section */}
                                <div className="flex justify-end mt-auto">
                                    <Button
                                        variant="outline"
                                        className="mr-2"
                                        onClick={(e) => e.stopPropagation()} // Prevent parent click
                                    >
                                        <Plus className="mr-2 h-4 w-4" />
                                        Add To Cart
                                    </Button>
                                </div>
                            </CardContent>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Card Preview Component */}
            {selectedCategory && (
                <CardPreview
                    isOpen
                    category={selectedCategory}
                    onClose={closePreview}
                    onDeleteItem={handleDeleteItem}
                />
            )}
        </div>
    )
}

export default App
