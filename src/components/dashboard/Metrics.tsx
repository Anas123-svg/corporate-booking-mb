"use client";

import React, { useEffect, useState } from "react";
import { UsersRound, LayoutTemplate, BookText, Plus, Pencil, Trash2, X } from "lucide-react";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const Metrics = () => {
  const [stats, setStats] = useState<any>(null);
  const [currentClients, setCurrentClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [loginLogs, setLoginLogs] = useState<any[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(`${API_URL}/stat/admin`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          cache: "no-store",
        });

        const data = await res.json();

        if (data?.data) {
          setStats(data.data);
          setCurrentClients(data.data.clients || []);
        }
      } catch (error) {
        console.error("Stats API error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [API_URL]);

  // ✅ Fetch logs for client
  const openLogsModal = async (client: any) => {
    setSelectedClient(client);
    setShowModal(true);
    setLogsLoading(true);

    try {
      const res = await fetch(`${API_URL}/logs/client/${client.id}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();
      setLoginLogs(data?.data || []);
    } catch (error) {
      console.error("Logs API error:", error);
      setLoginLogs([]);
    } finally {
      setLogsLoading(false);
    }
  };

  return (
    <>
      {/* Metrics Section */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 md:gap-6">
        {[
          { label: "Clients", value: stats?.total_clients, Icon: UsersRound },
          { label: "Users", value: stats?.total_client_users, Icon: LayoutTemplate },
          { label: "Folders", value: stats?.total_site_folders, Icon: BookText },
        ].map(({ label, value, Icon }) => (
          <div key={label} className="rounded-2xl space-y-3 border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
            <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
              <Icon className="text-gray-800 dark:text-white/90" />
            </div>
            <h3 className="text-sm text-gray-500 dark:text-gray-400">{label}</h3>
            <h4 className="font-bold text-gray-800 text-title-sm dark:text-white/90">
              {loading ? "..." : value ?? 0}
            </h4>
          </div>
        ))}
      </div>

      {/* Clients Table */}
      <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">
          Latest Clients
        </h3>

        <div className="max-w-full overflow-x-auto">
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                <TableCell isHeader className="px-5 py-3 text-gray-500">Client</TableCell>
                <TableCell isHeader className="px-5 py-3 text-gray-500">Email</TableCell>
                <TableCell isHeader className="px-5 py-3 text-gray-500">Phone</TableCell>
                <TableCell isHeader className="px-5 py-3 text-gray-500">Last Login</TableCell>
                <TableCell isHeader className="px-5 py-3 text-gray-500">City</TableCell>
                <TableCell isHeader className="px-5 py-3 text-gray-500">Actions</TableCell>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {!loading && currentClients.length > 0 ? (
                currentClients.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          className="w-10 h-10 rounded-full"
                          src={client.profileImage || "/images/default-avatar.jpg"}
                          alt=""
                        />
                        <div>
                          <div className="font-medium text-gray-800">
                            {client.name} {client.surname}
                          </div>
                          <div className="text-xs text-gray-400">
                            Users: {client.users_count}
                          </div>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="px-4 py-3">{client.email}</TableCell>
                    <TableCell className="px-4 py-3">{client.phone ?? "-"}</TableCell>

                    <TableCell className="px-4 py-3">
                      {client.last_login?.logged_in_at ? (
                        <button
                          onClick={() => openLogsModal(client)}
                          className="px-3 py-1 text-xs font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700"
                        >
                          {client.last_login?.logged_in_at
                            ? new Date(client.last_login.logged_in_at).toISOString().split("T")[0]
                            : "-"}
                        </button>

                      ) : (
                        "-"
                      )}
                    </TableCell>

                    <TableCell className="px-4 py-3">{client.city ?? "-"}</TableCell>

                    <TableCell className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/clients/${client.id}/users`}
                          className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-xs"
                        >
                          <Plus className="w-3 h-3 mr-1" />
                          Add Users
                        </Link>

                        <Link
                          href={`/clients/edit/${client.id}`}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-full"
                        >
                          <Pencil className="w-4 h-4" />
                        </Link>

                        <button
                          onClick={() => alert(`Delete client ${client.id}`)}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-full"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                !loading && (
                  <TableRow>
                    <TableCell className="text-center py-6 text-gray-500">
                      No clients found
                    </TableCell>
                  </TableRow>
                )
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* ✅ Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white w-full max-w-2xl rounded-xl p-6 relative">
            <button
              onClick={() => {
                setShowModal(false);
                setLoginLogs([]);
                setSelectedClient(null);
              }}
              className="absolute top-3 right-3 text-gray-500 hover:text-red-500"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Login Logs — {selectedClient?.name} {selectedClient?.surname}
            </h3>

            {logsLoading ? (
              <p className="text-gray-500">Loading logs...</p>
            ) : loginLogs.length > 0 ? (
              <div className="max-h-96 overflow-y-auto border rounded-lg">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="p-2 text-left">IP</th>
                      <th className="p-2 text-left">User Agent</th>
                      <th className="p-2 text-left">Login Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loginLogs.map((log) => (
                      <tr key={log.id} className="border-t">
                        <td className="p-2">{log.ip_address}</td>
                        <td className="p-2 truncate max-w-[200px]">{log.user_agent}</td>
                        <td className="p-2">{log.logged_in_at}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500">No login logs found.</p>
            )}
          </div>
        </div>
      )}
    </>
  );
};
