import { useState, useEffect } from "react";
import { useQuery } from "@apollo/client";
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
} from "@/components/ui/dropdown-menu";
import {
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
} from "lucide-react";

const GET_ALL_USER_STATS = gql`
  query GetAllUserStats {
    getAllUserStats {
      customerNumber
      deliveryAddresses
      totalOrders
      totalitemsOrdered
      firstlastOrderDate
    }
  }
`;

interface UserStats {
  customerNumber: string;
  deliveryAddresses: string[];
  totalOrders: number;
  totalitemsOrdered: number;
  firstlastOrderDate: string;
}

export function Customers() {
  const { loading, error, data } = useQuery(GET_ALL_USER_STATS);

  // State variables
  const [searchTerm, setSearchTerm] = useState("");
  const [sortColumn, setSortColumn] = useState<keyof UserStats | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [filteredUsers, setFilteredUsers] = useState<UserStats[]>([]);

  useEffect(() => {
    if (data?.getAllUserStats) {
      const filtered = data.getAllUserStats.filter((user: UserStats) =>
        Object.values(user).some((value) =>
          value && typeof value === "object"
            ? false
            : value.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
      setFilteredUsers(filtered);
      setCurrentPage(1);
    }
  }, [data, searchTerm]);

  const handleSort = (column: keyof UserStats) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  useEffect(() => {
    if (sortColumn) {
      const sortedData = [...filteredUsers].sort((a, b) => {
        if (a[sortColumn] < b[sortColumn])
          return sortDirection === "asc" ? -1 : 1;
        if (a[sortColumn] > b[sortColumn])
          return sortDirection === "asc" ? 1 : -1;
        return 0;
      });
      setFilteredUsers(sortedData);
    }
  }, [sortColumn, sortDirection]);

  const toggleSelectAll = () => {
    if (selectedItems.length === filteredUsers.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredUsers.map((user) => user.customerNumber));
    }
  };

  const toggleSelectItem = (id: string) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const renderTableHeader = (column: keyof UserStats, label: string) => (
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

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);

  if (loading) return <div className="p-4">Loading user statistics...</div>;
  if (error)
    return (
      <div className="p-4 text-red-500">
        Error loading user statistics: {error.message}
      </div>
    );

  return (
    <div className="space-y-4 bg-blue-100 rounded-lg p-4">
      <div className="flex justify-between items-center">
        <Input
          placeholder="Search users..."
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
                  checked={selectedItems.length === filteredUsers.length}
                  onCheckedChange={toggleSelectAll}
                />
              </TableHead>
              {renderTableHeader("customerNumber", "Customer Number")}
              {renderTableHeader("totalOrders", "Total Orders")}
              {renderTableHeader("totalitemsOrdered", "Total Items")}
              {renderTableHeader("firstlastOrderDate", "Last Order Date")}
              {renderTableHeader("deliveryAddresses", "Delivery Addresses")}
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentItems.map((user) => (
              <TableRow key={user.customerNumber}>
                <TableCell>
                  <Checkbox
                    checked={selectedItems.includes(user.customerNumber)}
                    onCheckedChange={() => toggleSelectItem(user.customerNumber)}
                  />
                </TableCell>
                <TableCell>{user.customerNumber}</TableCell>
                <TableCell>{user.totalOrders}</TableCell>
                <TableCell>{user.totalitemsOrdered}</TableCell>
                <TableCell>{user.firstlastOrderDate}</TableCell>
                <TableCell> {user.deliveryAddresses.length}</TableCell>
              
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm text-gray-500">
            Showing {indexOfFirstItem + 1} to{" "}
            {Math.min(indexOfLastItem, filteredUsers.length)} of{" "}
            {filteredUsers.length} results
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
            disabled={indexOfLastItem >= filteredUsers.length}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}

export default Customers;