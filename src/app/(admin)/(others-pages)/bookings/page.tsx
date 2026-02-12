"use client";

import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import { useState, useEffect } from "react";
import { Search, Edit } from "lucide-react";
import { useRouter } from "next/navigation";

type Booking = {
  id: number;
  userid: number;
  hostid: number;
  listid: number;
  fromdate: number;
  todate: number;
  checkin: string;
  checkout: string;
  guests: number;
  currencycode: string;
  total: string;
  bookstatus: string;
  orderstatus: string;
  cdate: string;
  client_name: string;
  host_name: string;
};

const Bookings = () => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelBooking, setCancelBooking] = useState<Booking | null>(null);
  const [refundAmount, setRefundAmount] = useState("");
  const [cancelError, setCancelError] = useState("");
  const [cancelLoading, setCancelLoading] = useState(false);

  useEffect(() => {
    const fetchBookings = async () => {
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
        const url = `${process.env.NEXT_PUBLIC_API_URL}/reservation/listbybookadminid/${corporate_book_host_id}`;
        console.log("Fetching bookings from URL:", url);
        const res = await fetch(url, {
          method: "GET",
          headers: { "Content-Type": "application/json" }
        });
        console.log("Fetch response status:", res.status);
        const data = await res.json();
        console.log("Fetched bookings response:", data);

        if (data.success && Array.isArray(data.reservations)) {
          setBookings(data.reservations);
        } else {
          setBookings([]);
        }
      } catch (err) {
        console.error("Error fetching bookings:", err);
        setError("Failed to fetch bookings");
        setBookings([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const filteredBookings = bookings.filter((booking) => {
    const search = searchTerm.toLowerCase();
    return (
      `${booking.client_name || ""}`.toLowerCase().includes(search) ||
      `${booking.host_name || ""}`.toLowerCase().includes(search) ||
      `${booking.bookstatus || ""}`.toLowerCase().includes(search) ||
      `${booking.orderstatus || ""}`.toLowerCase().includes(search) ||
      `${booking.currencycode || ""}`.toLowerCase().includes(search) ||
      `${booking.total || ""}`.toLowerCase().includes(search) ||
      `${booking.id}`.includes(search)
    );
  });

  const toNumber = (value: string): number => {
    if (!value) return 0;
    const normalized = String(value).replace(/[^0-9.-]/g, "");
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : 0;
  };

  const openCancelModal = (booking: Booking) => {
    const total = toNumber(booking.total);
    setCancelBooking(booking);
    setRefundAmount(total.toString());
    setCancelError("");
    setCancelOpen(true);
  };

  const closeCancelModal = () => {
    setCancelOpen(false);
    setCancelBooking(null);
    setRefundAmount("");
    setCancelError("");
    setCancelLoading(false);
  };

  const submitCancellation = async (refund: boolean) => {
    if (!cancelBooking) return;

    const maxRefund = toNumber(cancelBooking.total);
    const amount = toNumber(refundAmount);

    if (refund) {
      if (!Number.isFinite(amount) || amount < 0) {
        setCancelError("Please enter a valid refund amount.");
        return;
      }
      if (amount > maxRefund) {
        setCancelError("Refund amount cannot exceed reservation total.");
        return;
      }
    }

    const apiBase = process.env.NEXT_PUBLIC_API_URL;
    if (!apiBase) {
      setCancelError("API base URL is not configured.");
      return;
    }

    setCancelLoading(true);
    setCancelError("");

    try {
      const payload = {
        id: cancelBooking.id,
        reservationid: cancelBooking.id,
        cancelby: "corporate booking admin",
        refund,
        refund_amount: refund ? Math.round(amount * 100) : 0,
      };

      const res = await fetch(
        `${apiBase}/reservation/cancel/${cancelBooking.id}`,
        {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        }
      );

      const data = await res.json();
      if (!res.ok || !data?.success) {
        setCancelError(data?.message || "Cancellation failed.");
        console.error("Cancellation API error:", data);
        setCancelLoading(false);
        return;
      }

      setBookings((prev) =>
        prev.map((booking) =>
          booking.id === cancelBooking.id
            ? {
                ...booking,
                bookstatus: "cancelled",
                orderstatus: refund ? "refunded" : "cancelled",
              }
            : booking
        )
      );

      closeCancelModal();
    } catch (err) {
      console.error("Cancellation error:", err);
      setCancelError("Cancellation failed. Please try again.");
      setCancelLoading(false);
    }
  };

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
              Your Bookings
            </h1>

            <p
              className="text-base md:text-lg"
              style={{ color: 'var(--text-secondary)' }}
            >
              View and manage your bookings
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
                  placeholder="Search bookings..."
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
                      Booking ID
                    </TableCell>
                    <TableCell isHeader className="px-6 py-4 font-semibold text-left playfair table-cell-header">
                      Client
                    </TableCell>
                    <TableCell isHeader className="px-6 py-4 font-semibold text-left playfair table-cell-header">
                      Host
                    </TableCell>
                    <TableCell isHeader className="px-6 py-4 font-semibold text-left playfair table-cell-header">
                      Dates
                    </TableCell>
                    <TableCell isHeader className="px-6 py-4 font-semibold text-left playfair table-cell-header">
                      Guests
                    </TableCell>
                    <TableCell isHeader className="px-6 py-4 font-semibold text-left playfair table-cell-header">
                      Total
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
                          <p className="table-cell-text-secondary">Loading bookings...</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : filteredBookings.length > 0 ? (
                    filteredBookings.map((booking) => (
                      <TableRow
                        key={booking.id}
                        className="transition-colors hover:bg-opacity-50 table-cell-border"
                      >
                        <TableCell className="px-6 py-5">
                          <span className="font-semibold text-base table-cell-text-primary">
                            #{booking.id}
                          </span>
                        </TableCell>

                        <TableCell className="px-6 py-5 text-left table-cell-text-secondary">
                          {booking.client_name || "-"}
                        </TableCell>

                        <TableCell className="px-6 py-5 text-left table-cell-text-secondary">
                          {booking.host_name || "-"}
                        </TableCell>

                        <TableCell className="px-6 py-5 text-left table-cell-text-secondary">
                          {new Date(booking.fromdate * 1000).toLocaleDateString()} -{" "}
                          {new Date(booking.todate * 1000).toLocaleDateString()}
                        </TableCell>

                        <TableCell className="px-6 py-5 text-left table-cell-text-secondary">
                          {booking.guests}
                        </TableCell>

                        <TableCell className="px-6 py-5 text-left table-cell-text-secondary">
                          {booking.currencycode} {booking.total}
                        </TableCell>

                        <TableCell className="px-6 py-5 text-left table-cell-text-secondary">
                          {booking.bookstatus || "-"} / {booking.orderstatus || "-"}
                        </TableCell>

                        <TableCell className="px-6 py-5 text-left">
                          <button
                            onClick={() => router.push(`/bookings/${booking.id}/edit`)}
                            className="action-btn action-btn-edit inline-flex items-center gap-2 px-3 py-2 rounded-lg transition-all hover:bg-opacity-20"
                            style={{ color: 'var(--secondary)' }}
                          >
                            <Edit className="w-4 h-4" />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => openCancelModal(booking)}
                            className="action-btn action-btn-delete inline-flex items-center gap-2 px-3 py-2 rounded-lg transition-all hover:bg-opacity-20 ml-2"
                            style={{ color: '#ef4444' }}
                          >
                            <span>Cancel</span>
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
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                          </div>
                          <p className="text-lg font-medium mb-2 table-cell-text-primary">No bookings found</p>
                          <p className="text-sm table-cell-text-secondary">
                            {searchTerm ? "Try adjusting your search" : "New bookings will appear here"}
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

      {cancelOpen && cancelBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={closeCancelModal}
          />
          <div
            className="relative w-full max-w-md rounded-2xl border shadow-xl p-6"
            style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
          >
            <h2
              className="text-xl font-semibold mb-2"
              style={{ color: 'var(--text-primary)' }}
            >
              Cancel Reservation
            </h2>
            <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
              Booking #{cancelBooking.id} — Total: {cancelBooking.currencycode} {cancelBooking.total}
            </p>

            <label
              className="block text-sm font-semibold mb-2"
              style={{ color: 'var(--text-primary)' }}
            >
              Refund Amount
            </label>
            <input
              type="number"
              min={0}
              max={toNumber(cancelBooking.total)}
              step="0.01"
              value={refundAmount}
              onChange={(e) => setRefundAmount(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border-2 transition-all duration-200 table-cell-text-primary"
              style={{ background: 'var(--bg-light)', borderColor: 'var(--border)' }}
            />
            <p className="text-xs mt-2" style={{ color: 'var(--text-secondary)' }}>
              Max refund: {cancelBooking.currencycode} {cancelBooking.total}
            </p>

            {cancelError && (
              <div className="mt-3 p-3 rounded-lg bg-red-50">
                <p className="text-sm text-red-600">{cancelError}</p>
              </div>
            )}

            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => submitCancellation(false)}
                disabled={cancelLoading}
                className="w-full sm:w-1/2 px-4 py-3 rounded-lg font-semibold"
                style={{ background: 'var(--bg-light)', color: 'var(--text-primary)' }}
              >
                Cancel Only
              </button>
              <button
                onClick={() => submitCancellation(true)}
                disabled={cancelLoading}
                className="w-full sm:w-1/2 px-4 py-3 rounded-lg font-semibold"
                style={{ background: 'var(--secondary)', color: 'white' }}
              >
                Refund + Cancel
              </button>
            </div>

            <button
              onClick={closeCancelModal}
              className="mt-4 w-full text-sm underline"
              style={{ color: 'var(--text-secondary)' }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Bookings;