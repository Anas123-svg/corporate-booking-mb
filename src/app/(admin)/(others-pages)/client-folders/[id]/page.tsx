"use client";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import axios from "axios";
import useAuthStore from "@/store/authStore";
import { useParams } from "next/navigation";
import ContextMenu from "@/components/common/ContextMenu";
import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import { useModal } from "@/hooks/useModal";
import toast from "react-hot-toast";

interface Folder {
    id: number,
   name: string,
}

const ClientFolders = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [folders, setFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(false);
  const {id} = useParams();
  const { isOpen, openModal, closeModal } = useModal();
  const [name, setName] = useState("");
  const [contextMenuVisible, setContextMenuVisible] = useState(false);
  const [xPos, setXPos] = useState(0);
  const [yPos, setYPos] = useState(0);
  const [contextMenuFolder, setContextMenuFolder] = useState<Folder | null>(null);

  const handleCloseMenu = () => {
    setContextMenuVisible(false);
  };
  
  const { token } = useAuthStore();
  
  const fetchFolders = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/admin/folders/client/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setFolders(response.data);
    } catch (error) {
      console.log("Error fetching folders:", error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchFolders();
  }, []);
  
  const filteredFolders = folders.filter((folder) =>
    folder.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSave = async (e:any) => {
    e.preventDefault();
    if(!name) {
      alert("Please enter a folder name");
      return;
    }
    try{
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/admin/folder/create`, {
        name,
        parentId: null,
        clientId: id,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      toast.success("Folder created successfully");
      setName("");
      fetchFolders();
    } catch (error) {
      toast.error("Error creating folder");
      console.log("Error creating folder:", error);
    } finally {
      closeModal();
    }
  };
  
  const handleDelete = async (id: number) => {
    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/folder/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      toast.success("Folder deleted successfully");
      fetchFolders();
    } catch (error) {
      toast.error("Error deleting folder");
      console.log("Error deleting folder:", error);
    }
  }



  return (
    <>
      <PageBreadcrumb pageTitle="Folders" />
      <div className="space-y-6">
        <ComponentCard title="Folders">
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 border-b border-gray-100 dark:border-white/[0.05]">
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="Search folders..."
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
            <div
              className="p-4"
              onContextMenu={(e) => {
                if ((e.target as HTMLElement).closest('[data-folder]') === null) {
                  e.preventDefault();
                  setXPos(e.clientX);
                  setYPos(e.clientY);
                  setContextMenuFolder(null);
                  setContextMenuVisible(true);
                }
              }}
            >
              {contextMenuVisible && (
                <ContextMenu xPos={xPos} yPos={yPos} onClose={handleCloseMenu}>
                  <ul>
                    {contextMenuFolder ? (
                      <li>
                        <button
                          onClick={() => {
                            handleDelete(contextMenuFolder.id);
                            handleCloseMenu();
                          }}
                          className="text-sm text-red-600 p-2 border shadow"
                        >
                          Delete Folder
                        </button>
                      </li>
                    ) : (
                      <li>
                        <button
                          onClick={() => {
                            openModal();
                            handleCloseMenu();
                          }}
                          className="text-sm text-gray-700 dark:text-gray-200 dark:bg-gray-900 p-2 border shadow"
                        >
                          Create Folder
                        </button>
                      </li>
                    )}
                  </ul>
                </ContextMenu>
              )}
              {loading ? (
                <div className="flex items-center justify-center h-32">
                  <Loader2 className="animate-spin text-red-500" size={24} />
                </div>
              ) :
                filteredFolders.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                    {filteredFolders.map((folder) => (
                      <Link
                        href={`/client-folders/${id}/folder/${folder.id}`}
                        key={folder.id}
                        data-folder
                        className="flex flex-col items-center justify-center p-4 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
                        onContextMenu={(e) => {
                          e.preventDefault();
                          setXPos(e.clientX);
                          setYPos(e.clientY);
                          setContextMenuFolder(folder);
                          setContextMenuVisible(true);
                        }}
                      >
                        <img
                          src="/images/folder.png"
                          alt="Folder"
                          className="w-16 h-16 mb-2"
                        />
                        <h3 className="text-center text-sm font-medium text-gray-800 dark:text-white truncate w-full">
                          {folder.name}
                        </h3>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div
                    className="py-8 text-center text-gray-500 dark:text-gray-400"
                    onContextMenu={(e) => {
                      e.preventDefault();
                      setXPos(e.clientX);
                      setYPos(e.clientY);
                      setContextMenuFolder(null);
                      setContextMenuVisible(true);
                    }}
                  >
                    No folders found.
                  </div>
                )}
            </div>
          </div>
          <Modal
        isOpen={isOpen}
        onClose={closeModal}
        className="max-w-[584px] p-5 lg:p-10"
      >
        <form 
        onSubmit={(e) => handleSave(e)}
        >
          <h4 className="mb-6 text-lg font-medium text-gray-800 dark:text-white/90">
            Create New Folder
          </h4>
            <div className="w-full">
              <Label>Folder Name</Label>
              <Input type="text" placeholder="e.g. Documents"
                value={name}
                onChange={(e) => setName(e.target.value)}
               />
            </div>
          <div className="flex items-center justify-end w-full gap-3 mt-6">
            <Button size="sm" variant="outline" onClick={closeModal}>
              Cancel
            </Button>
            <Button size="sm">
              Create Folder
            </Button>
          </div>
        </form>
      </Modal>
        </ComponentCard>
      </div>
    </>
  );
};

export default ClientFolders;