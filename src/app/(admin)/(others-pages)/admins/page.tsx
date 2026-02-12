"use client";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Pencil, Plus, Trash2 ,Loader2} from "lucide-react";
import Link from "next/link";
import axios from "axios";
import useAuthStore from "@/store/authStore";
import toast from "react-hot-toast";
import type { Admin } from "@/types";

const Admins = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalEntries, setTotalEntries] = useState(0);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(0);
  const itemsPerPage = 10;
  
  const { token } = useAuthStore();
  
  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/admin`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setAdmins(response.data);
      setTotalEntries(response.data.length);
      setTotalPages(Math.ceil(response.data.length / itemsPerPage));
    } catch (error) {
      console.log("Error fetching admins:", error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchAdmins();
  }, []);
  
  const filteredAdmins = admins.filter((admin) =>
    admin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    admin.email.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Update total entries and pages when filtered results change
  useEffect(() => {
    setTotalEntries(filteredAdmins.length);
    setTotalPages(Math.ceil(filteredAdmins.length / itemsPerPage));
  }, [filteredAdmins]);
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };
  
  const handleDeleteAdmin = async (id: number) => {
    if (confirm("Are you sure you want to delete this admin?")) {
      try {
        await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/admin/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        toast.success("Admin deleted successfully");
        fetchAdmins();
      } catch (error) {
        toast.error("Error deleting admin");
        console.log("Error deleting admin:", error);
      }
    }
  };
  
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };
  
  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };
  
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };
  
  // Get current admins for pagination
  const indexOfLastAdmin = currentPage * itemsPerPage;
  const indexOfFirstAdmin = indexOfLastAdmin - itemsPerPage;
  const currentAdmins = filteredAdmins.slice(indexOfFirstAdmin, indexOfLastAdmin);
  
  // Dynamic pagination buttons
  const renderPaginationButtons = () => {
    const buttons = [];
    const maxVisibleButtons = 5;
    
    // Always show first page
    buttons.push(
      <button
        key={1}
        onClick={() => goToPage(1)}
        className={`flex items-center justify-center w-10 h-10 rounded-md border ${
          currentPage === 1
            ? "border-red-500 bg-red-50 text-red-500 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800"
            : "border-gray-200 bg-white text-gray-500 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
        }`}
      >
        1
      </button>
    );
    
    // Add ellipsis if needed
    if (currentPage > 3) {
      buttons.push(
        <span key="ellipsis1" className="px-2">
          ...
        </span>
      );
    }
    
    // Add pages around current page
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      if (i > 1 && i < totalPages) {
        buttons.push(
          <button
            key={i}
            onClick={() => goToPage(i)}
            className={`flex items-center justify-center w-10 h-10 rounded-md border ${
              currentPage === i
                ? "border-red-500 bg-red-50 text-red-500 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800"
                : "border-gray-200 bg-white text-gray-500 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
            }`}
          >
            {i}
          </button>
        );
      }
    }
    
    // Add ellipsis if needed
    if (currentPage < totalPages - 2) {
      buttons.push(
        <span key="ellipsis2" className="px-2">
          ...
        </span>
      );
    }
    
    // Always show last page if there's more than one page
    if (totalPages > 1) {
      buttons.push(
        <button
          key={totalPages}
          onClick={() => goToPage(totalPages)}
          className={`flex items-center justify-center w-10 h-10 rounded-md border ${
            currentPage === totalPages
              ? "border-red-500 bg-red-50 text-red-500 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800"
              : "border-gray-200 bg-white text-gray-500 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
          }`}
        >
          {totalPages}
        </button>
      );
    }
    
    return buttons;
  };
  
  return (
    <>
      <PageBreadcrumb pageTitle="Admins" />
      <div className="space-y-6">
        <ComponentCard title="Admins Table">
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 border-b border-gray-100 dark:border-white/[0.05]">
              <div className="relative w-full sm:w-64 mb-4 sm:mb-0">
                <input
                  type="text"
                  placeholder="Search admins..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                />
                <svg
                  className="absolute right-3 top-2.5 h-5 w-5 text-gray-400 dark:text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  ></path>
                </svg>
              </div>
              <Link
                href="/admins/create"
                className="inline-flex items-center px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors dark:bg-red-800 dark:hover:bg-red-700 dark:focus:ring-red-500"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Admin
              </Link>
            </div>
            <div className="max-w-full overflow-x-auto">
              <Table>
                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                  <TableRow>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Admin
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Email
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Phone
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                 {currentAdmins.length > 0 &&
                    currentAdmins.map((admin) => (
                      <TableRow key={admin.id}>
                        <TableCell className="px-5 py-4 sm:px-6 text-start">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 overflow-hidden rounded-full">
                              <img
                                width={40}
                                height={40}
                                src={admin.profileImage || "/images/default-avatar.jpg"}
                                alt={admin.name}
                              />
                            </div>
                            <div>
                              <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                                {admin.name}
                              </span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                          {admin.email}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                          {admin.phone}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                          <div className="flex items-center">
                            <Link
                              href={`/admins/edit/${admin.id}`}
                              className="p-1.5 text-red-500 hover:bg-red-50 rounded-full transition-colors dark:text-red-400 dark:hover:bg-red-900/20"
                              title="Edit admin"
                            >
                              <Pencil className="w-4 h-4" />
                            </Link>
                            <button
                              onClick={() => handleDeleteAdmin(admin.id)}
                              className="p-1.5 text-red-500 hover:bg-red-50 rounded-full transition-colors dark:text-red-400 dark:hover:bg-red-900/20"
                              title="Delete admin"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
              <div>
                {loading ?
                <div className="flex items-center justify-center h-32">
                <Loader2 className="animate-spin text-red-500" size={24} />
                </div> :
                filteredAdmins.length === 0 ? (
                  <div className="px-5 py-4 text-center text-gray-500 dark:text-gray-400">
                    No admins found.
                  </div>
                ) : null}
              </div>
            </div>
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-white/[0.05]">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {totalEntries > 0 ? (
                  <>
                    Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                    {Math.min(currentPage * itemsPerPage, totalEntries)} of{" "}
                    {totalEntries} entries
                  </>
                ) : (
                  "No entries to show"
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={goToPreviousPage}
                  disabled={currentPage === 1 || totalPages === 0}
                  className="flex items-center justify-center w-10 h-10 rounded-md border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                
                {totalPages > 0 && renderPaginationButtons()}
                
                <button
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages || totalPages === 0}
                  className="flex items-center justify-center w-10 h-10 rounded-md border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>
        </ComponentCard>
      </div>
    </>
  );
};

export default Admins;