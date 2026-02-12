"use client";
import { useState } from "react";
import { Plus, Loader2, Trash2, Upload, X } from "lucide-react";
import Image from "next/image";
import toast from "react-hot-toast";
import { uploadToCloudinary } from "@/utils/cloudinaryUpload";

interface SectionManagementProps {
  inspectionSections: Record<string, string[]>;
  sectionImages?: Record<string, string[]>;
  sectionComments?: Record<string, string[]>;
  sectionStatus?: Record<string, string>;
  inspectionAnswers?: Record<string, string>;
  sectionVisibility?: Record<string, boolean>;
  customSections?: string[];
  onAddCustomSection: (sectionName: string) => void;
  onDeleteCustomSection: (sectionName: string) => void;
  onImageUpload: (sectionTitle: string, imageUrls: string[]) => void;
  onImageRemove: (sectionTitle: string, imageIndex: number) => void;
  onCommentAdd: (sectionTitle: string, comment: string) => void;
  onCommentDelete: (sectionTitle: string, index: number) => void;
  onCommentUpdate: (sectionTitle: string, index: number, comment: string) => void;
  onStatusChange: (sectionTitle: string, status: string) => void;
  onVisibilityChange: (sectionTitle: string, visible: boolean) => void;
  onAnswerChange: (questionKey: string, answer: string) => void;
}

