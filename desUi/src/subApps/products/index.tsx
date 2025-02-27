"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { gql, useQuery } from "@apollo/client"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChevronDown, ChevronUp, ChevronsUpDown } from "lucide-react"

// Define the structure of our product based on the GraphQL response
interface Product {
  id: string
  name: string
  price: number
  itemsBought: number
}

// Define the GraphQL response structure
interface ProductResponse {
  product: {
    id: string
    name: string
    price: number
  }
  ItemSoldCount: number
}

interface GetAllProductsResponse {
  getAllProductsByAdmin: ProductResponse[]
}

// Define the GraphQL query
const GET_ALL_PRODUCTS = gql`
  query GetAllProductsByAdmin {
    getAllProductsByAdmin {
      product {
        id
        name
        price
      }
      ItemSoldCount
    }
  }
`

export function Products() {
  const [searchTerm, setSearchTerm] = useState("")
  const [sortColumn, setSortColumn] = useState<keyof Product | null>(null)
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(5)

  // Fetch products data using GraphQL with Apollo Client
  const { loading, error, data } = useQuery<GetAllProductsResponse>(GET_ALL_PRODUCTS)

  // Transform the data to match our Product interface
  const transformedData: Product[] = data?.getAllProductsByAdmin.map(
    (item: ProductResponse) => ({
      id: item.product.id,
      name: item.product.name,
      price: item.product.price,
      itemsBought: item.ItemSoldCount || 0, // Default to 0 if null
    })
  ) || []

  // Search functionality
  const filteredData = transformedData.filter((product) =>
    Object.values(product).some((value) => 
      value !== null && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  )

  // Sorting functionality
  const handleSort = (column: keyof Product) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortColumn(column)
      setSortDirection("asc")
    }
  }

  // Apply sorting to filtered data
  const sortedData = sortColumn
    ? [...filteredData].sort((a, b) => {
        if (a[sortColumn] < b[sortColumn]) return sortDirection === "asc" ? -1 : 1
        if (a[sortColumn] > b[sortColumn]) return sortDirection === "asc" ? 1 : -1
        return 0
      })
    : filteredData

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = sortedData.slice(indexOfFirstItem, indexOfLastItem)

  // Selection functionality
  const toggleSelectAll = () => {
    if (selectedProducts.length === currentItems.length) {
      setSelectedProducts([])
    } else {
      setSelectedProducts(currentItems.map((product) => product.id))
    }
  }

  const toggleSelectProduct = (id: string) => {
    setSelectedProducts((prev) =>
      prev.includes(id) ? prev.filter((productId) => productId !== id) : [...prev, id]
    )
  }

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber)

  // Render table header with sort functionality
  const renderTableHeader = (column: keyof Product, label: string) => (
    <TableHead>
      <button className="flex items-center space-x-1" onClick={() => handleSort(column)}>
        <span>{label}</span>
        {sortColumn === column ? (
          sortDirection === "asc" ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )
        ) : (
          <ChevronsUpDown className="h-4 w-4" />
        )}
      </button>
    </TableHead>
  )

  if (loading) {
    return <div className="text-center p-4">Loading products...</div>
  }

  if (error) {
    return <div className="text-center text-red-500 p-4">Error: {error.message}</div>
  }

  return (
    <div className="space-y-4 bg-blue-400 rounded-lg p-4">
      <div className="flex justify-between items-center">
        <Input
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              Rows per page: {itemsPerPage}
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {[5, 10, 20].map((number) => (
              <DropdownMenuCheckboxItem
                key={number}
                checked={number === itemsPerPage}
                onCheckedChange={() => setItemsPerPage(number)}
              >
                {number} rows
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <Checkbox checked={selectedProducts.length === currentItems.length} onCheckedChange={toggleSelectAll} />
              </TableHead>
              {renderTableHeader("id", "ID")}
              {renderTableHeader("name", "Name")}
              {renderTableHeader("price", "Price")}
              {renderTableHeader("itemsBought", "Items Bought")}
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentItems.length > 0 ? (
              currentItems.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedProducts.includes(product.id)}
                      onCheckedChange={() => toggleSelectProduct(product.id)}
                    />
                  </TableCell>
                  <TableCell>{product.id.slice(0,5)}</TableCell>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>${product.price}</TableCell>
                  <TableCell>{product.itemsBought}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  No products found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm text-gray-500">
            Showing {sortedData.length > 0 ? indexOfFirstItem + 1 : 0} to {Math.min(indexOfLastItem, sortedData.length)} of {sortedData.length} results
          </p>
          <p className="text-sm text-gray-500">{selectedProducts.length} product(s) selected</p>
        </div>
        <div className="space-x-2">
          <Button variant="outline" size="sm" onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1}>
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => paginate(currentPage + 1)}
            disabled={indexOfLastItem >= sortedData.length}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}