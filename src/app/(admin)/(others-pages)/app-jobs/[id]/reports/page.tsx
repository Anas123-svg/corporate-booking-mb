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
import { ChevronLeft, ChevronRight, Pencil, Plus, BriefcaseBusiness, Trash2, Loader2, X } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import axios from "axios";
import useAuthStore from "@/store/authStore";
import toast from "react-hot-toast";

interface JobReport {
  id: number;
  report_name: string;
  job_id: number;
  form_data: Record<string, any>;
  created_at: string;
  updated_at: string;
}

const Reports = () => {
  const params = useParams();
  const jobId = params.id as string;

  const [searchTerm, setSearchTerm] = useState("");
  const [reports, setReports] = useState<JobReport[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalEntries, setTotalEntries] = useState(0);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(0);
  const [showReportModal, setShowReportModal] = useState(false);
  const [creatingReport, setCreatingReport] = useState(false);
  const itemsPerPage = 10;

  const { token } = useAuthStore();

  const INITIAL_FORM_DATA = {
    CoverPagePhoto: "",
    locationOfScaffold: null,
    tagId: null,
    scaffoldDesign: null,
    TG20Compliance: null,
    ClientName: "",
    FurtherActionRequiredApproval: null,
    NameofPersonInformedApproval: null,
    GeneralCommentsApprovalController: "",
    SafetyAdvisorName: "",
    safetyAdvisorApprovalDate: "",
    personInControlName: "",
    personInControlApprovalDate: "",
    canWorkBeCarriedOutSafely: null,
    clientSignature: "",
    inspectorSignature: "",
    siteAddress: "",
    inspectionAnswers: {},
    comments: [],
    sectionComments: {},
    sectionImages: {},
    sectionVisibility: {},
    sectionStatus: {},
    inspectionSections: {
      "01. Safe Access and Egress": ["Safe Access and Egress"],
      "02. Signing and out": ["Signing and out"],
      "03. RAMS": ["RAMS"],
      "04. Inductions": ["Inductions"],
      "05. Asbestos": ["Asbestos"],
      "06. Fire": ["Fire"],
      "07. Fire Extinguishers": ["Fire Extinguishers"],
      "08. Fire Alarms": ["Fire Alarms"],
      "09. Fire Risk Assessments": ["Fire Risk Assessments"],
      "10. Housekeeping": ["Housekeeping"],
      "11. Dust": ["Dust"],
      "12. Electric": ["Electric"],
      "13. Welfare": ["Welfare"],
      "14. Complaint": ["Complaint"],
      "15. Non Complaint": ["Non Complaint"],
      "16. Plant": ["Plant"],
      "17. Temporary Works": ["Temporary Works"],
      "18. First Aid": ["First Aid"],
      "19. PPE": ["PPE"],
      "20. Working at Height": ["Working at Height"],
      "21. Scaffolding": ["Scaffolding"],
      "22. 7 Day inspections carried out": ["7 Day inspections carried out"],
      "23. Register signed": ["Register signed"],
      "24. Permits": ["Permits"],
      "25. Manual Handling": ["Manual Handling"],
      "26. Mechanical Lifting": ["Mechanical Lifting"],
      "27. COSHH": ["COSHH"],
      "28. Demolition": ["Demolition"],
      "29. Small Plant": ["Small Plant"],
      "30. Waste": ["Waste"],
      "31. Unsafe acts": ["Unsafe acts"],
      "32. Competency": ["Competency"],
      "33. Toolbox Talks": ["Toolbox Talks"],
      "34. Open Voids": ["Open Voids"],
      "sectionT": ["sectionT"],
    },
  };

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/job-reports/job/${jobId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setReports(response.data);
      setTotalEntries(response.data.length);
      setTotalPages(Math.ceil(response.data.length / itemsPerPage));
    } catch (error) {
      console.log("Error fetching reports:", error);
      toast.error("Error fetching reports");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (jobId) {
      fetchReports();
    }
  }, [jobId]);

  const filteredReports = reports.filter((report) =>
    report.report_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Update total entries and pages when filtered results change
  useEffect(() => {
    setTotalEntries(filteredReports.length);
    setTotalPages(Math.ceil(filteredReports.length / itemsPerPage));
  }, [filteredReports]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleDeleteReport = async (id: number) => {
    if (confirm("Are you sure you want to delete this report?")) {
      try {
        await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/job-reports/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        toast.success("Report deleted successfully");
        fetchReports();
      } catch (error) {
        toast.error("Error deleting report");
        console.log("Error deleting report:", error);
      }
    }
  };

  const handleCreateSiteSafetyReport = async () => {
    try {
      setCreatingReport(true);
      const payload = {
        report_name: "Site Safety Inspection Report",
        layout: "Site Safety Inspection Report",
        job_id: parseInt(jobId),
        form_data: INITIAL_FORM_DATA,
      };

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/job-reports`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success("Report created successfully");
      setShowReportModal(false);
      fetchReports();
    } catch (error) {
      toast.error("Error creating report");
      console.log("Error creating report:", error);
    } finally {
      setCreatingReport(false);
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

  // Get current reports for pagination
  const indexOfLastReport = currentPage * itemsPerPage;
  const indexOfFirstReport = indexOfLastReport - itemsPerPage;
  const currentReports = filteredReports.slice(indexOfFirstReport, indexOfLastReport);

  // Dynamic pagination buttons
  const renderPaginationButtons = () => {
    const buttons = [];
    const maxVisibleButtons = 5;

    // Always show first page
    buttons.push(
      <button
        key={1}
        onClick={() => goToPage(1)}
        className={`flex items-center justify-center w-10 h-10 rounded-md border ${currentPage === 1
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
            className={`flex items-center justify-center w-10 h-10 rounded-md border ${currentPage === i
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
          className={`flex items-center justify-center w-10 h-10 rounded-md border ${currentPage === totalPages
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
      <PageBreadcrumb pageTitle="Job Reports" />
      <div className="space-y-6">
        <ComponentCard title="Reports Table">
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 border-b border-gray-100 dark:border-white/[0.05]">
              <div className="relative w-full sm:w-64 mb-4 sm:mb-0">
                <input
                  type="text"
                  placeholder="Search reports..."
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
              <button
                onClick={() => setShowReportModal(true)}
                className="inline-flex items-center px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors dark:bg-red-800 dark:hover:bg-red-700 dark:focus:ring-red-500"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Report
              </button>
            </div>
            <div className="max-w-full overflow-x-auto">
              <Table>
                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                  <TableRow>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Report Name
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Created Date
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Updated Date
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
                  {currentReports.length > 0 &&
                    currentReports.map((report) => (
                      <TableRow key={report.id}>
                        <TableCell className="px-5 py-4 sm:px-6 text-start">
                          <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                            {report.report_name}
                          </span>
                        </TableCell>
                        <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                          {new Date(report.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                          {new Date(report.updated_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                          <div className="flex items-center gap-2">
                            <Link
                              href={`/app-jobs/${jobId}/reports/pdf/${report.id}`}
                              title="PDF Report"
                              className="
    inline-flex items-center gap-2
    px-3 py-1.5
    rounded-md
    bg-red-500
    text-white
    text-sm font-medium
    hover:bg-red-600
    active:bg-red-700
    transition-colors
    dark:bg-red-600
    dark:hover:bg-red-700
  "
                            >
                              <BriefcaseBusiness className="w-4 h-4 text-white" />
                              Generate PDF
                            </Link>

                            <Link
                              href={`/app-jobs/${jobId}/reports/edit/${report.id}`}
                              className="p-1.5 text-red-500 hover:bg-red-50 rounded-full transition-colors dark:text-red-400 dark:hover:bg-red-900/20"
                              title="Edit report"
                            >
                              <Pencil className="w-4 h-4" />
                            </Link>
                            <button
                              onClick={() => handleDeleteReport(report.id)}
                              className="p-1.5 text-red-500 hover:bg-red-50 rounded-full transition-colors dark:text-red-400 dark:hover:bg-red-900/20"
                              title="Delete report"
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
                {loading ? (
                  <div className="flex items-center justify-center h-32">
                    <Loader2 className="animate-spin text-red-500" size={24} />
                  </div>
                ) : filteredReports.length === 0 ? (
                  <div className="px-5 py-4 text-center text-gray-500 dark:text-gray-400">
                    No reports found.
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

      {/* Report Modal */}
      {showReportModal && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowReportModal(false)}
          ></div>
          <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
            <div className="bg-white rounded-lg shadow-xl max-w-sm w-full mx-4 dark:bg-gray-800 pointer-events-auto">
              <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Select Report Type
                </h2>
                <button
                  onClick={() => setShowReportModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="p-6">
                <button
                  onClick={handleCreateSiteSafetyReport}
                  disabled={creatingReport}
                  className="w-full px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors dark:bg-red-800 dark:hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {creatingReport && <Loader2 className="w-4 h-4 animate-spin" />}
                  Site Safety Inspection Report
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Reports;