"use client";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import useAuthStore from "@/store/authStore";
import toast from "react-hot-toast";
import { Loader2, Save, X, Image as ImageIcon, Upload, Trash2 } from "lucide-react";
import Image from "next/image";
import SectionManagement from "@/components/reports/SectionManagement";
import CommentsManagement from "@/components/reports/CommentsManagement";

interface JobReport {
  id: number;
  report_name: string;
  job_id: number;
  form_data: Record<string, any>;
  layout: string;
  created_at: string;
  updated_at: string;
  job: {
    id: number;
    client_name: string;
    job_title: string;
    notes: string;
    on_site_date: string;
    on_site_time: string;
    status: string;
    due_on: string;
  };
}

interface CommentItem {
  area: string;
  text: string;
  imagePath?: string;
}

interface Section {
  title: string;
  questions: string[];
  images: string[];
  comments: string[];
  status: string;
}

const EditReport = () => {
  const params = useParams();
  const router = useRouter();
  const jobId = params.id as string;
  const reportId = params.reportId as string;
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [report, setReport] = useState<JobReport | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [uploadingInspection, setUploadingInspection] = useState<Record<string, boolean>>({});
  const [customSections, setCustomSections] = useState<string[]>([]);
  const [newComment, setNewComment] = useState<{ area: string; text: string; imagePath?: string }>({
    area: "",
    text: "",
    imagePath: "",
  });
  const [uploadingComment, setUploadingComment] = useState(false);
  const [uploadingBaseCommentImage, setUploadingBaseCommentImage] = useState<Record<number, boolean>>({});
  
  const { token } = useAuthStore();
  
  const fetchReport = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/job-reports/${reportId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setReport(response.data);
      setFormData(response.data.form_data || {});
    } catch (error) {
      console.log("Error fetching report:", error);
      toast.error("Error fetching report");
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (reportId) {
      fetchReport();
    }
  }, [reportId]);
  
  const handleInputChange = (key: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };
  
  const handleNestedChange = (parentKey: string, childKey: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [parentKey]: {
        ...(prev[parentKey] || {}),
        [childKey]: value,
      },
    }));
  };
  
  const handleArrayItemChange = (key: string, index: number, field: string, value: any) => {
    setFormData((prev) => {
      const array = [...(prev[key] || [])];
      array[index] = {
        ...array[index],
        [field]: value,
      };
      return {
        ...prev,
        [key]: array,
      };
    });
  };

  // Section Management Methods
  const handleAddCustomSection = (sectionName: string) => {
    setCustomSections((prev) => [...prev, sectionName]);
    setFormData((prev) => ({
      ...prev,
      inspectionSections: {
        ...(prev.inspectionSections || {}),
        [sectionName]: [sectionName], // Structure: "Test": ["Test"]
      },
    }));
  };

  const handleDeleteCustomSection = (sectionName: string) => {
    setCustomSections((prev) => prev.filter((s) => s !== sectionName));
    setFormData((prev) => {
      const sections = { ...(prev.inspectionSections || {}) };
      delete sections[sectionName];
      
      // Also clean up related data
      const sectionImages = { ...(prev.sectionImages || {}) };
      delete sectionImages[sectionName];
      
      const sectionComments = { ...(prev.sectionComments || {}) };
      delete sectionComments[sectionName];
      
      const sectionStatus = { ...(prev.sectionStatus || {}) };
      delete sectionStatus[sectionName];
      
      const sectionVisibility = { ...(prev.sectionVisibility || {}) };
      delete sectionVisibility[sectionName];
      
      return {
        ...prev,
        inspectionSections: sections,
        sectionImages,
        sectionComments,
        sectionStatus,
        sectionVisibility,
      };
    });
  };

  const handleSectionImageUpload = (
    sectionTitle: string,
    imageUrls: string[]
  ) => {
    handleNestedChange("sectionImages", sectionTitle, [
      ...(formData.sectionImages?.[sectionTitle] || []),
      ...imageUrls,
    ]);
  };

  const handleSectionImageRemove = (
    sectionTitle: string,
    imageIndex: number
  ) => {
    const images = [...(formData.sectionImages?.[sectionTitle] || [])];
    images.splice(imageIndex, 1);
    handleNestedChange("sectionImages", sectionTitle, images);
  };

  const handleSectionCommentAdd = (sectionTitle: string, comment: string) => {
    setFormData((prev) => ({
      ...prev,
      sectionComments: {
        ...(prev.sectionComments || {}),
        [sectionTitle]: [
          ...(prev.sectionComments?.[sectionTitle] || []),
          comment,
        ],
      },
    }));
  };

  const handleSectionCommentDelete = (
    sectionTitle: string,
    index: number
  ) => {
    const comments = [...(formData.sectionComments?.[sectionTitle] || [])];
    comments.splice(index, 1);
    handleNestedChange("sectionComments", sectionTitle, comments);
  };

  const handleSectionCommentUpdate = (
    sectionTitle: string,
    index: number,
    comment: string
  ) => {
    const comments = [...(formData.sectionComments?.[sectionTitle] || [])];
    comments[index] = comment;
    handleNestedChange("sectionComments", sectionTitle, comments);
  };

  const handleSectionStatusChange = (
    sectionTitle: string,
    status: string
  ) => {
    handleNestedChange("sectionStatus", sectionTitle, status);
  };

  const handleSectionVisibilityChange = (
    sectionTitle: string,
    visible: boolean
  ) => {
    handleNestedChange("sectionVisibility", sectionTitle, visible);
  };

  const handleSectionAnswerChange = (questionKey: string, answer: string) => {
    handleNestedChange("inspectionAnswers", questionKey, answer);
  };

  // Base Comments (inspection level) Methods
  const handleBaseCommentAdd = () => {
    if (!newComment.text.trim() && !newComment.area.trim()) {
      toast.error("Enter area or comment");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      comments: [
        ...(prev.comments || []),
        {
          area: newComment.area,
          text: newComment.text,
          imagePath: newComment.imagePath,
        },
      ],
    }));

    setNewComment({ area: "", text: "", imagePath: "" });
    toast.success("Comment added");
  };

  const handleBaseCommentImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingComment(true);
    try {
      const { uploadToCloudinary } = await import("@/utils/cloudinaryUpload");
      const toastId = toast.loading("Uploading image...");
      const url = await uploadToCloudinary(file);
      setNewComment((prev) => ({ ...prev, imagePath: url }));
      toast.success("Image uploaded", { id: toastId });
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload image");
    } finally {
      setUploadingComment(false);
      e.target.value = "";
    }
  };

  const handleBaseCommentImageReplace = async (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingBaseCommentImage((prev) => ({ ...prev, [index]: true }));
    try {
      const { uploadToCloudinary } = await import("@/utils/cloudinaryUpload");
      const toastId = toast.loading("Uploading image...");
      const url = await uploadToCloudinary(file);
      setFormData((prev) => {
        const updated = [...(prev.comments || [])];
        if (updated[index]) {
          updated[index] = { ...updated[index], imagePath: url };
        }
        return { ...prev, comments: updated };
      });
      toast.success("Image updated", { id: toastId });
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload image");
    } finally {
      setUploadingBaseCommentImage((prev) => ({ ...prev, [index]: false }));
      e.target.value = "";
    }
  };

  const handleBaseCommentImageRemove = (index: number) => {
    setFormData((prev) => {
      const updated = [...(prev.comments || [])];
      if (updated[index]) {
        updated[index] = { ...updated[index], imagePath: "" };
      }
      return { ...prev, comments: updated };
    });
  };

  const handleBaseCommentDelete = (index: number) => {
    setFormData((prev) => {
      const updated = [...(prev.comments || [])];
      updated.splice(index, 1);
      return { ...prev, comments: updated };
    });
  };

  // Comments Management Methods
  const handleAddComment = (comment: CommentItem) => {
    setFormData((prev) => ({
      ...prev,
      additionalComments: [
        ...(prev.additionalComments || []),
        comment,
      ],
    }));
  };

  const handleUpdateComment = (index: number, comment: CommentItem) => {
    setFormData((prev) => {
      const updated = [...(prev.additionalComments || [])];
      updated[index] = comment;
      return {
        ...prev,
        additionalComments: updated,
      };
    });
  };

  const handleDeleteComment = (index: number) => {
    setFormData((prev) => {
      const updated = [...(prev.additionalComments || [])];
      updated.splice(index, 1);
      return {
        ...prev,
        additionalComments: updated,
      };
    });
  };

  // Inspection Section Image Handlers
  const handleInspectionImageUpload = async (
    sectionTitle: string,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = e.target.files;
    if (!files) return;

    setUploadingInspection((prev) => ({ ...prev, [sectionTitle]: true }));

    try {
      const { uploadToCloudinary } = await import("@/utils/cloudinaryUpload");
      const fileArray = Array.from(files);
      const toastId = toast.loading("Uploading images...");

      const uploadedUrls = await Promise.all(
        fileArray.map((file) => uploadToCloudinary(file))
      );

      handleNestedChange("sectionImages", sectionTitle, [
        ...(formData.sectionImages?.[sectionTitle] || []),
        ...uploadedUrls,
      ]);
      toast.success(`${uploadedUrls.length} image(s) uploaded successfully`, {
        id: toastId,
      });

      e.target.value = "";
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload images");
    } finally {
      setUploadingInspection((prev) => ({ ...prev, [sectionTitle]: false }));
    }
  };

  const handleInspectionImageRemove = (
    sectionTitle: string,
    imageIndex: number
  ) => {
    const images = [...(formData.sectionImages?.[sectionTitle] || [])];
    images.splice(imageIndex, 1);
    handleNestedChange("sectionImages", sectionTitle, images);
  };
  
  const handleSave = async () => {
    try {
      setSaving(true);
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/job-reports/${reportId}`,
        {
          report_name: report?.report_name,
          form_data: formData,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success("Report updated successfully");
      router.push(`/app-jobs/${jobId}/reports`);
    } catch (error) {
      console.log("Error updating report:", error);
      toast.error("Error updating report");
    } finally {
      setSaving(false);
    }
  };
  
  const renderImageField = (label: string, imageUrl: string) => {
    if (!imageUrl) return null;
    
    return (
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {label} (Read-only)
        </label>
        <div className="relative w-full h-64 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
          <Image
            src={imageUrl}
            alt={label}
            fill
            className="object-contain"
          />
        </div>
      </div>
    );
  };
  
  const renderSignatureField = (label: string, signature: string) => {
    if (!signature) return null;
    
    // Check if it's already a data URI or just base64 string
    const isDataUri = signature.startsWith("data:image");
    const imageSrc = isDataUri ? signature : `data:image/png;base64,${signature}`;
    
    return (
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {label} (Read-only)
        </label>
        <div className="relative w-full h-32 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden border-2 border-gray-300 dark:border-gray-600">
          <img
            src={imageSrc}
            alt={label}
            className="w-full h-full object-contain"
          />
        </div>
      </div>
    );
  };
  
  const renderComments = () => {
    if (!formData.comments || !Array.isArray(formData.comments)) return null;
    
    return (
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
          Comments
        </h3>
        <div className="space-y-4">
          {formData.comments.map((comment: any, index: number) => (
            <div key={index} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Area
                </label>
                <input
                  type="text"
                  value={comment.area || ""}
                  onChange={(e) => handleArrayItemChange("comments", index, "area", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                />
              </div>
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Comment
                </label>
                <textarea
                  value={comment.text || ""}
                  onChange={(e) => handleArrayItemChange("comments", index, "text", e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                />
              </div>
              {comment.imagePath && (
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Image (Read-only)
                  </label>
                  <div className="relative w-full h-48 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                    <Image
                      src={comment.imagePath}
                      alt={`Comment ${index + 1}`}
                      fill
                      className="object-contain"
                    />
                  </div>
                </div>
              )}
              <div className="flex items-center gap-3 flex-wrap">
                <label className="flex items-center justify-center px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-red-500 transition-colors dark:border-gray-600 dark:hover:border-red-500 bg-white dark:bg-gray-700">
                  {uploadingBaseCommentImage[index] ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin text-red-500" />
                      <span className="text-sm text-gray-600 dark:text-gray-300">Uploading...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2 text-gray-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-300">Replace image</span>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleBaseCommentImageReplace(index, e)}
                    disabled={uploadingBaseCommentImage[index]}
                    className="hidden"
                  />
                </label>
                {comment.imagePath && (
                  <button
                    type="button"
                    onClick={() => handleBaseCommentImageRemove(index)}
                    className="px-3 py-2 text-sm text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Remove image
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleBaseCommentDelete(index)}
                  className="ml-auto inline-flex items-center px-3 py-2 text-sm text-white bg-red-500 rounded-lg hover:bg-red-600"
                >
                  Delete comment
                </button>
              </div>
            </div>
          ))}

          {/* Add new base comment */}
          <div className="p-4 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800">
            <h4 className="text-sm font-semibold text-gray-800 dark:text-white mb-3">Add Comment</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Area
                </label>
                <input
                  type="text"
                  value={newComment.area}
                  onChange={(e) => setNewComment((prev) => ({ ...prev, area: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Comment
                </label>
                <textarea
                  value={newComment.text}
                  onChange={(e) => setNewComment((prev) => ({ ...prev, text: e.target.value }))}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 mb-3 flex-wrap">
              <label
                className={`flex items-center justify-center px-4 py-2 border-2 border-dashed rounded-lg transition-colors bg-white dark:bg-gray-700 ${
                  newComment.imagePath
                    ? "border-gray-200 dark:border-gray-700 text-gray-400 cursor-not-allowed"
                    : "border-gray-300 dark:border-gray-600 hover:border-red-500 dark:hover:border-red-500 cursor-pointer"
                }`}
              >
                {uploadingComment ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin text-red-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-300">Uploading...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2 text-gray-400" />
                    <span className="text-sm text-gray-600 dark:text-gray-300">Attach image (1 max)</span>
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleBaseCommentImageUpload}
                  disabled={uploadingComment || !!newComment.imagePath}
                  className="hidden"
                />
              </label>
              {newComment.imagePath && (
                <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600">
                  <Image
                    src={newComment.imagePath}
                    alt="Comment attachment"
                    fill
                    className="object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setNewComment((prev) => ({ ...prev, imagePath: "" }))}
                    className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-50 transition-all flex items-center justify-center"
                    aria-label="Remove attached image"
                  >
                    <Trash2 className="w-4 h-4 text-white" />
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={handleBaseCommentAdd}
              className="inline-flex items-center px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
            >
              Add Comment
            </button>
          </div>
        </div>
      </div>
    );
  };

  
  if (loading) {
    return (
      <>
        <PageBreadcrumb pageTitle="Edit Report" />
        <div className="flex items-center justify-center h-64">
          <Loader2 className="animate-spin text-red-500" size={32} />
        </div>
      </>
    );
  }
  
  if (!report) {
    return (
      <>
        <PageBreadcrumb pageTitle="Edit Report" />
        <div className="text-center text-gray-500 dark:text-gray-400 py-8">
          Report not found
        </div>
      </>
    );
  }
  
  return (
    <>
      <PageBreadcrumb pageTitle={`Edit Report: ${report.report_name}`} />
      <div className="space-y-6">
        <ComponentCard title="Edit Report Details">
          <div className="p-6">
            {/* Basic Information */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                Basic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Client Name
                  </label>
                  <input
                    type="text"
                    value={formData.ClientName || ""}
                    onChange={(e) => handleInputChange("ClientName", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Site Address
                  </label>
                  <input
                    type="text"
                    value={formData.siteAddress || ""}
                    onChange={(e) => handleInputChange("siteAddress", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Safety Advisor Name
                  </label>
                  <input
                    type="text"
                    value={formData.SafetyAdvisorName || ""}
                    onChange={(e) => handleInputChange("SafetyAdvisorName", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Safety Advisor Approval Date
                  </label>
                  <input
                    type="date"
                    value={formData.safetyAdvisorApprovalDate || ""}
                    onChange={(e) => handleInputChange("safetyAdvisorApprovalDate", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Person in Control Name
                  </label>
                  <input
                    type="text"
                    value={formData.personInControlName || ""}
                    onChange={(e) => handleInputChange("personInControlName", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Person in Control Approval Date
                  </label>
                  <input
                    type="date"
                    value={formData.personInControlApprovalDate || ""}
                    onChange={(e) => handleInputChange("personInControlApprovalDate", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    General Comments
                  </label>
                  <textarea
                    value={formData.GeneralCommentsApprovalController || ""}
                    onChange={(e) => handleInputChange("GeneralCommentsApprovalController", e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                  />
                </div>
              </div>
            </div>
            
            {/* Cover Page Photo */}
            {formData.CoverPagePhoto && renderImageField("Cover Page Photo", formData.CoverPagePhoto)}
            
            {/* Signatures */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {formData.clientSignature && renderSignatureField("Client Signature", formData.clientSignature)}
              {formData.inspectorSignature && renderSignatureField("Inspector Signature", formData.inspectorSignature)}
            </div>
            
            {/* Inspection Sections with Add Capability */}
            <SectionManagement
              inspectionSections={formData.inspectionSections || {}}
              sectionImages={formData.sectionImages || {}}
              sectionComments={formData.sectionComments || {}}
              sectionStatus={formData.sectionStatus || {}}
              inspectionAnswers={formData.inspectionAnswers || {}}
              sectionVisibility={formData.sectionVisibility || {}}
              customSections={customSections}
              onAddCustomSection={handleAddCustomSection}
              onDeleteCustomSection={handleDeleteCustomSection}
              onImageUpload={handleSectionImageUpload}
              onImageRemove={handleSectionImageRemove}
              onCommentAdd={handleSectionCommentAdd}
              onCommentDelete={handleSectionCommentDelete}
              onCommentUpdate={handleSectionCommentUpdate}
              onStatusChange={handleSectionStatusChange}
              onVisibilityChange={handleSectionVisibilityChange}
              onAnswerChange={handleSectionAnswerChange}
            />
            
            {/* General Comments */}
            {renderComments()}


            
            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => router.push(`/app-jobs/${jobId}/reports`)}
                disabled={saving}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </ComponentCard>
      </div>
    </>
  );
};

export default EditReport;