const SectionManagement = ({
  inspectionSections,
  sectionImages = {},
  sectionComments = {},
  sectionStatus = {},
  inspectionAnswers = {},
  sectionVisibility = {},
  customSections = [],
  onAddCustomSection,
  onDeleteCustomSection,
  onImageUpload,
  onImageRemove,
  onCommentAdd,
  onCommentDelete,
  onCommentUpdate,
  onStatusChange,
  onVisibilityChange,
  onAnswerChange,
}: SectionManagementProps) => {
  const [showDialog, setShowDialog] = useState(false);
  const [sectionName, setSectionName] = useState("");
  const [uploading, setUploading] = useState<Record<string, boolean>>({});
  const [newComments, setNewComments] = useState<Record<string, string>>({});

  const handleAddSection = () => {
    if (!sectionName.trim()) {
      toast.error("Please enter a section name");
      return;
    }

    if (inspectionSections[sectionName]) {
      toast.error("Section already exists");
      return;
    }

    onAddCustomSection(sectionName);
    setSectionName("");
    setShowDialog(false);
    toast.success("Section added");
  };

  const handleImageUpload = async (
    sectionTitle: string,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = e.target.files;
    if (!files) return;

    setUploading((prev) => ({ ...prev, [sectionTitle]: true }));

    try {
      const fileArray = Array.from(files);
      const toastId = toast.loading("Uploading images...");

      const uploadedUrls = await Promise.all(
        fileArray.map((file) => uploadToCloudinary(file))
      );

      onImageUpload(sectionTitle, uploadedUrls);
      toast.success(`${uploadedUrls.length} image(s) uploaded successfully`, {
        id: toastId,
      });

      e.target.value = "";
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload images");
    } finally {
      setUploading((prev) => ({ ...prev, [sectionTitle]: false }));
    }
  };

  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
        Inspection Sections with Add Capability
      </h3>

      {/* All Inspection Sections */}
      {Object.entries(inspectionSections).length > 0 && (
        <div className="space-y-4 mb-6">
          {Object.entries(inspectionSections).map(([sectionTitle, questions]) => {
            const isCustom = customSections?.includes(sectionTitle);
            const isVisible = sectionVisibility?.[sectionTitle] ?? true;
            
            return (
              <div
                key={sectionTitle}
                className={`border border-gray-200 dark:border-gray-700 rounded-lg p-5 bg-white dark:bg-gray-800 ${
                  !isVisible ? 'opacity-50' : ''
                }`}
              >
                {/* Section Header */}
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200 dark:border-gray-700">
                  <h4 className="text-base font-semibold text-red-500 dark:text-red-400">
                    {sectionTitle}
                  </h4>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-600 dark:text-gray-300">
                      <input
                        type="checkbox"
                        checked={isVisible}
                        onChange={(e) => onVisibilityChange(sectionTitle, e.target.checked)}
                        className="w-4 h-4 text-red-500 rounded focus:ring-red-500"
                      />
                      <span>{isVisible ? "Visible" : "Hidden"}</span>
                    </label>
                    {isCustom && (
                      <button
                        onClick={() => {
                          onDeleteCustomSection(sectionTitle);
                          toast.success("Section deleted");
                        }}
                        className="text-gray-500 hover:text-red-500 transition-colors"
                        aria-label="Delete section"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Questions and Answers */}
                <div className="space-y-4 mb-4">
                  {Array.isArray(questions) && questions.map((question: string) => {
                    const questionKey = `${sectionTitle}|${question}`;
                    const answer = inspectionAnswers?.[questionKey] || "";
                    
                    return (
                      <div key={question} className="pb-3 border-b border-gray-100 dark:border-gray-700">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          {question}
                        </label>
                        <div className="flex gap-4">
                          {["Yes", "No", "N/A"].map((option) => (
                            <label key={option} className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="radio"
                                name={questionKey}
                                value={option}
                                checked={answer === option}
                                onChange={(e) => onAnswerChange(questionKey, e.target.value)}
                                className="w-4 h-4 text-red-500 focus:ring-red-500"
                              />
                              <span className="text-sm text-gray-600 dark:text-gray-400">{option}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Section Images */}
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Images
                  </label>
                  <div className="mb-3">
                    <label className="flex items-center justify-center px-4 py-6 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-red-500 transition-colors dark:border-gray-600 dark:hover:border-red-500 bg-gray-50 dark:bg-gray-700">
                      {uploading[sectionTitle] ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin text-red-500" />
                          <span className="text-sm text-gray-600 dark:text-gray-300">
                            Uploading...
                          </span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-5 h-5 mr-2 text-gray-400" />
                          <span className="text-sm text-gray-600 dark:text-gray-300">
                            Click to upload images
                          </span>
                        </>
                      )}
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={(e) => handleImageUpload(sectionTitle, e)}
                        disabled={uploading[sectionTitle]}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {/* Display Images */}
                  {sectionImages?.[sectionTitle] && sectionImages[sectionTitle].length > 0 && (
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {sectionImages[sectionTitle].map((imageUrl, index) => (
                        <div
                          key={index}
                          className="relative flex-shrink-0 w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600 group"
                        >
                          <Image
                            src={imageUrl}
                            alt={`${sectionTitle} - Image ${index + 1}`}
                            fill
                            className="object-cover"
                          />
                          <button
                            onClick={() => {
                              onImageRemove(sectionTitle, index);
                              toast.success("Image removed");
                            }}
                            className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                          >
                            <Trash2 className="w-4 h-4 text-white" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Section Comments */}
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Comments
                  </label>

                  {/* Display Existing Comments */}
                  {sectionComments?.[sectionTitle] && sectionComments[sectionTitle].length > 0 && (
                    <div className="space-y-2 mb-3">
                      {sectionComments[sectionTitle].map((comment, index) => (
                        <div
                          key={index}
                          className="flex items-start justify-between gap-2 p-2 bg-gray-50 dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600"
                        >
                          <p className="text-sm text-gray-700 dark:text-gray-300 flex-1">
                            {comment}
                          </p>
                          <button
                            onClick={() => {
                              onCommentDelete(sectionTitle, index);
                              toast.success("Comment deleted");
                            }}
                            className="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add New Comment */}
                  <div>
                    <textarea
                      value={newComments[sectionTitle] || ""}
                      onChange={(e) =>
                        setNewComments((prev) => ({
                          ...prev,
                          [sectionTitle]: e.target.value,
                        }))
                      }
                      placeholder="Add a comment..."
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm mb-2"
                    />
                    <button
                      onClick={() => {
                        if (newComments[sectionTitle]?.trim()) {
                          onCommentAdd(sectionTitle, newComments[sectionTitle]);
                          setNewComments((prev) => ({
                            ...prev,
                            [sectionTitle]: "",
                          }));
                          toast.success("Comment added");
                        }
                      }}
                      className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition-colors"
                    >
                      Add Comment
                    </button>
                  </div>
                </div>

                {/* Status Dropdown */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Status
                  </label>
                  <select
                    value={sectionStatus?.[sectionTitle] || ""}
                    onChange={(e) => onStatusChange(sectionTitle, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    <option value="">Select Status</option>
                    <option value="Red">🔴 Red - Immediate action required</option>
                    <option value="Amber">🟠 Amber - Action required</option>
                    <option value="Green">🟢 Green - Satisfactory</option>
                  </select>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Section Button (Floating Style) */}
      <div className="flex justify-center">
        <button
          onClick={() => setShowDialog(true)}
          className="inline-flex items-center px-6 py-3 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg hover:shadow-xl"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add New Section
        </button>
      </div>

      {/* Simple Dialog */}
      {showDialog && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowDialog(false)}
          />
          {/* Dialog */}
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-6 max-w-sm w-[90vw] z-50">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              Add New Section
            </h3>
            <input
              type="text"
              value={sectionName}
              onChange={(e) => setSectionName(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  handleAddSection();
                }
              }}
              placeholder="Enter section name..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white mb-4"
              autoFocus
            />
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowDialog(false);
                  setSectionName("");
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleAddSection}
                disabled={!sectionName.trim()}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SectionManagement;
