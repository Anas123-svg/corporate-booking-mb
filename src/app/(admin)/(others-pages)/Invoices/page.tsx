"use client";

import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import { useState, useEffect } from "react";
import { Search, Eye } from "lucide-react";
import { useRouter } from "next/navigation";

type Invoice = {
  id: number;
  orderid: number;
  invoiceno: string;
  invoicedate: number;
  invoicestatus: string;
  paymentmethod: string;
  stripe_transactionid: string | null;
  listid: number;
  userid: number;
  hostid: number;
  book_agent_id: number;
  host_agent_id: number;
  reservation_id: number;
  amount: string;
  status: string;
  created_at: string;
  updated_at: string;
  user_name: string;
  host_name: string;
};

const Invoices = () => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchInvoices = async () => {
      setLoading(true);
      setError("");
      let corporate_book_host_id = null;

      if (typeof window !== "undefined") {
        const authRaw = localStorage.getItem("auth-storage");
        if (authRaw) {
          try {
            const authObj = JSON.parse(authRaw);
            if (authObj?.state?.user?.id) {
              corporate_book_host_id = authObj.state.user.id;
            }
          } catch (e) {
            console.error("Error parsing auth storage:", e);
          }
        }
      }

      if (!corporate_book_host_id) {
        setError("Corporate Host ID not found. Please login again.");
        setLoading(false);
        return;
      }

      try {
        const url = `${process.env.NEXT_PUBLIC_API_URL}/invoice/getinvoicesbybookadminid/${corporate_book_host_id}`;
        console.log("Fetching invoices from URL:", url);
        const res = await fetch(url, {
          method: "GET",
          headers: { "Content-Type": "application/json" }
        });
        console.log("Fetch response status:", res.status);
        const data = await res.json();
        console.log("Fetched invoices response:", data);

        if (data.success && Array.isArray(data.data)) {
          setInvoices(data.data);
        } else {
          setInvoices([]);
        }
      } catch (err) {
        console.error("Error fetching invoices:", err);
        setError("Failed to fetch invoices");
        setInvoices([]);
      } finally {
        setLoading(false);
      }
    };

    fetchInvoices();
  }, []);

  const filteredInvoices = invoices.filter((invoice) => {
    const search = searchTerm.toLowerCase();
    return (
      `${invoice.invoiceno || ""}`.toLowerCase().includes(search) ||
      `${invoice.user_name || ""}`.toLowerCase().includes(search) ||
      `${invoice.host_name || ""}`.toLowerCase().includes(search) ||
      `${invoice.invoicestatus || ""}`.toLowerCase().includes(search) ||
      `${invoice.paymentmethod || ""}`.toLowerCase().includes(search) ||
      `${invoice.amount || ""}`.toLowerCase().includes(search) ||
      `${invoice.id}`.includes(search)
    );
  });



  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;900&family=Inter:wght@300;400;500;600&display=swap');
        
        :root {
          --primary: #1a1a1a;
          --secondary: #d4a574;
          --accent: #8b7355;
          --bg-light: #fafaf8;
          --bg-card: #ffffff;
          --text-primary: #1a1a1a;
          --text-secondary: #6b6b6b;
          --border: #e8e8e6;
          --shadow: rgba(0, 0, 0, 0.08);
        }
        
        .dark {
          --primary: #ffffff;
          --secondary: #d4a574;
          --accent: #b8936d;
          --bg-light: #0f0f0f;
          --bg-card: #1a1a1a;
          --text-primary: #ffffff;
          --text-secondary: #a3a3a3;
          --border: #2a2a2a;
          --shadow: rgba(0, 0, 0, 0.3);
        }
        
        body {
          background: var(--bg-light);
          font-family: 'Inter', sans-serif;
        }
        
        .playfair {
          font-family: 'Playfair Display', serif;
        }
        
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        .animate-slide-up {
          animation: slideUp 0.6s ease-out forwards;
        }
        
        .animate-fade-in {
          animation: fadeIn 0.8s ease-out forwards;
        }
        
        input:focus, select:focus {
          outline: none;
          border-color: var(--secondary) !important;
          box-shadow: 0 0 0 3px rgba(212, 165, 116, 0.1) !important;
        }
        
        .action-btn {
          transition: all 0.2s ease;
        }
        
        .action-btn:hover {
          transform: scale(1.1);
        }

        .table-cell-header {
          color: var(--text-primary);
          background: var(--bg-card);
          font-size: 1rem;
        }

        .table-cell-text-primary {
          color: var(--text-primary);
        }

        .table-cell-text-secondary {
          color: var(--text-secondary);
        }

        .table-cell-border {
          border-color: var(--border);
        }

        .avatar-border {
          border-color: var(--secondary);
        }

        .status-online {
          background: #22c55e;
          border-color: var(--bg-card);
        }

        .spinner-border {
          border-color: var(--secondary);
        }

        .empty-state-bg {
          background: var(--bg-light);
        }

        .empty-state-icon {
          color: var(--text-secondary);
        }

        .action-btn-edit {
          color: var(--secondary);
        }

        .action-btn-edit:hover {
          background: rgba(212, 165, 116, 0.1);
        }

        .action-btn-delete {
          color: #ef4444;
        }

        .action-btn-delete:hover {
          background: rgba(239, 68, 68, 0.1);
        }
      `}</style>

      {/* <PageBreadcrumb pageTitle="Bookings" /> */}

      <div className="min-h-screen pt-2 pb-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-8">
            <div className="inline-block mb-2">
              <div className="w-20 h-1 bg-gradient-to-r from-transparent via-secondary to-transparent mx-auto mb-3"></div>
            </div>

            <h1
              className="playfair text-2xl md:text-5xl font-semibold mb-2 tracking-tight"
              style={{ color: 'var(--text-primary)' }}
            >
              Your Invoices
            </h1>

            <p
              className="text-base md:text-lg"
              style={{ color: 'var(--text-secondary)' }}
            >
              View and manage your invoices
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-600 dark:text-red-400 text-center">{error}</p>
            </div>
          )}

          {/* Main Card */}
          <div className="bg-card rounded-2xl shadow-lg overflow-hidden border animate-slide-up table-cell-border" style={{
            background: 'var(--bg-card)',
            boxShadow: '0 4px 6px -1px var(--shadow), 0 2px 4px -1px var(--shadow)'
          }}>
            {/* Search */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-6 border-b gap-4 table-cell-border">
              <div className="relative w-full sm:w-80">
                <input
                  type="text"
                  placeholder="Search invoices..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-3.5 pl-11 rounded-lg border-2 transition-all duration-200 hover:border-secondary/50 table-cell-text-primary"
                  style={{
                    background: 'var(--bg-light)',
                    borderColor: 'var(--border)'
                  }}
                />
                <Search className="absolute left-3 top-3.5 h-5 w-5 table-cell-text-secondary" />
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="table-cell-border">
                    <TableCell isHeader className="px-6 py-4 font-semibold text-left playfair table-cell-header">
                      Invoice No
                    </TableCell>
                    <TableCell isHeader className="px-6 py-4 font-semibold text-left playfair table-cell-header">
                      Order ID
                    </TableCell>
                    <TableCell isHeader className="px-6 py-4 font-semibold text-left playfair table-cell-header">
                      Client
                    </TableCell>
                    <TableCell isHeader className="px-6 py-4 font-semibold text-left playfair table-cell-header">
                      Host
                    </TableCell>
                    <TableCell isHeader className="px-6 py-4 font-semibold text-left playfair table-cell-header">
                      Invoice Date
                    </TableCell>
                    <TableCell isHeader className="px-6 py-4 font-semibold text-left playfair table-cell-header">
                      Amount
                    </TableCell>
                    <TableCell isHeader className="px-6 py-4 font-semibold text-left playfair table-cell-header">
                      Status
                    </TableCell>
                    <TableCell isHeader className="px-6 py-4 font-semibold text-left playfair table-cell-header">
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell  className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mb-4 spinner-border"></div>
                          <p className="table-cell-text-secondary">Loading invoices...</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : filteredInvoices.length > 0 ? (
                    filteredInvoices.map((invoice) => (
                      <TableRow
                        key={invoice.id}
                        className="transition-colors hover:bg-opacity-50 table-cell-border"
                      >
                        <TableCell className="px-6 py-5">
                          <span className="font-semibold text-base table-cell-text-primary">
                            {invoice.invoiceno}
                          </span>
                        </TableCell>

                        <TableCell className="px-6 py-5 text-left table-cell-text-secondary">
                          #{invoice.orderid}
                        </TableCell>

                        <TableCell className="px-6 py-5 text-left table-cell-text-secondary">
                          {invoice.user_name || "-"}
                        </TableCell>

                        <TableCell className="px-6 py-5 text-left table-cell-text-secondary">
                          {invoice.host_name || "-"}
                        </TableCell>

                        <TableCell className="px-6 py-5 text-left table-cell-text-secondary">
                          {new Date(invoice.invoicedate * 1000).toLocaleDateString()}
                        </TableCell>

                        <TableCell className="px-6 py-5 text-left table-cell-text-secondary">
                          ${invoice.amount}
                        </TableCell>

                        <TableCell className="px-6 py-5 text-left">
                          <span
                            className="px-3 py-1 rounded-full text-xs font-semibold"
                            style={{
                              background: invoice.invoicestatus === "paid" ? "#22c55e" : invoice.invoicestatus === "pending" ? "#facc15" : "#ef4444",
                              color: "#fff"
                            }}
                          >
                            {invoice.invoicestatus}
                          </span>
                        </TableCell>

                        <TableCell className="px-6 py-5 text-left">
                          <button
                            // onClick={() => router.push(`/invoices`)}
                            className="action-btn action-btn-edit inline-flex items-center gap-2 px-3 py-2 rounded-lg transition-all hover:bg-opacity-20"
                            style={{ color: 'var(--secondary)' }}
                          >
                            <Eye className="w-4 h-4" />
                            <span>View</span>
                          </button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell  className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4 empty-state-bg">
                            <svg className="w-8 h-8 empty-state-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <p className="text-lg font-medium mb-2 table-cell-text-primary">No invoices found</p>
                          <p className="text-sm table-cell-text-secondary">
                            {searchTerm ? "Try adjusting your search" : "New invoices will appear here"}
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </div>

    </>
  );
};

export default Invoices;