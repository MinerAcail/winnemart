import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { gql } from "@apollo/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  MoreHorizontal,
  Trash,
  Edit,
  Check,
  Ban,
} from "lucide-react";
import OrderList from "./viewOrders";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
// import { useToast } from "@/components/ui/use-toast"

const GET_ALL_ORDERS = gql`
  query getAllOrderS {
    getAllOrderS {
      id
      customerNumber
      status
      estimatedDeliveryDate
      createdAt
      items {
        id
        productId
        quantity
        orderId
      }
    }
  }
`;

const UPDATE_ORDER_STATUS = gql`
  mutation UpdateOrderStatus($orderId: String, $status: String!) {
    updateOrderStatus(orderID: $orderId, status: $status)
  }
`;

interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  orderId: string;
}

interface Order {
  id: string;
  customerNumber: string;
  status: string;
  estimatedDeliveryDate: string;
  createdAt: string;
  items: OrderItem[];
}

export function Orders() {
  const { loading, error, data, refetch } = useQuery(GET_ALL_ORDERS);
  const [updateOrderStatus] = useMutation(UPDATE_ORDER_STATUS);
  const { toast } = useToast();

  // State variables
  const [searchTerm, setSearchTerm] = useState("");
  const [sortColumn, setSortColumn] = useState<keyof Order | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [deleteOrderId, setDeleteOrderId] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    if (data?.getAllOrderS) {
      const filtered = data.getAllOrderS.filter((order: Order) =>
        Object.values(order).some((value) =>
          value && typeof value === "object"
            ? false // Skip objects like the items array
            : value.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
      setFilteredOrders(filtered);
      setCurrentPage(1);
    }
  }, [data, searchTerm]);

  const handleSort = (column: keyof Order) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  useEffect(() => {
    if (sortColumn) {
      const sortedData = [...filteredOrders].sort((a, b) => {
        if (a[sortColumn] < b[sortColumn])
          return sortDirection === "asc" ? -1 : 1;
        if (a[sortColumn] > b[sortColumn])
          return sortDirection === "asc" ? 1 : -1;
        return 0;
      });
      setFilteredOrders(sortedData);
    }
  }, [sortColumn, sortDirection]);

  const toggleSelectAll = () => {
    if (selectedItems.length === filteredOrders.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredOrders.map((order) => order.id));
    }
  };

  const toggleSelectItem = (id: string) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleActionClick = async (
    action: "complete" | "block" | "delete",
    orderId: string
  ) => {
    if (action === "delete") {
      setDeleteOrderId(orderId);
      setShowDeleteDialog(true);
      return;
    }

    try {
      const status = action === "complete" ? "COMPLETED" : "BLOCKED";
      await updateOrderStatus({
        variables: {
          orderId,
          status,
        },
      });

      toast({
        title: `Order ${
          action === "complete" ? "completed" : "blocked"
        } successfully`,
        variant: "default",
      });

      refetch();
    } catch (error) {
      toast({
        title: "Action failed",
        description:
          error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    }
  };

  const confirmDelete = async () => {
    if (!deleteOrderId) return;

    try {
      // Here you would implement the actual delete logic
      // For now, we'll just show a success message
      toast({
        title: "Order deleted successfully",
        variant: "default",
      });

      setShowDeleteDialog(false);
      setDeleteOrderId(null);
      refetch();
    } catch (error) {
      toast({
        title: "Delete failed",
        description:
          error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    }
  };

  // Calculate total quantity for an order
  const calculateTotalQuantity = (order: Order) => {
    return order.items.reduce((total, item) => total + item.quantity, 0);
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredOrders.slice(indexOfFirstItem, indexOfLastItem);

  const renderTableHeader = (column: keyof Order, label: string) => (
    <TableHead>
      <button
        className="flex items-center space-x-1"
        onClick={() => handleSort(column)}
      >
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
  );

  if (loading) return <div className="p-4">Loading orders...</div>;
  if (error)
    return (
      <div className="p-4 text-red-500">
        Error loading orders: {error.message}
      </div>
    );

  return (
    <div className="space-y-4 bg-blue-100 rounded-lg p-4">
      <div className="flex justify-between items-center">
        <Input
          placeholder="Search orders..."
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
                <Checkbox
                  checked={selectedItems.length === filteredOrders.length}
                  onCheckedChange={toggleSelectAll}
                />
              </TableHead>
              {renderTableHeader("id", "Order ID")}
              {renderTableHeader("customerNumber", "Customer Number")}
              {renderTableHeader("status", "Status")}
              {renderTableHeader("estimatedDeliveryDate", "Est. Delivery")}
              <TableHead>
                <button className="flex items-center space-x-1">
                  <span>Total Quantity</span>
                  <ChevronsUpDown className="h-4 w-4" />
                </button>
              </TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentItems.map((order) => (
              <OrderList key={order.id} orderId={order.id}>
                <TableRow>
                  <TableCell>
                    <Checkbox
                      checked={selectedItems.includes(order.id)}
                      onCheckedChange={() => toggleSelectItem(order.id)}
                    />
                  </TableCell>
                  <TableCell>{order.id.slice(0, 5)}</TableCell>
                  <TableCell>{order.customerNumber}</TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        order.status === "PENDING"
                          ? "bg-yellow-100 text-yellow-800"
                          : order.status === "COMPLETED"
                          ? "bg-green-100 text-green-800"
                          : order.status === "BLOCKED"
                          ? "bg-red-100 text-red-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {order.status}
                    </span>
                  </TableCell>
                  <TableCell>{order.estimatedDeliveryDate}</TableCell>
                  <TableCell>{calculateTotalQuantity(order)}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() =>
                            handleActionClick("complete", order.id)
                          }
                          disabled={order.status === "COMPLETED"}
                        >
                          <Check className="mr-2 h-4 w-4 text-green-600" />
                          <span>Mark as Completed</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleActionClick("block", order.id)}
                          disabled={order.status === "BLOCKED"}
                        >
                          <Ban className="mr-2 h-4 w-4 text-red-600" />
                          <span>Block Order</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleActionClick("delete", order.id)}
                        >
                          <Trash className="mr-2 h-4 w-4 text-red-600" />
                          <span>Delete</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              </OrderList>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm text-gray-500">
            Showing {indexOfFirstItem + 1} to{" "}
            {Math.min(indexOfLastItem, filteredOrders.length)} of{" "}
            {filteredOrders.length} results
          </p>
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => prev - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => prev + 1)}
            disabled={indexOfLastItem >= filteredOrders.length}
          >
            Next
          </Button>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              order and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default Orders;
