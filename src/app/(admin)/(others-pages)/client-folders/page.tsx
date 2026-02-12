"use client";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Loader2, Mail, Phone } from "lucide-react";
import Link from "next/link";
import axios from "axios";
import useAuthStore from "@/store/authStore";

interface Client {
  id: number;
  name: string;
  surname: string;
  email: string;
  phone: string;
  profileImage?: string;
  country: string;
  city: string;
}

const FolderManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [clients, setClients] = useState<Client[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalEntries, setTotalEntries] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const itemsPerPage = 8; // Reduced for better card layout
  
  const { token } = useAuthStore();
  
const fetchClients = async () => {
  if (!token) return; // Add guard clause to prevent API call without token
  
  try {
    setLoading(true);
    const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/client`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    setClients(response.data);
    setTotalEntries(response.data.length);
    setTotalPages(Math.ceil(response.data.length / itemsPerPage));
  } catch (error) {
    console.log("Error fetching clients:", error);
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  fetchClients();
}, [token]); // Add token as dependency
  
  const filteredClients = clients.filter((client) =>
    `${client.name} ${client.surname}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  useEffect(() => {
    setTotalEntries(filteredClients.length);
    setTotalPages(Math.ceil(filteredClients.length / itemsPerPage));
  }, [filteredClients]);
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };
  
const goToPage = (page: number): void => {
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
  
  // Get current clients for pagination
  const indexOfLastClient = currentPage * itemsPerPage;
  const indexOfFirstClient = indexOfLastClient - itemsPerPage;
  const currentClients = filteredClients.slice(indexOfFirstClient, indexOfLastClient);
  
  // Dynamic pagination buttons
  const renderPaginationButtons = () => {
    const buttons = [];
    
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
      <PageBreadcrumb pageTitle="Folder Management" />
      <div className="space-y-6">
        <ComponentCard title="Select Client">
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 border-b border-gray-100 dark:border-white/[0.05]">
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="Search clients..."
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
            </div>
            
            {/* Card Grid Layout */}
            <div className="p-4">
               { loading ? (
                <div className="flex items-center justify-center h-32">
                  <Loader2 className="animate-spin text-red-500" size={24} />
                </div>
              ) :
              currentClients.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {currentClients.map((client) => (
                    <Link href={`/client-folders/${client.id}`}
                      key={client.id} 
                      className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow duration-200"
                    >
                      <div className="p-6 flex flex-col items-center text-center">
                        <div className="w-24 h-24 overflow-hidden rounded-full mb-4">
                          <img
                            className="w-full h-full object-cover"
                            src={client.profileImage || "/images/default-avatar.jpg"}
                            alt={`${client.name} ${client.surname}`}
                          />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-3">
                          {client.name} {client.surname}
                        </h3>
                        <div className="w-full">
                          <div className="flex items-center justify-center text-gray-500 dark:text-gray-400 mb-2">
                            <Mail className="w-4 h-4 mr-2" />
                            <span className="text-sm truncate">{client.email}</span>
                          </div>
                          <div className="flex items-center justify-center text-gray-500 dark:text-gray-400">
                            <Phone className="w-4 h-4 mr-2" />
                            <span className="text-sm">{client.phone}</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-gray-500 dark:text-gray-400">
                  No clients found.
                </div>
              )}
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

export default FolderManagement;