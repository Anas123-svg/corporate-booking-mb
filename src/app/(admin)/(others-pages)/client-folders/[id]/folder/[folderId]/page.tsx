"use client";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import axios from "axios";
import useAuthStore from "@/store/authStore";
import { useParams, useRouter } from "next/navigation";
import ContextMenu from "@/components/common/ContextMenu";
import { useModal } from "@/hooks/useModal";
import toast from "react-hot-toast";
import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import FileUploader from "@/components/uploader";

interface File {
  id: number;
  name: string;
  path: string;
  status?: 'pending' | 'completed';
  templateId?: number;
  built_in_portal?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface FolderContent {
  id: number;
  name: string;
  files: File[];
  subfolders: FolderContent[];
}
interface ContextMenuEvent extends React.MouseEvent<HTMLDivElement, MouseEvent> {}


const FolderContent = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [folder, setFolder] = useState<FolderContent | null>(null);
  const { folderId, id } = useParams();
  const router = useRouter();
  const { token } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const { isOpen, openModal, closeModal } = useModal();
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [modalType, setModalType] = useState("");
  const [contextMenuVisible, setContextMenuVisible] = useState(false);
  const [xPos, setXPos] = useState(0);
  const [yPos, setYPos] = useState(0);
  const [contextMenuTarget, setContextMenuTarget] = useState<{ type: 'folder' | 'file' | null, data: any }>({ type: null, data: null });
  const [templates, setTemplates] = useState<Array<any>>([]);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedTemplateIds, setSelectedTemplateIds] = useState<number[]>([]);
  const [assigningToFolderId, setAssigningToFolderId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'folders' | 'files' | 'completed' | 'pending' | 'assigned'>('all');
  
  // File viewing modal states
  const [viewingFile, setViewingFile] = useState<File | null>(null);
  const [viewingFileStatus, setViewingFileStatus] = useState<'pending' | 'completed' | null>(null);
  const [textPreview, setTextPreview] = useState<string | null>(null);
  const [textPreviewLoading, setTextPreviewLoading] = useState(false);
  const [modalUploadUrl, setModalUploadUrl] = useState("");
  const [modalUploadPublicId, setModalUploadPublicId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleContextMenu = (event: ContextMenuEvent) => {
    event.preventDefault();
    setXPos(event.clientX);
    setYPos(event.clientY);
    setContextMenuVisible(true);
  };

  const handleCloseMenu = () => {
    setContextMenuVisible(false);
  };

  const fetchFolderContent = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/folders/${folderId}/contents`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setFolder(response.data);
    } catch (error) {
      console.log("Error fetching folder content:", error);
    } finally {
      setLoading(false);
    }
  };

  const getFileIcon = (fileOrPath: any) => {
    if (fileOrPath && typeof fileOrPath === 'object') {
      const file = fileOrPath as any;
      if (file.built_in_portal || file.templateId) return '📝';
      const url = file.path;
      if (!url || typeof url !== 'string') return '📁';
      const extension = url.split('.').pop()?.toLowerCase();
      const iconMap: { [key: string]: string } = {
        jpg: '📷',
        jpeg: '📷',
        png: '📷',
        pdf: '📄',
        doc: '📝',
        docx: '📝',
        xls: '📊',
        xlsx: '📊',
      };
      return iconMap[extension || ''] || '📁';
    }

    const url = fileOrPath as string;
    if (typeof url !== 'string') return '📁';
    const extension = url.split('.').pop()?.toLowerCase();
    const iconMap: { [key: string]: string } = {
      jpg: '📷',
      jpeg: '📷',
      png: '📷',
      pdf: '📄',
      doc: '📝',
      docx: '📝',
      xls: '📊',
      xlsx: '📊',
    };
    return iconMap[extension || ''] || '📁';
  };
  
  useEffect(() => {
    fetchFolderContent();
  }, [folderId]);
  
  const filteredSubfolders = folder?.subfolders.filter((subfolder) =>
    subfolder.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];
  
  const filteredFiles = folder?.files.filter((file) =>
    file.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if(modalType === "folder") {
      handleCreateFolder();
    } else {
      handleCreateFile();
    }
  };

  const handleCreateFolder = async () => {
    if(!name) {
      alert("Please enter a folder name");
      return;
    }
    try{
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/admin/folder/create`, {
        name,
        parentId: folderId,
        clientId: id,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      toast.success("Folder created successfully");
      setName("");
      fetchFolderContent();
    } catch (error) {
      toast.error("Error creating folder");
      console.log("Error creating folder:", error);
    } finally {
      closeModal();
    }
  }

  const handleCreateFile = async () => {
    if(!name || !url) {
      alert("Please enter a file name and upload a file");
      return;
    }
    try{
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/admin/file/upload`, {
        name,
        path: url,
        folderId: folderId,
        clientId: id,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      toast.success("File created successfully");
      setName("");
      setUrl("");
      fetchFolderContent();
    } catch (error) {
      toast.error("Error creating file");
      console.log("Error creating file:", error);
    } finally {
      closeModal();
    }
  }
  
  const handleDeleteFolder = async (folderId: number) => {
    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/folder/${folderId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      toast.success("Folder deleted successfully");
      fetchFolderContent();
    } catch (error) {
      toast.error("Error deleting folder");
      console.log("Error deleting folder:", error);
    }
  };

  const handleDeleteFile = async (fileId: number) => {
    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/file/${fileId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      toast.success("File deleted successfully");
      fetchFolderContent();
    } catch (error) {
      toast.error("Error deleting file");
      console.log("Error deleting file:", error);
    }
  };

  const handleAssignTemplate = async () => {
    if (!selectedTemplateIds || selectedTemplateIds.length === 0 || !assigningToFolderId) {
      toast.error('Please select at least one template');
      return;
    }
    try {
      setLoading(true);
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/admin/file/upload`, {
        folderId: assigningToFolderId,
        name: 'Multiple Templates',
        path: 'No',
        clientId: id,
        status: 'pending',
        built_in_portal: true,
        templateId: selectedTemplateIds,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Templates assigned successfully');
      setAssignModalOpen(false);
      setSelectedTemplateIds([]);
      fetchFolderContent();
    } catch (err) {
      console.error('Assign template error', err);
      toast.error('Failed to assign templates');
    } finally {
      setLoading(false);
    }
  };

  // File modal functions
  const openFileModal = (file: File) => {
    setViewingFile(file);
    setViewingFileStatus(file.status || 'pending');
    setTextPreview(null);
    setTextPreviewLoading(false);
    setModalUploadUrl("");
    setModalUploadPublicId(null);
  };

  const closeFileModal = () => {
    setViewingFile(null);
    setViewingFileStatus(null);
    setTextPreview(null);
    setModalUploadUrl("");
    setModalUploadPublicId(null);
  };

  const statusBadge = (status?: string) => {
    if (status === 'completed') {
      return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border">Completed</span>;
    }
    return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border">Pending</span>;
  };

  const deleteCurrentFile = async () => {
    if (!viewingFile) return;
    if (!confirm('Are you sure you want to delete this file?')) return;
    await handleDeleteFile(viewingFile.id);
    closeFileModal();
  };

  const uploadNewVersion = async () => {
    if (!viewingFile || !modalUploadUrl) {
      toast.error('Please upload a file first');
      return;
    }
    try {
      setIsSaving(true);
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/admin/file/upload`, {
        name: `${viewingFile.name} (new version)`,
        path: modalUploadUrl,
        folderId: folderId,
        clientId: id,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('New version uploaded');
      closeFileModal();
      fetchFolderContent();
    } catch (error) {
      toast.error('Failed to upload new version');
    } finally {
      setIsSaving(false);
    }
  };

  const saveAsEdited = async () => {
    if (!viewingFile) return;
    try {
      setIsSaving(true);
      const updateData: any = {
        status: viewingFileStatus,
      };
      if (modalUploadUrl) {
        updateData.path = modalUploadUrl;
      }
      await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/file/${viewingFile.id}`, updateData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('File updated successfully');
      closeFileModal();
      fetchFolderContent();
    } catch (error) {
      toast.error('Failed to update file');
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileClick = (file: File) => {
    const hasTemplate = Boolean(file.templateId || file.built_in_portal);
    if (hasTemplate) {
      router.push(`/templates/edit?fileId=${encodeURIComponent(String(file.id))}`);
    } else {
      openFileModal(file);
    }
  };

  return (
    <>
      <PageBreadcrumb pageTitle={folder?.name || "Folder"} />
      <div className="space-y-6">
        <ComponentCard title="Folder Contents">
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 border-b border-gray-100 dark:border-white/[0.05]">
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="Search content..."
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
              <div className="mt-3 sm:mt-0 sm:ml-4 flex items-center gap-2">
                <button onClick={() => setActiveTab('all')} className={`px-3 py-1 rounded-full text-sm ${activeTab==='all' ? 'bg-red-500 text-white' : 'bg-white border border-gray-200 text-gray-700'}`}>All</button>
                <button onClick={() => setActiveTab('folders')} className={`px-3 py-1 rounded-full text-sm ${activeTab==='folders' ? 'bg-red-500 text-white' : 'bg-white border border-gray-200 text-gray-700'}`}>Folders</button>
                <button onClick={() => setActiveTab('files')} className={`px-3 py-1 rounded-full text-sm ${activeTab==='files' ? 'bg-red-500 text-white' : 'bg-white border border-gray-200 text-gray-700'}`}>Files</button>
                <button onClick={() => setActiveTab('assigned')} className={`px-3 py-1 rounded-full text-sm ${activeTab==='assigned' ? 'bg-red-500 text-white' : 'bg-white border border-gray-200 text-gray-700'}`}>Assigned</button>
                <button onClick={() => setActiveTab('completed')} className={`px-3 py-1 rounded-full text-sm ${activeTab==='completed' ? 'bg-red-500 text-white' : 'bg-white border border-gray-200 text-gray-700'}`}>Completed</button>
                <button onClick={() => setActiveTab('pending')} className={`px-3 py-1 rounded-full text-sm ${activeTab==='pending' ? 'bg-red-500 text-white' : 'bg-white border border-gray-200 text-gray-700'}`}>Pending</button>
              </div>
            </div>
            
            <div
              className="p-4"
              onContextMenu={(e) => {
                e.preventDefault();
                const el = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null;
                let folderEl = el ? el.closest('[data-folder]') : null;
                let fileEl = el ? el.closest('[data-file]') : null;
                if (!folderEl && !fileEl) {
                  folderEl = (e.target as HTMLElement).closest('[data-folder]');
                  fileEl = (e.target as HTMLElement).closest('[data-file]');
                }
                setXPos(e.clientX);
                setYPos(e.clientY);
                if (folderEl) {
                  setContextMenuTarget({ type: 'folder', data: JSON.parse(folderEl.getAttribute('data-folder')!) });
                } else if (fileEl) {
                  setContextMenuTarget({ type: 'file', data: JSON.parse(fileEl.getAttribute('data-file')!) });
                } else {
                  setContextMenuTarget({ type: null, data: null });
                }
                setContextMenuVisible(true);
              }}
            >
              {contextMenuVisible && (
                <ContextMenu xPos={xPos} yPos={yPos} onClose={handleCloseMenu}>
                  <ul className="border shadow text-sm text-gray-700 dark:text-gray-200 dark:bg-gray-900">
                    {contextMenuTarget.type === 'folder' ? (
                      <>
                        <li>
                          {/* <button
                            className="p-2"
                            onClick={async () => {
                              try {
                                setAssigningToFolderId(contextMenuTarget.data.id);
                                setAssignModalOpen(true);
                                const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/templates`, { headers: { Authorization: `Bearer ${token}` } });
                                setTemplates(res.data || []);
                              } catch (err) {
                                console.error('Failed to fetch templates', err);
                                toast.error('Failed to load templates');
                              }
                              handleCloseMenu();
                            }}
                          >
                            Assign Template
                          </button> */}
                        </li>
                        <li>
                          <button
                            className="p-2 text-red-600"
                            onClick={() => {
                              handleDeleteFolder(contextMenuTarget.data.id);
                              handleCloseMenu();
                            }}
                          >
                            Delete Folder
                          </button>
                        </li>
                      </>
                    ) : contextMenuTarget.type === 'file' ? (
                      <>
                        <li>
                          <button
                            className="p-2 text-red-600"
                            onClick={() => {
                              handleDeleteFile(contextMenuTarget.data.id);
                              handleCloseMenu();
                            }}
                          >
                            Delete File
                          </button>
                        </li>
                        <li>
                          {/* <button
                            className="p-2"
                            onClick={async () => {
                              try {
                                setAssigningToFolderId(Number(folderId));
                                setAssignModalOpen(true);
                                const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/templates`, { headers: { Authorization: `Bearer ${token}` } });
                                setTemplates(res.data || []);
                              } catch (err) {
                                console.error('Failed to fetch templates', err);
                                toast.error('Failed to load templates');
                              }
                              handleCloseMenu();
                            }}
                          >
                            Assign Template
                          </button> */}
                        </li>
                      </>
                    ) : (
                      <>
                        <li>
                          <button
                            className="p-2"
                            onClick={() => {
                              setModalType("folder");
                              openModal();
                              handleCloseMenu();
                            }}
                          >
                            Create Folder
                          </button>
                        </li>
                        <li>
                          <button
                            className="p-2"
                            onClick={async () => {
                              try {
                                setAssigningToFolderId(Number(folderId));
                                setAssignModalOpen(true);
                                const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/templates`, { headers: { Authorization: `Bearer ${token}` } });
                                setTemplates(res.data || []);
                              } catch (err) {
                                console.error('Failed to fetch templates', err);
                                toast.error('Failed to load templates');
                              }
                              handleCloseMenu();
                            }}
                          >
                            Assign Template
                          </button>
                        </li>
                        <hr />
                        <li>
                          <button
                            className="p-2"
                            onClick={() => {
                              setModalType("file");
                              openModal();
                              handleCloseMenu();
                            }}
                          >
                            Create File
                          </button>
                        </li>
                      </>
                    )}
                  </ul>
                </ContextMenu>
              )}
              {loading ? (
                <div className="flex items-center justify-center h-32">
                  <Loader2 className="animate-spin text-red-500" size={24} />
                </div>
              ) : (
                <div>
                  {(activeTab === 'all' || activeTab === 'folders') && (
                    <div className="space-y-3">
                      {filteredSubfolders.length === 0 ? null : (
                        <div>
                          <h4 className="text-sm font-medium text-gray-600 mb-2">Folders</h4>
                          <div className="bg-white border rounded divide-y">
                            {filteredSubfolders.map((subfolder) => (
                              <Link
                                href={`/client-folders/${id}/folder/${subfolder.id}`}
                                key={`folder-${subfolder.id}`}
                                data-folder={JSON.stringify(subfolder)}
                                className="flex items-center gap-4 p-4 hover:bg-gray-50 rounded transition-colors"
                              >
                                <img src="/images/folder.png" alt="Folder" className="w-10 h-10" />
                                <div className="flex-1">
                                  <div className="text-sm font-medium text-gray-800">{subfolder.name}</div>
                                </div>
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {(activeTab === 'all' || activeTab === 'files' || activeTab === 'completed' || activeTab === 'pending' || activeTab === 'assigned') && (
                    <div className="mt-6">
                      <h4 className="text-sm font-medium text-gray-600 mb-2">Files</h4>
                      <div className="bg-white border rounded divide-y">
                        {filteredFiles.filter(file => {
                          const status = file.status;
                          const hasTemplate = Boolean(file.templateId || file.built_in_portal);
                          if (activeTab === 'files') return true;
                          if (activeTab === 'completed') return status === 'completed';
                          if (activeTab === 'pending') return status === null || status === undefined || status === 'pending';
                          if (activeTab === 'assigned') return hasTemplate;
                          return true;
                        }).length === 0 ? (
                          <div className="p-4 text-sm text-gray-500">No files found.</div>
                        ) : (
                          filteredFiles.filter(file => {
                            const status = file.status;
                            const hasTemplate = Boolean(file.templateId || file.built_in_portal);
                            if (activeTab === 'files') return true;
                            if (activeTab === 'completed') return status === 'completed';
                            if (activeTab === 'pending') return status === null || status === undefined || status === 'pending';
                            if (activeTab === 'assigned') return hasTemplate;
                            return true;
                          }).map((file) => (
                            <div 
                              key={`file-${file.id}`} 
                              data-file={JSON.stringify(file)} 
                              className="flex items-center justify-between p-4 hover:bg-gray-50 cursor-pointer" 
                              onClick={() => handleFileClick(file)}
                            >
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 flex items-center justify-center bg-gray-50 rounded">
                                  {file.path && (file.path.split(".").pop()?.toLowerCase() === "jpg" || file.path.split(".").pop()?.toLowerCase() === "jpeg" || file.path.split(".").pop()?.toLowerCase() === "png") ? (
                                    <img src={file.path} alt={file.name} className="w-8 h-8 object-cover" />
                                  ) : (
                                    <span className="text-2xl">{getFileIcon(file)}</span>
                                  )}
                                </div>
                                <div>
                                  <div className="text-sm font-medium text-gray-800">{file.name}</div>
                                  <div className="text-xs text-gray-500">Created: {file.createdAt || ''} • Updated: {file.updatedAt || ''}</div>
                                </div>
                              </div>
                              <div>
                                {file.status ? (
                                  <span className={`inline-block px-3 py-1 rounded-full text-xs ${file.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : file.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>{file.status}</span>
                                ) : (
                                  <span className="inline-block px-3 py-1 rounded-full text-xs bg-yellow-100 text-yellow-700">Pending</span>
                                )}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Create Folder/File Modal */}
          <Modal
            isOpen={isOpen}
            onClose={closeModal}
            className="max-w-[584px] p-5 lg:p-10"
          >
            <form onSubmit={(e) => handleSave(e)}>
              <h4 className="mb-6 text-lg font-medium text-gray-800 dark:text-white/90">
                Create New {modalType === "folder" ? "Folder" : "File"}
              </h4>
              <div className="w-full">
                <Label>{modalType === "folder" ? "Folder" : "File"} Name</Label>
                <Input 
                  type="text" 
                  placeholder={`e.g. ${modalType === "folder" ? "Documents" : "Document"}`}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              {modalType === "file" && (
                <FileUploader 
                  addedFile={url} 
                  onChange={(fileUrl) => setUrl(fileUrl)} 
                />
              )}
              <div className="flex items-center justify-end w-full gap-3 mt-6">
                <Button size="sm" variant="outline" onClick={closeModal}>
                  Cancel
                </Button>
                <Button size="sm">
                  Create {modalType === "folder" ? "Folder" : "File"}
                </Button>
              </div>
            </form>
          </Modal>

          {/* Assign Template Modal */}
          <Modal
            isOpen={assignModalOpen}
            onClose={() => setAssignModalOpen(false)}
            className="max-w-[584px] p-5 lg:p-10"
          >
            <h4 className="mb-4 text-lg font-medium">Assign Templates</h4>
            {templates.length === 0 ? (
              <div className="py-6 text-center">No templates available.</div>
            ) : (
              <div>
                <label className="block text-sm mb-4 font-medium">Select Templates (Multiple)</label>
                <div className="mb-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedTemplateIds.length === templates.length}
                      onChange={e => {
                        if (e.target.checked) {
                          setSelectedTemplateIds(templates.map(t => t.id));
                        } else {
                          setSelectedTemplateIds([]);
                        }
                      }}
                      className="w-4 h-4 cursor-pointer"
                    />
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">Select All</span>
                  </label>
                </div>
                <div className="space-y-3 max-h-96 overflow-y-auto border rounded p-4 bg-gray-50 dark:bg-gray-800">
                  {templates.map((t: any) => (
                    <label key={t.id} className="flex items-center gap-3 cursor-pointer hover:bg-white dark:hover:bg-gray-700 p-2 rounded transition">
                      <input
                        type="checkbox"
                        checked={selectedTemplateIds.includes(t.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedTemplateIds([...selectedTemplateIds, t.id]);
                          } else {
                            setSelectedTemplateIds(selectedTemplateIds.filter(id => id !== t.id));
                          }
                        }}
                        className="w-4 h-4 cursor-pointer"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-200">{t.name || t.title || `Template ${t.id}`}</span>
                    </label>
                  ))}
                </div>
                {selectedTemplateIds.length > 0 && (
                  <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                    {selectedTemplateIds.length} template(s) selected
                  </div>
                )}
                <div className="flex items-center justify-end gap-2 mt-6">
                  <Button size="sm" variant="outline" onClick={() => {
                    setAssignModalOpen(false);
                    setSelectedTemplateIds([]);
                  }}>Cancel</Button>
                  <Button size="sm" onClick={handleAssignTemplate} disabled={selectedTemplateIds.length === 0}>Assign Risk Assessment</Button>
                </div>
              </div>
            )}
          </Modal>

          {/* File Viewer Modal */}
          <Modal
            isOpen={!!viewingFile}
            onClose={closeFileModal}
            className="max-w-3xl p-4 lg:p-6 max-h-[80vh] overflow-y-auto"
          >
            {viewingFile && (
              <div>
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <h4 className="mb-4 text-lg font-medium text-gray-800 dark:text-white">{viewingFile.name}</h4>
                  <div className="flex items-center gap-3">
                    <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${viewingFileStatus === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'} border`}>
                      {viewingFileStatus === 'completed' ? 'Completed' : 'Pending'}
                    </div>
                    <label className="sr-only" htmlFor="file-status-select">Change file status</label>
                    <select
                      id="file-status-select"
                      aria-label="File status"
                      value={viewingFileStatus ?? 'pending'}
                      onChange={(e) => setViewingFileStatus(e.target.value as any)}
                      className="text-sm border rounded px-2 py-1 bg-white dark:bg-gray-800 dark:border-gray-700"
                    >
                      <option value="pending">Set Pending</option>
                      <option value="completed">Set Completed</option>
                    </select>
                  </div>
                </div>
                <div className="mb-4">
                  {/* Preview: handle many types (images, pdf, office docs, text files) */}
                  {(() => {
                    const url = viewingFile.path || '';
                    const ext = url.split('.').pop()?.toLowerCase() || '';

                    // Images
                    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext)) {
                      return <img src={url} alt={viewingFile.name} className="w-full max-h-[50vh] object-contain" />;
                    }

                    // PDF - display directly
                    if (ext === 'pdf') {
                      return <iframe src={url} className="w-full h-[50vh] max-h-[60vh] border" />;
                    }

                    // Office documents - use Microsoft Office viewer (works with public URLs)
                    if (['doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx'].includes(ext)) {
                      const officeViewer = `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(url)}`;
                      return (
                        <div>
                          <iframe src={officeViewer} className="w-full h-[50vh] max-h-[60vh] border" />
                          <div className="mt-2">
                            <a href={officeViewer} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600">Open in Office Viewer</a>
                          </div>
                        </div>
                      );
                    }

                    // Plain text / csv / json / md / xml / html - try fetching and showing
                    if (['txt', 'csv', 'json', 'md', 'xml', 'html'].includes(ext)) {
                      if (textPreviewLoading) return <div className="text-sm text-gray-500">Loading preview...</div>;
                      if (textPreview != null) return <pre className="max-h-[50vh] overflow-auto bg-gray-50 p-3 border rounded text-sm">{textPreview}</pre>;
                      // initiate fetch
                      (async () => {
                        try {
                          setTextPreviewLoading(true);
                          const r = await fetch(url);
                          const txt = await r.text();
                          setTextPreview(txt.slice(0, 200000));
                        } catch (e) {
                          setTextPreview('Preview not available');
                        } finally {
                          setTextPreviewLoading(false);
                        }
                      })();
                      return <div className="text-sm text-gray-500">Loading preview...</div>;
                    }

                    // fallback: not previewable inline
                    return <div className="p-6 border rounded text-center">Preview not available. You can download or open this file in a new tab.</div>;
                  })()}
                </div>

                {/* Download current file */}
                <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
                  <p className="text-sm text-blue-800 dark:text-blue-200 mb-2">
                    <strong>To edit this file:</strong>
                  </p>
                  <ol className="text-sm text-blue-700 dark:text-blue-300 space-y-1 ml-4 list-decimal">
                    <li>Download the file using the button below</li>
                    <li>Edit it on your computer</li>
                    <li>Upload the edited version below</li>
                    <li>Click "Save as edited" to replace the original</li>
                  </ol>
                  <a
                    href={viewingFile.path}
                    download={viewingFile.name}
                    className="inline-block mt-2 px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                  >
                    📥 Download Current File
                  </a>
                  {/* Show current status under the download button for clarity and allow changing it inline */}
                  <div className="mt-3">
                    <div className="text-xs text-gray-500 mb-1">Current status</div>
                    <div className="flex items-center gap-3">
                      <div>{statusBadge(viewingFileStatus ?? viewingFile.status)}</div>
                      <select
                        aria-label="Change file status inline"
                        value={viewingFileStatus ?? viewingFile.status ?? 'pending'}
                        onChange={(e) => setViewingFileStatus(e.target.value as any)}
                        className="text-sm border rounded px-2 py-1 bg-white dark:bg-gray-800 dark:border-gray-700"
                      >
                        <option value="pending">Pending</option>
                        <option value="completed">Completed</option>
                      </select>
                      <div className="text-xs text-gray-400">(changes saved when you click Save)</div>
                    </div>
                  </div>
                </div>
                <Label>Upload Edited File</Label>
                <FileUploader 
                  addedFile={modalUploadUrl} 
                  onChange={(u: string, publicId?: string) => { 
                    setModalUploadUrl(u); 
                    setModalUploadPublicId(publicId || null); 
                  }} 
                />
                <div className="flex justify-between items-center gap-2 mt-4">
                  <div>
                    <button onClick={deleteCurrentFile} className="px-3 py-1 text-sm text-red-600 border rounded">Delete</button>
                  </div>
                  <div className="flex">
                    <button onClick={closeFileModal} className="px-4 py-2 border rounded text-sm">Cancel</button>
                    <button onClick={uploadNewVersion} disabled={isSaving} className="px-4 py-2 bg-gray-100 rounded text-sm ml-2 disabled:opacity-60">Upload new version</button>
                    <button onClick={saveAsEdited} disabled={isSaving} className="px-4 py-2 bg-red-500 text-white rounded text-sm ml-2 disabled:opacity-60">{isSaving ? 'Saving...' : 'Save as edited'}</button>
                  </div>
                </div>
              </div>
            )}
          </Modal>
        </ComponentCard>
      </div>
    </>
  );
};

export default FolderContent;