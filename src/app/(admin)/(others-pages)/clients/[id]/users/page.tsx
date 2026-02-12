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
import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Pencil, Plus, Trash2, Loader2, Users } from "lucide-react";
import Link from "next/link";
import axios from "axios";
import useAuthStore from "@/store/authStore";
import toast from "react-hot-toast";
import { useParams } from "next/navigation";
import { ClientUser } from "@/types";

const ClientUsers = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [clientUsers, setClientUsers] = useState<ClientUser[]>([]);
    const [clientInfo, setClientInfo] = useState<{ name?: string; surname?: string; email?: string } | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalEntries, setTotalEntries] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [loading, setLoading] = useState(false);
    const [roleFilter, setRoleFilter] = useState<"all" | "user" | "site_manager">("all");
    const [showFolderModal, setShowFolderModal] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
    const [userFolders, setUserFolders] = useState<any[]>([]);
    const [allFolders, setAllFolders] = useState<any[]>([]);
    const [selectedFolders, setSelectedFolders] = useState<number[]>([]);
    const [assigningView, setAssigningView] = useState(false);
    const [folderLoading, setFolderLoading] = useState(false);
    const itemsPerPage = 10;
    const params = useParams();
    const clientId = params.id; // this will get [id] from the URL

    const { token } = useAuthStore();

