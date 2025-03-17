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
} from "@/components/ui/dropdown-menu";
import {
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  Copy,
  DonutIcon,
  Edit,
  MoreHorizontal,
  XCircle,
} from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";

const GET_VENDORS = gql`
query listVendors{
  listVendors{
   id
      name
      type
      createdAt
      password
      number
  }
}
`;

const UPDATE_APPLICATION_STATE = gql`
  mutation worksUpdate($applicantId: String!, $input: worksInput!) {
    worksUpdate(applicantId: $applicantId, input: $input) {
      id
      state
      name
      type
    }
  }
`;
interface Application {
  id: string;
  name: string;
  type: string;
  createdAt: string;
  password: string;
  number: string;
}

export function Vendor() {
  const { loading, error, data, refetch } = useQuery(GET_VENDORS);
  const [worksUpdate] = useMutation(UPDATE_APPLICATION_STATE, {
    refetchQueries: ["listVendors"],
  });
  const { toast } = useToast();

  // State variables
  const [searchTerm, setSearchTerm] = useState("");
  const [sortColumn, setSortColumn] = useState<keyof Application | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [filteredApplications, setFilteredApplications] = useState<
    Application[]
  >([]);
  const [rejectApplicationId, setRejectApplicationId] = useState<string | null>(
    null
  );
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [editApplication, setEditApplication] = useState<Application | null>(
    null
  );
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [logApplication, setLogApplication] = useState<Application | null>(
    null
  );
  const [logDialogOpen, setLogDialogOpen] = useState(false);

  useEffect(() => {
    if (data?.listVendors) {
      const filtered = data.listVendors.filter((application: Application) =>
        Object.values(application).some((value) =>
          value.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
      setFilteredApplications(filtered);
      setCurrentPage(1);
    }
  }, [data, searchTerm]);

  const handleSort = (column: keyof Application) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  useEffect(() => {
    if (sortColumn) {
      const sortedData = [...filteredApplications].sort((a, b) => {
        if (a[sortColumn] < b[sortColumn])
          return sortDirection === "asc" ? -1 : 1;
        if (a[sortColumn] > b[sortColumn])
          return sortDirection === "asc" ? 1 : -1;
        return 0;
      });
      setFilteredApplications(sortedData);
    }
  }, [sortColumn, sortDirection]);

  const toggleSelectAll = () => {
    if (selectedItems.length === filteredApplications.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredApplications.map((app) => app.id));
    }
  };

  const toggleSelectItem = (id: string) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleActionClick = async (
    action: "reject" | "showlog",
    applicantId: string
  ) => {
    if (action === "reject") {
      setRejectApplicationId(applicantId);
      setShowRejectDialog(true);
      return;
    }
    if (action === "showlog") {
      const application = filteredApplications.find(
        (app) => app.id === applicantId
      );
      if (application) {
        setLogApplication(application);
        setLogDialogOpen(true);
      }
      return;
    }
  };

  const confirmReject = async () => {
    if (!rejectApplicationId) return;

    try {
      const response = await worksUpdate({
        variables: {
          applicantId: rejectApplicationId,
          State: "REJECTED",
        },
      });

      if (response.data) {
        toast({
          title: "Application rejected successfully",
          variant: "default",
        });

        await refetch();
        setShowRejectDialog(false);
        setRejectApplicationId(null);
      }
    } catch (error) {
      console.error("Reject mutation error:", error);
      toast({
        title: "Rejection failed",
        description:
          error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    }
  };

  const handleRowClick = (application: Application) => {
    setEditApplication(application);
    setEditDialogOpen(true);
  };

  const handleEditChange = (field: keyof Application, value: string) => {
    if (editApplication) {
      setEditApplication({ ...editApplication, [field]: value });
    }
  };

  const handleEditSave = async () => {
    if (!editApplication) return;

    try {
      const response = await worksUpdate({
        variables: {
          applicantId: editApplication.id,
          input: {
            name: editApplication.name,
            type: editApplication.type,
            number: editApplication.number,
            password: editApplication.password,
        },
        },
      });

      if (response.data) {
        toast({
          title: "Application updated successfully",
          variant: "default",
        });

        await refetch();
        setEditDialogOpen(false);
      }
    } catch (error) {
      console.error("Update mutation error:", error);
      toast({
        title: "Update failed",
        description:
          error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    }
  };

  const renderTableHeader = (column: keyof Application, label: string) => (
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
  const currentItems = filteredApplications.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  if (loading) return <div className="p-4">Loading applications...</div>;
  if (error)
    return (
      <div className="p-4 text-red-500">
        Error loading applications: {error.message}
      </div>
    );

  return (
    <div className="space-y-4 bg-gray-50 rounded-lg p-4">
      <div className="flex justify-between items-center">
        <Input
          placeholder="Search applications..."
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
                  checked={selectedItems.length === filteredApplications.length}
                  onCheckedChange={toggleSelectAll}
                />
              </TableHead>
              {renderTableHeader("name", "Name")}
              {renderTableHeader("type", "Position Type")}
                {renderTableHeader("number", "Number")}

              {renderTableHeader("createdAt", "Applied Date")}
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentItems.map((application) => (
              <TableRow key={application.id}>
                <TableCell>
                  <Checkbox
                    checked={selectedItems.includes(application.id)}
                    onCheckedChange={() => toggleSelectItem(application.id)}
                  />
                </TableCell>
                <TableCell>{application.name}</TableCell>
                <TableCell>{application.type}</TableCell>
                <TableCell>{application.number}</TableCell>
                <TableCell>
                  {new Date(application.createdAt).toLocaleDateString()}
                </TableCell>


                <TableCell>
                  <span className="px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                    {application.type}
                  </span>
                </TableCell>
                
                <TableCell>
                  {new Date(application.createdAt).toLocaleDateString()}
                </TableCell>
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
                          handleActionClick("reject", application.id)
                        }
                        className="text-red-600"
                      >
                        <XCircle className="mr-2 h-4 w-4" />
                        <span>Reject</span>
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        onClick={() => handleRowClick(application)}
                        className="text-red-600"
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        <span>Edit</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          handleActionClick("showlog", application.id)
                        }
                        className="text-red-600"
                      >
                        <DonutIcon className="mr-2 h-4 w-4" />
                        <span>Logs</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm text-gray-500">
            Showing {indexOfFirstItem + 1} to{" "}
            {Math.min(indexOfLastItem, filteredApplications.length)} of{" "}
            {filteredApplications.length} results
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
            disabled={indexOfLastItem >= filteredApplications.length}
          >
            Next
          </Button>
        </div>
      </div>

      {/* Edit Worker Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Worker Details</DialogTitle>
            <DialogDescription>
              Make changes to the worker details here. Click save when you're
              done.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Name"
              value={editApplication?.name || ""}
              onChange={(e) => handleEditChange("name", e.target.value)}
            />
            <Input
              placeholder="Number"
              value={editApplication?.number || ""}
              onChange={(e) => handleEditChange("number", e.target.value)}
            />
         
            <Input
              placeholder="Position Type"
              value={editApplication?.type || ""}
              onChange={(e) => handleEditChange("type", e.target.value)}
            />
      
      
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleEditSave}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Logs Dialog */}
      <Dialog open={logDialogOpen} onOpenChange={setLogDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Worker Logs</DialogTitle>
            <DialogDescription>
              View the worker's password and number.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div
              onClick={() => {
                if (logApplication?.password) {
                  navigator.clipboard.writeText(logApplication?.password);
                  toast({
                    title: "Password Copied to clipboard",

                    variant: "default",
                  });
                }
              }}
              className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <span className="text-sm text-zinc-700 dark:text-zinc-300">
                Password: {logApplication?.password}
              </span>
              <Copy className="w-4 h-4 text-zinc-500" />
            </div>
            <div
              onClick={() => {
                if (logApplication?.number) {
                  navigator.clipboard.writeText(logApplication?.number);
                  toast({
                    title: "Number Copied to clipboard",

                    variant: "default",
                  });
                }
              }}
              className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <span className="text-sm text-zinc-700 dark:text-zinc-300">
                Number: {logApplication?.number}
              </span>
              <Copy className="w-4 h-4 text-zinc-500" />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Confirmation Dialog */}
      <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Rejection</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to reject this application? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmReject}
              className="bg-red-600 hover:bg-red-700"
            >
              Reject
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default Vendor;
