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
import type { Job } from "@/types";

const Jobs = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalEntries, setTotalEntries] = useState(0);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(0);
  const itemsPerPage = 10;
  
  const { token } = useAuthStore();
  
  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/jobs`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setJobs(response.data);
      setTotalEntries(response.data.length);
      setTotalPages(Math.ceil(response.data.length / itemsPerPage));
    } catch (error) {
      console.log("Error fetching jobs:", error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchJobs();
  }, []);
  
  const filteredJobs = jobs.filter((job) =>
    job.job_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (job.client_name && job.client_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    job.status.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Update total entries and pages when filtered results change
  useEffect(() => {
    setTotalEntries(filteredJobs.length);
    setTotalPages(Math.ceil(filteredJobs.length / itemsPerPage));
  }, [filteredJobs]);
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };
  
  const handleDeleteJob = async (id: number) => {
    if (confirm("Are you sure you want to delete this job?")) {
      try {
        await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/jobs/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        toast.success("Job deleted successfully");
        fetchJobs();
      } catch (error) {
        toast.error("Error deleting job");
        console.log("Error deleting job:", error);
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
  
  // Get current jobs for pagination
  const indexOfLastJob = currentPage * itemsPerPage;
  const indexOfFirstJob = indexOfLastJob - itemsPerPage;
  const currentJobs = filteredJobs.slice(indexOfFirstJob, indexOfLastJob);
  
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
      <PageBreadcrumb pageTitle="Jobs" />
      <div className="space-y-6">
        <ComponentCard title="Jobs Table">
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 border-b border-gray-100 dark:border-white/[0.05]">
              <div className="relative w-full sm:w-64 mb-4 sm:mb-0">
                <input
                  type="text"
                  placeholder="Search jobs..."
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
                href="/app-jobs/create"
                className="inline-flex items-center px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors dark:bg-red-800 dark:hover:bg-red-700 dark:focus:ring-red-500"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Job
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
                      Job Title
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Client
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Status
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      On-Site Date
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Due Date
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
                 {currentJobs.length > 0 &&
                    currentJobs.map((job) => (
                      <TableRow key={job.id}>
                        <TableCell className="px-5 py-4 sm:px-6 text-start">
                          <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                            {job.job_title}
                          </span>
                        </TableCell>
                        <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                          {job.client_name || "N/A"}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-start text-theme-sm">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            job.status === 'scheduled' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' :
                            job.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                            job.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
                            'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                          }`}>
                            {job.status}
                          </span>
                        </TableCell>
                        <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                          <div>
                            <div>{job.on_site_date}</div>
                            <div className="text-xs text-gray-400">{job.on_site_time}</div>
                          </div>
                        </TableCell>
                        <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                          {job.due_on}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                          <div className="flex items-center">
                            <Link
                              href={`/app-jobs/${job.id}/reports`}
                              className="inline-flex items-center px-3 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-700 text-xs transition-colors"
                            >
                              <Plus className="w-3 h-3 mr-1" />
                              Reports
                            </Link>
                            <Link
                              href={`/app-jobs/edit/${job.id}`}
                              className="p-1.5 text-red-500 hover:bg-red-50 rounded-full transition-colors dark:text-red-400 dark:hover:bg-red-900/20"
                              title="Edit job"
                            >
                              <Pencil className="w-4 h-4" />
                            </Link>
                            <button
                              onClick={() => handleDeleteJob(job.id)}
                              className="p-1.5 text-red-500 hover:bg-red-50 rounded-full transition-colors dark:text-red-400 dark:hover:bg-red-900/20"
                              title="Delete job"
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
                filteredJobs.length === 0 ? (
                  <div className="px-5 py-4 text-center text-gray-500 dark:text-gray-400">
                    No jobs found.
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

export default Jobs;