const fetchClientUsers = useCallback(async () => {
    if (!clientId) return <div>Loading client info...</div>;

    setLoading(true); // move here
    if (!clientId || !token) return;

    try {
        const response = await axios.get(
            `${process.env.NEXT_PUBLIC_API_URL}/clients/${clientId}/users`,
            {
                headers: { Authorization: `Bearer ${token}` },
            }
        );
        const usersArray = response.data.data || [];
        setClientUsers(usersArray);
        setTotalEntries(usersArray.length);
        setTotalPages(Math.ceil(usersArray.length / itemsPerPage));
        setClientInfo(response.data.client || null);
    } catch (error) {
        console.log("Error fetching clients:", error);
    } finally {
        setLoading(false);
    }
}, [clientId, token]);

    useEffect(() => {
          setLoading(true);

        fetchClientUsers();
    }, [fetchClientUsers]);
    
    const filteredClientUsers = clientUsers.filter((clientUser) => {
        const matchesText = `${clientUser.name} ${clientUser.surname}`
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) || clientUser.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = roleFilter === "all" || clientUser.role === roleFilter;
        return matchesText && matchesRole;
    });

    useEffect(() => {
        setTotalEntries(filteredClientUsers.length);
        setTotalPages(Math.ceil(filteredClientUsers.length / itemsPerPage));
    }, [filteredClientUsers]);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };

    const handleDeleteClientUser = async (id: number) => {
        if (confirm("Are you sure you want to delete this client user?")) {
            try {
                await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/client-users/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                toast.success("Client user deleted successfully");
                fetchClientUsers();
            } catch (error) {
                toast.error("Error deleting client user");
                console.log("Error deleting client user:", error);
            }
        }
    };

    const openFolderModal = async (userId: number) => {
        setSelectedUserId(userId);
        setShowFolderModal(true);
        setAssigningView(false);
        setSelectedFolders([]);
        setFolderLoading(true);
        try {
            const response = await axios.get(
                `${process.env.NEXT_PUBLIC_API_URL}/client-user/${userId}/folders`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setUserFolders(response.data.data || []);
        } catch (error) {
            console.error("Error fetching user folders:", error);
            toast.error("Error fetching user folders");
        } finally {
            setFolderLoading(false);
        }
    };

    const fetchAllFolders = async () => {
        setFolderLoading(true);
        try {
            const response = await axios.get(
                `${process.env.NEXT_PUBLIC_API_URL}/admin/folders/client/${clientId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setAllFolders(response.data || []);
        } catch (error) {
            console.error("Error fetching all folders:", error);
            toast.error("Error fetching folders");
        } finally {
            setFolderLoading(false);
        }
    };

    const handleAssignFolders = async () => {
        if (!selectedUserId || selectedFolders.length === 0) {
            toast.error("Please select at least one folder");
            return;
        }
        setFolderLoading(true);
        try {
            await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/client-user/folders/assign`,
                {
                    client_user_id: selectedUserId,
                    folders: selectedFolders,
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success("Folders assigned successfully");
            setShowFolderModal(false);
            setTimeout(() => openFolderModal(selectedUserId), 500);
        } catch (error) {
            console.error("Error assigning folders:", error);
            toast.error("Error assigning folders");
        } finally {
            setFolderLoading(false);
        }
    };

    const handleSelectFolder = (folderId: number) => {
        setSelectedFolders((prev) =>
            prev.includes(folderId)
                ? prev.filter((f) => f !== folderId)
                : [...prev, folderId]
        );
    };

    const handleDeleteAssignedFolder = async (folderId: number) => {
        if (!confirm("Are you sure you want to delete this folder assignment?")) {
            return;
        }
        setFolderLoading(true);
        try {
            await axios.delete(
                `${process.env.NEXT_PUBLIC_API_URL}/client-user/folder/${folderId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success("Folder assignment deleted successfully");
            if (selectedUserId) {
                setTimeout(() => openFolderModal(selectedUserId), 500);
            }
        } catch (error) {
            console.error("Error deleting folder assignment:", error);
            toast.error("Error deleting folder assignment");
        } finally {
            setFolderLoading(false);
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

    // Get current clients for pagination
    const indexOfLastClientUser = currentPage * itemsPerPage;
    const indexOfFirstClientUser = indexOfLastClientUser - itemsPerPage;
    const currentClientUsers = filteredClientUsers.slice(indexOfFirstClientUser, indexOfLastClientUser);

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
            <div className={`transition-all duration-200 ${showFolderModal ? 'blur-sm' : ''}`}>
                <PageBreadcrumb pageTitle={clientInfo ? `${clientInfo.name} ${clientInfo.surname}` : "Clients"} />
                {clientInfo && (
                    <div className="mb-4">
                        <div className="text-sm text-gray-600">Client</div>
                        <div className="text-lg font-semibold">{clientInfo.name} {clientInfo.surname}</div>
                        {clientInfo.email && <div className="text-sm text-gray-500">{clientInfo.email}</div>}
                    </div>
                )}
                <div className="space-y-6">
                <ComponentCard title="Clients Users Table">
                    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
                        <div className="flex flex-col gap-4 sm:flex-row justify-between items-start sm:items-center p-4 border-b border-gray-100 dark:border-white/[0.05]">
                            <div className="relative w-full sm:w-64">
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
                            <div className="flex items-center gap-3 w-full sm:w-auto">
                                <select
                                    value={roleFilter}
                                    onChange={(e) => setRoleFilter(e.target.value as "all" | "user" | "site_manager")}
                                    className="w-full sm:w-48 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                                >
                                    <option value="all">All roles</option>
                                    <option value="user">User</option>
                                    <option value="site_manager">Site Manager</option>
                                </select>
                                <Link
                                    href={`/clients/${clientId}/users/create`}
                                    className="inline-flex items-center px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors dark:bg-red-800 dark:hover:bg-red-700 dark:focus:ring-red-500"
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add Client User/site manager
                                </Link>
                            </div>
                        </div>
                        <div className="max-w-full overflow-x-auto">
                            <Table>
                                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                                    <TableRow>
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
                                            Role
                                        </TableCell>
                                        <TableCell
                                            isHeader
                                            className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                                        >
                                            City
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
                                    {currentClientUsers.length > 0 &&
                                        currentClientUsers.map((clientUser) => (
                                            <TableRow key={clientUser.id}>
                                                <TableCell className="px-5 py-4 sm:px-6 text-start">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 overflow-hidden rounded-full">
                                                            <img
                                                                width={40}
                                                                height={40}
                                                                src={clientUser.profileImage || "/images/default-avatar.jpg"}
                                                                alt={`${clientUser.name} ${clientUser.surname}`}
                                                            />
                                                        </div>
                                                        <div>
                                                            <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                                                                {clientUser.name} {clientUser.surname}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                                                    {clientUser.email}
                                                </TableCell>
                                                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                                                    {clientUser.phone}
                                                </TableCell>
                                                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400">
                                                        {clientUser.role?.replace('_', ' ') || 'user'}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                                                    {clientUser.city}
                                                </TableCell>
                                                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <button
                                                            onClick={() => openFolderModal(clientUser.id)}
                                                            className="px-2 py-1 text-xs text-white bg-red-500 hover:bg-red-700 rounded transition-colors dark:bg-red-600 dark:hover:bg-red-700"
                                                            title="Assign site folders"
                                                        >
                                                            Assign Folders
                                                        </button>
                                                        <Link
                                                            href={`/clients/${clientId}/users/edit/${clientUser.id}`}
                                                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-full transition-colors dark:text-red-400 dark:hover:bg-red-900/20"
                                                            title="Edit client user"
                                                        >
                                                            <Pencil className="w-4 h-4" />
                                                        </Link>
                                                        <button
                                                            onClick={() => handleDeleteClientUser(clientUser.id)}
                                                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-full transition-colors dark:text-red-400 dark:hover:bg-red-900/20"
                                                            title="Delete client user"
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
  ) : filteredClientUsers.length === 0 ? (
    <div className="px-5 py-4 text-center text-gray-500 dark:text-gray-400">
      No Users found.
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
            </div>

            {/* Folder Assignment Modal */}
            {showFolderModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                {assigningView ? "Select Folders to Assign" : "Site Folders"}
                            </h2>
                            <button
                                onClick={() => setShowFolderModal(false)}
                                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                            >
                                ✕
                            </button>
                        </div>

                        {folderLoading ? (
                            <div className="flex justify-center py-8">
                                <Loader2 className="animate-spin text-red-500" size={32} />
                            </div>
                        ) : !assigningView ? (
                            <>
                                {/* Current Folders View */}
                                <div className="mb-6">
                                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                                        Currently Assigned Folders
                                    </h3>
                                    {userFolders.length > 0 ? (
                                        <div className="space-y-2 mb-6">
                                            {userFolders.map((folder) => (
                                                <div
                                                    key={folder.id}
                                                    className="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-800 rounded-lg"
                                                >
                                                    <div className="flex-1">
                                                        <span className="text-gray-800 dark:text-gray-200">
                                                            {folder.folder_name}
                                                        </span>
                                                        <span className="text-xs text-gray-500 block">
                                                            ID: {folder.folder_id}
                                                        </span>
                                                    </div>
                                                    <button
                                                        onClick={() => handleDeleteAssignedFolder(folder.id)}
                                                        className="ml-3 p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
                                                        title="Delete folder assignment"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
                                            No folders assigned yet
                                        </p>
                                    )}
                                </div>

                                <button
                                    onClick={() => {
                                        setAssigningView(true);
                                        fetchAllFolders();
                                    }}
                                    className="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-700 transition-colors dark:bg-red-600 dark:hover:bg-red-700"
                                >
                                    Assign Folders
                                </button>
                            </>
                        ) : (
                            <>
                                {/* Assign Folders View */}
                                <div className="mb-6">
                                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                                        Available Folders
                                    </h3>
                                    <div className="space-y-2 max-h-96 overflow-y-auto">
                                        {allFolders.map((folder) => (
                                            <label
                                                key={folder.id}
                                                className="flex items-center p-3 bg-gray-100 dark:bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={selectedFolders.includes(folder.id)}
                                                    onChange={() => handleSelectFolder(folder.id)}
                                                    className="w-4 h-4 text-red-500 rounded cursor-pointer"
                                                />
                                                <span className="ml-3 text-gray-800 dark:text-gray-200">
                                                    {folder.name}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setAssigningView(false)}
                                        className="flex-1 px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-colors dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                                    >
                                        Back
                                    </button>
                                    <button
                                        onClick={handleAssignFolders}
                                        disabled={selectedFolders.length === 0}
                                        className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors dark:bg-red-600 dark:hover:bg-red-700"
                                    >
                                        {folderLoading ? "Assigning..." : "Assign"}
                                    </button>
                                                                </div>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </>
                                    );
                                };

export default ClientUsers;