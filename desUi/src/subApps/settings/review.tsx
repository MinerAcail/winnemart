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
  CheckCircle,
  XCircle,
  Mail,
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

const GET_APPLICATIONS = gql`
  query reviewApplicate {
    reviewApplicate {
      id
      name
      experience
      email
      type
      state
      createdAt
    }
  }
`;

const UPDATE_APPLICATION_STATE = gql`
  mutation jobResponse($applicantId: String!, $State: String!) {
    jobResponse(applicantId: $applicantId, State: $State) {
      id
      state
    }
  }
`;

interface Application {
  id: string;
  name: string;
  experience: string;
  email: string;
  type: string;
  state: string;

  createdAt: string;
}

export function ReviewApplicate() {
  const { loading, error, data, refetch } = useQuery(GET_APPLICATIONS);
  const [jobResponse] = useMutation(UPDATE_APPLICATION_STATE, {
    refetchQueries: ["reviewApplicate"],
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

  useEffect(() => {
    if (data?.reviewApplicate) {
      const filtered = data.reviewApplicate.filter((application: Application) =>
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
    action: "approve" | "reject" | "contact",
    applicantId: string
  ) => {
    if (action === "reject") {
      setRejectApplicationId(applicantId);
      setShowRejectDialog(true);
      return;
    }
  
    try {
      if (action === "contact") {
        const application = filteredApplications.find(
          (app) => app.id === applicantId
        );
        if (application) {
          window.location.href = `mailto:${application.email}`;
          return;
        }
      }
  
      const state = action === "approve" ? "APPROVED" : "REJECTED";
      const response = await jobResponse({
        variables: {
          applicantId,
          State: state,
        },
      });
  
      if (response.data) {
        toast({
          title: `Application ${action === "approve" ? "approved" : "rejected"} successfully`,
          variant: "default",
        });
  
        await refetch();
      }
    } catch (error) {
      console.error('Mutation error:', error);
      toast({
        title: "Action failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    }
  };

  const confirmReject = async () => {
    if (!rejectApplicationId) return;
  
    try {
      const response = await jobResponse({
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
      console.error('Reject mutation error:', error);
      toast({
        title: "Rejection failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
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
              {renderTableHeader("experience", "Experience")}
              {renderTableHeader("email", "Email")}
              {renderTableHeader("type", "Position Type")}
              {renderTableHeader("state", "State")}
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
                <TableCell>{application.experience} years</TableCell>
                <TableCell>{application.email}</TableCell>
                <TableCell>
                  <span className="px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                    {application.type}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                    {application.state || "PENDIND"}
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
                          handleActionClick("approve", application.id)
                        }
                      >
                        <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                        <span>Approve</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          handleActionClick("contact", application.id)
                        }
                      >
                        <Mail className="mr-2 h-4 w-4 text-blue-600" />
                        <span>Contact</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() =>
                          handleActionClick("reject", application.id)
                        }
                        className="text-red-600"
                      >
                        <XCircle className="mr-2 h-4 w-4" />
                        <span>Rejectkkll</span>
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

export default ReviewApplicate;
