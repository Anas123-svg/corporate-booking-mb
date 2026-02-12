"use client";

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Pencil, Trash2, Search } from "lucide-react";

type Client = {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  phoneno?: string;
  city?: string;
  address1?: string;
};

const Clients = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchClients = async () => {
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
        const url = `${process.env.NEXT_PUBLIC_API_URL}/user/getbycorporatebookhostid/${corporate_book_host_id}`;
        console.log("Fetching clients from URL:", url);
        const res = await fetch(url, {
          method: "GET",
          headers: { "Content-Type": "application/json" }
        });
        console.log("Fetch response status:", res.status);
        const data = await res.json();
        console.log("Fetched clients response:", data);

        if (data.success && Array.isArray(data.clients)) {
          setClients(data.clients);
        } else {
          setClients([]);
        }
      } catch (err) {
        console.error("Error fetching clients:", err);
        setError("Failed to fetch clients");
        setClients([]);
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, []);

  const filteredClients = clients.filter((client) =>
  (`${client.firstname} ${client.lastname}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (client.email || "").toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleDelete = async (clientId: number) => {
    if (!confirm("Are you sure you want to delete this client?")) {
      return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/delete/${clientId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" }
      });

      if (!res.ok) {
        throw new Error(`Delete failed with status ${res.status}`);
      }

      const data = await res.json();
      console.log("Delete response:", data);

      // After successful deletion, remove from UI
      setClients(clients.filter(c => c.id !== clientId));
      alert("Client deleted successfully");
    } catch (err) {
      console.error("Error deleting client:", err);
      alert("Failed to delete client");
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

      {/* <PageBreadcrumb pageTitle="Clients" /> */}

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
  Your Clients
</h1>


            <p
              className="text-base md:text-lg"
              style={{ color: 'var(--text-secondary)' }}
            >
              View and manage your clients						</p>
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
            {/* Search and Add Button */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-6 border-b gap-4 table-cell-border">
              <div className="relative w-full sm:w-80">
                <input
                  type="text"
                  placeholder="Search clients..."
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

              <Link
                href="/clients/create"
                className="inline-flex items-center px-6 py-3.5 rounded-lg font-semibold text-base shadow-md hover:shadow-lg transition-all duration-200 w-full sm:w-auto justify-center"
                style={{ background: 'var(--secondary)', color: 'white' }}
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Client
              </Link>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="table-cell-border">
                    <TableCell isHeader className="px-6 py-4 font-semibold text-left playfair table-cell-header">
                      Name
                    </TableCell>
                    <TableCell isHeader className="px-6 py-4 font-semibold text-left playfair table-cell-header">
                      Email
                    </TableCell>
                    <TableCell isHeader className="px-6 py-4 font-semibold text-left playfair table-cell-header">
                      Phone Number
                    </TableCell>
                    <TableCell isHeader className="px-6 py-4 font-semibold text-left playfair table-cell-header">
                      City
                    </TableCell>
                    <TableCell isHeader className="px-6 py-4 font-semibold text-left playfair table-cell-header">
                      Address
                    </TableCell>
                    <TableCell isHeader className="px-6 py-4 font-semibold text-left playfair table-cell-header">
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {loading ? (
                    <TableRow>
                      <td colSpan={6} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mb-4 spinner-border"></div>
                          <p className="table-cell-text-secondary">Loading clients...</p>
                        </div>
                      </td>
                    </TableRow>
                  ) : filteredClients.length > 0 ? (
                    filteredClients.map((client, index) => (
                      <TableRow
                        key={client.id}
                        className="transition-colors hover:bg-opacity-50 table-cell-border"
                      >
                        <TableCell className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <img
                                src="https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png?20150327203541"
                                alt={`${client.firstname} ${client.lastname}`}
                                className="w-12 h-12 rounded-full object-cover border-2 avatar-border"
                              />
                              <div
                                className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 status-online"
                                title="Active"
                              ></div>
                            </div>
                            <span className="font-semibold text-base table-cell-text-primary">
                              {client.firstname} {client.lastname}
                            </span>
                          </div>
                        </TableCell>

                        <TableCell className="px-6 py-5 text-left table-cell-text-secondary">
                          {client.email}
                        </TableCell>

                        <TableCell className="px-6 py-5 text-left table-cell-text-secondary">
                          {client.phoneno || "-"}
                        </TableCell>

                        <TableCell className="px-6 py-5 text-left table-cell-text-secondary">
                          {client.city || "-"}
                        </TableCell>

                        <TableCell className="px-6 py-5 text-left table-cell-text-secondary">
                          {client.address1 || "-"}
                        </TableCell>

                        <TableCell className="px-6 py-5">
                          <div className="flex items-center gap-2">
                            <Link href={`/clients/edit/${client.id}`}>
                              <button
                                className="action-btn action-btn-edit p-2.5 rounded-lg transition-all duration-200"
                                title="Edit client"
                              >
                                <Pencil className="w-5 h-5" />
                              </button>
                            </Link>

                            <button
                              className="action-btn action-btn-delete p-2.5 rounded-lg transition-all duration-200"
                              onClick={() => handleDelete(client.id)}
                              title="Delete client"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <td colSpan={6} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4 empty-state-bg">
                            <svg className="w-8 h-8 empty-state-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                          </div>
                          <p className="text-lg font-medium mb-2 table-cell-text-primary">No clients found</p>
                          <p className="text-sm table-cell-text-secondary">
                            {searchTerm ? "Try adjusting your search" : "Get started by adding your first client"}
                          </p>
                        </div>
                      </td>
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

export default Clients;