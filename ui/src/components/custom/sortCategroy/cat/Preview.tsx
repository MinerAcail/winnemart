import { Button } from "../../../ui/button.tsx"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../../../ui/dialog.tsx"
import { Card } from "../../../ui/card.tsx"
import { Trash, Plus } from "lucide-react"
// import { ScrollArea, ScrollBar } from "../../../ui/scroll-area.tsx"

interface Item {
    id: string
    name: string
    description?: string
    imageUrl: string
    price: number
}

interface Category {
    id: string
    name: string
    description: string
    imageUrl: string
    items: Item[]
}

interface CardPreviewProps {
    isOpen: boolean
    category: Category | null
    onClose: () => void
    onDeleteItem: (categoryId: string, itemId: string) => void
}

export function CardPreview({ isOpen, category, onClose, onDeleteItem }: CardPreviewProps) {
    if (!category) return null

    return (
        <div >
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="sm:max-w-[800px] max-h-[70vh] overflow-x-auto">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold">{category.name}</DialogTitle>
                        <DialogDescription>{category.description}</DialogDescription>
                    </DialogHeader>

                    <div className="flex flex-col gap-4 mt-4">
                        <h3 className="text-lg font-semibold mb-2">Items in this category:</h3>

                        {/* Horizontal Scroll Area */}

                        <div className=" grid md:grid-cols-3  ">
                            {category.items.map((item) => (
                                <Card key={item.id} className="p-4 m-2 w-">
                                    <div className={"flex justify-end"}>

                                        <Card className={" ]"}>
                                            <img src={category.imageUrl} alt={category.name}/>
                                        </Card>
                                    </div>

                                    {/* Item Details */}
                                    <p className="font-bold text-lg">{item.name}</p>
                                    {item.description && (
                                        <p className="text-sm text-gray-500">{item.description}</p>
                                    )}

                                    {/* Price */}
                                    <p className="font-semibold text-gray-700 mt-2">${item.price.toFixed(2)}</p>

                                    {/* Delete Button */}
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-red-500 mt-3 w-2"
                                        onClick={() => onDeleteItem(category.id, item.id)}
                                    >
                                        <Trash className="h-4 w-4" />
                                    </Button>
                                </Card>
                            ))}


                        </div>


                        {/* Action Buttons */}
                        <div className="mt-4 flex justify-end">
                            <Button onClick={onClose} variant="outline" className="mr-2">
                                <Plus className="mr-2 h-4 w-4" />
                                Add To Cart
                            </Button>
                            <Button className="">
                                <Plus className="mr-2 h-4 w-4" />
                                Add Item</Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>

    )
}
