
import { useState } from "react"
import { Store, Tag, Plus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const vendors = [
  {
    id: 1,
    name: "Fashion Outlet",
    logo: "/placeholder.svg?height=80&width=80",
    category: "Clothing",
    items: [
      { id: 101, name: "Summer T-Shirt", price: 19.99, image: "/placeholder.svg?height=60&width=60" },
      { id: 102, name: "Denim Jeans", price: 49.99, image: "/placeholder.svg?height=60&width=60" },
      { id: 103, name: "Casual Shoes", price: 39.99, image: "/placeholder.svg?height=60&width=60" },
    ],
  },
  {
    id: 2,
    name: "Tech Haven",
    logo: "/placeholder.svg?height=80&width=80",
    category: "Electronics",
    items: [
      { id: 201, name: "Wireless Earbuds", price: 89.99, image: "/placeholder.svg?height=60&width=60" },
      { id: 202, name: "Smart Watch", price: 199.99, image: "/placeholder.svg?height=60&width=60" },
      { id: 203, name: "Bluetooth Speaker", price: 59.99, image: "/placeholder.svg?height=60&width=60" },
    ],
  },
  {
    id: 3,
    name: "Home Essentials",
    logo: "/placeholder.svg?height=80&width=80",
    category: "Home & Kitchen",
    items: [
      { id: 301, name: "Coffee Maker", price: 79.99, image: "/placeholder.svg?height=60&width=60" },
      { id: 302, name: "Bedding Set", price: 129.99, image: "/placeholder.svg?height=60&width=60" },
      { id: 303, name: "Kitchen Knife Set", price: 49.99, image: "/placeholder.svg?height=60&width=60" },
    ],
  },
  {
    id: 4,
    name: "Beauty Spot",
    logo: "/placeholder.svg?height=80&width=80",
    category: "Beauty",
    items: [
      { id: 401, name: "Face Serum", price: 29.99, image: "/placeholder.svg?height=60&width=60" },
      { id: 402, name: "Makeup Palette", price: 39.99, image: "/placeholder.svg?height=60&width=60" },
      { id: 403, name: "Hair Styling Tool", price: 69.99, image: "/placeholder.svg?height=60&width=60" },
    ],
  },
]

// Mock data for promocodes
const promocodes = [
  { id: 1, code: "SUMMER25", discount: "25%" },
  { id: 2, code: "WELCOME10", discount: "10%" },
  { id: 3, code: "FLASH50", discount: "50%" },
]

export function Vendors() {
  const [selectedVendor, setSelectedVendor] = useState<number | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [assignedCodes, setAssignedCodes] = useState<{ [key: number]: string[] }>({})
  const [isAssigningPromo, setIsAssigningPromo] = useState(false)

  // Filter vendors based on search term
  const filteredVendors = vendors.filter(
    (vendor) =>
      vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.category.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Handle vendor selection
  const handleVendorClick = (vendorId: number) => {
    setSelectedVendor(vendorId)
  }

  // Assign promocode to vendor
  const assignPromocode = (vendorId: number, code: string) => {
    setAssignedCodes((prev) => {
      const vendorCodes = prev[vendorId] || []
      if (!vendorCodes.includes(code)) {
        return {
          ...prev,
          [vendorId]: [...vendorCodes, code],
        }
      }
      return prev
    })
  }

  // Remove promocode from vendor
  const removePromocode = (vendorId: number, code: string) => {
    setAssignedCodes((prev) => {
      const vendorCodes = prev[vendorId] || []
      return {
        ...prev,
        [vendorId]: vendorCodes.filter((c) => c !== code),
      }
    })
  }

  return (
    <div className="grid gap-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative w-full sm:w-64">
          <Input
            placeholder="Search vendors..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
          <Store className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </div>
        <Dialog open={isAssigningPromo} onOpenChange={setIsAssigningPromo}>
          <DialogTrigger asChild>
            <Button>
              <Tag className="mr-2 h-4 w-4" />
              Manage Promocodes
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Manage Promocodes</DialogTitle>
            </DialogHeader>
            <Tabs defaultValue="assign">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="assign">Assign</TabsTrigger>
                <TabsTrigger value="view">View Assigned</TabsTrigger>
              </TabsList>
              <TabsContent value="assign" className="pt-4">
                <div className="grid gap-4">
                  {promocodes.map((promo) => (
                    <div key={promo.id} className="flex items-center justify-between p-3 border rounded-md">
                      <div>
                        <p className="font-medium">{promo.code}</p>
                        <p className="text-sm text-muted-foreground">Discount: {promo.discount}</p>
                      </div>
                      <div className="flex gap-2">
                        {selectedVendor && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => assignPromocode(selectedVendor, promo.code)}
                            disabled={assignedCodes[selectedVendor]?.includes(promo.code)}
                          >
                            {assignedCodes[selectedVendor]?.includes(promo.code) ? "Assigned" : "Assign"}
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                  {!selectedVendor && (
                    <p className="text-center text-muted-foreground">Select a vendor to assign promocodes</p>
                  )}
                </div>
              </TabsContent>
              <TabsContent value="view" className="pt-4">
                <ScrollArea className="h-72">
                  {Object.entries(assignedCodes).length > 0 ? (
                    <div className="grid gap-4">
                      {Object.entries(assignedCodes).map(([vendorId, codes]) => {
                        const vendor = vendors.find((v) => v.id === Number.parseInt(vendorId))
                        if (!vendor || codes.length === 0) return null

                        return (
                          <div key={vendorId} className="border rounded-md p-3">
                            <div className="flex items-center gap-2 mb-2">
                              <img
                                src={vendor.logo || "/placeholder.svg"}
                                alt={vendor.name}
                                width={40}
                                height={40}
                                className="rounded-full"
                              />
                              <div>
                                <p className="font-medium">{vendor.name}</p>
                                <p className="text-sm text-muted-foreground">{vendor.category}</p>
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {codes.map((code) => (
                                <Badge key={code} variant="secondary" className="flex items-center gap-1">
                                  {code}
                                  <button
                                    onClick={() => removePromocode(Number.parseInt(vendorId), code)}
                                    className="ml-1 hover:text-destructive"
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground">No promocodes assigned yet</p>
                  )}
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredVendors.map((vendor) => (
          <Card
            key={vendor.id}
            className="cursor-pointer transition-all hover:border-primary"
            onClick={() => handleVendorClick(vendor.id)}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center gap-3">
                <img
                  src={vendor.logo || "/placeholder.svg"}
                  alt={vendor.name}
                  width={50}
                  height={50}
                  className="rounded-full"
                />
                <div>
                  <CardTitle className="text-lg">{vendor.name}</CardTitle>
                  <CardDescription>{vendor.category}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">{vendor.items.length} items</span>
                {assignedCodes[vendor.id]?.length > 0 && (
                  <Badge variant="outline" className="text-xs">
                    {assignedCodes[vendor.id].length} promocode{assignedCodes[vendor.id].length > 1 ? "s" : ""}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredVendors.length === 0 && (
          <div className="col-span-full text-center py-10">
            <p className="text-muted-foreground">No vendors found matching your search</p>
          </div>
        )}
      </div>

      {/* Items Dialog */}
      <Dialog open={selectedVendor !== null} onOpenChange={(open) => !open && setSelectedVendor(null)}>
        <DialogContent className="sm:max-w-md md:max-w-2xl">
          {selectedVendor && (
            <>
              <DialogHeader>
                <div className="flex justify-between items-center">
                  <DialogTitle>{vendors.find((v) => v.id === selectedVendor)?.name} Items</DialogTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      setIsAssigningPromo(true)
                    }}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Assign Promocode
                  </Button>
                </div>
                {assignedCodes[selectedVendor]?.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="text-sm text-muted-foreground mr-2">Active promocodes:</span>
                    {assignedCodes[selectedVendor].map((code) => (
                      <Badge key={code} variant="secondary" className="flex items-center gap-1">
                        {code}
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            removePromocode(selectedVendor, code)
                          }}
                          className="ml-1 hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </DialogHeader>
              <ScrollArea className="h-[60vh] mt-2">
                <div className="grid gap-4">
                  {vendors
                    .find((v) => v.id === selectedVendor)
                    ?.items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between border-b pb-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={item.image || "/placeholder.svg"}
                            alt={item.name}
                            width={60}
                            height={60}
                            className="rounded-md"
                          />
                          <div>
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-muted-foreground">${item.price.toFixed(2)}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </ScrollArea>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

