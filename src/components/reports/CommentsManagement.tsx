"use client";
import { useState } from "react";
import { Upload, X, Plus, Loader2 } from "lucide-react";
import Image from "next/image";
import toast from "react-hot-toast";
import { uploadToCloudinary } from "@/utils/cloudinaryUpload";

interface CommentItem {
  area: string;
  text: string;
  imagePath?: string;
}

interface CommentsManagementProps {
  comments: CommentItem[];
  onCommentAdd: (comment: CommentItem) => void;
  onCommentUpdate: (index: number, comment: CommentItem) => void;
  onCommentDelete: (index: number) => void;
}

const CommentsManagement = ({
  comments,
  onCommentAdd,
  onCommentUpdate,
  onCommentDelete,
}: CommentsManagementProps) => {
  const [newComment, setNewComment] = useState<CommentItem>({
    area: "",
    text: "",
    imagePath: "",
  });
  const [uploadingImage, setUploadingImage] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    isNew: boolean = true,
    editIndex?: number
  ) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImage(true);

    try {
      const toastId = toast.loading("Uploading image...");
      const imageUrl = await uploadToCloudinary(files[0]);

      if (isNew) {
        setNewComment((prev) => ({ ...prev, imagePath: imageUrl }));
      } else if (editIndex !== undefined) {
        const updatedComment = { ...comments[editIndex], imagePath: imageUrl };
        onCommentUpdate(editIndex, updatedComment);
      }

      toast.success("Image uploaded successfully", { id: toastId });
      e.target.value = "";
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload image");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleAddComment = () => {
    if (!newComment.area.trim() || !newComment.text.trim()) {
      toast.error("Please fill in area and comment text");
      return;
    }

    onCommentAdd(newComment);
    setNewComment({ area: "", text: "", imagePath: "" });
    toast.success("Comment added successfully");
  };

  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
        Manage Comments
      </h3>

      {/* Add New Comment Section */}
      <div className="mb-6 p-5 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900">
        <h4 className="text-base font-semibold text-gray-800 dark:text-white mb-4">
          Add New Comment
        </h4>

        {/* Area Input */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Area
          </label>
          <input
            type="text"
            value={newComment.area}
            onChange={(e) =>
              setNewComment((prev) => ({ ...prev, area: e.target.value }))
            }
            placeholder="e.g., Kitchen, Bathroom, Main Hall"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
          />
        </div>

        {/* Comment Text */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Comment Details
          </label>
          <textarea
            value={newComment.text}
            onChange={(e) =>
              setNewComment((prev) => ({ ...prev, text: e.target.value }))
            }
            placeholder="Enter your comment details here..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
          />
        </div>

        {/* Image Upload */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Comment Image
          </label>
          <label className="flex items-center justify-center px-4 py-6 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-red-500 transition-colors dark:border-gray-600 dark:hover:border-red-500 bg-white dark:bg-gray-800">
            {uploadingImage ? (
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
                  Click to upload image
                </span>
              </>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleImageUpload(e, true)}
              disabled={uploadingImage}
              className="hidden"
            />
          </label>

          {/* Display Uploaded Image */}
          {newComment.imagePath && (
            <div className="mt-3 relative w-full h-48 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600">
              <Image
                src={newComment.imagePath}
                alt="Comment image"
                fill
                className="object-contain"
              />
              <button
                onClick={() =>
                  setNewComment((prev) => ({ ...prev, imagePath: "" }))
                }
                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded hover:bg-red-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Add Button */}
        <button
          onClick={handleAddComment}
          disabled={!newComment.area.trim() || !newComment.text.trim()}
          className="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Comment
        </button>
      </div>

      {/* Existing Comments */}
      {comments.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-base font-semibold text-gray-800 dark:text-white">
            Existing Comments ({comments.length})
          </h4>
          {comments.map((comment, index) => (
            <div
              key={index}
              className="p-5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
            >
              {/* Edit or View Mode */}
              {editingIndex === index ? (
                <>
                  {/* Edit Area */}
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Area
                    </label>
                    <input
                      type="text"
                      value={comment.area}
                      onChange={(e) => {
                        const updated = { ...comment, area: e.target.value };
                        onCommentUpdate(index, updated);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>

                  {/* Edit Comment */}
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Comment Details
                    </label>
                    <textarea
                      value={comment.text}
                      onChange={(e) => {
                        const updated = { ...comment, text: e.target.value };
                        onCommentUpdate(index, updated);
                      }}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>

                  {/* Edit Image */}
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Comment Image
                    </label>
                    <label className="flex items-center justify-center px-4 py-4 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-red-500 transition-colors dark:border-gray-600 dark:hover:border-red-500 bg-gray-50 dark:bg-gray-700">
                      {uploadingImage ? (
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
                            Click to update image
                          </span>
                        </>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, false, index)}
                        disabled={uploadingImage}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {/* Display Image */}
                  {comment.imagePath && (
                    <div className="mb-3 relative w-full h-48 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600">
                      <Image
                        src={comment.imagePath}
                        alt="Comment image"
                        fill
                        className="object-contain"
                      />
                      <button
                        onClick={() => {
                          const updated = { ...comment, imagePath: "" };
                          onCommentUpdate(index, updated);
                        }}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded hover:bg-red-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {/* Save/Cancel Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditingIndex(null)}
                      className="flex-1 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                    >
                      Done Editing
                    </button>
                    <button
                      onClick={() => {
                        onCommentDelete(index);
                        setEditingIndex(null);
                        toast.success("Comment deleted");
                      }}
                      className="flex-1 px-3 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors dark:bg-gray-700 dark:text-gray-300"
                    >
                      Delete
                    </button>
                  </div>
                </>
              ) : (
                <>
                  {/* View Mode */}
                  <div className="flex justify-between items-start mb-3 pb-3 border-b border-gray-200 dark:border-gray-700">
                    <h5 className="font-semibold text-gray-800 dark:text-white">
                      {comment.area}
                    </h5>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingIndex(index)}
                        className="text-blue-500 hover:text-blue-600 text-sm font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          onCommentDelete(index);
                          toast.success("Comment deleted");
                        }}
                        className="text-red-500 hover:text-red-600 text-sm font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  <p className="text-gray-700 dark:text-gray-300 mb-3 text-sm">
                    {comment.text}
                  </p>

                  {comment.imagePath && (
                    <div className="relative w-full h-48 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600">
                      <Image
                        src={comment.imagePath}
                        alt="Comment image"
                        fill
                        className="object-contain"
                      />
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {comments.length === 0 && editingIndex === null && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          No comments yet. Add one to get started!
        </div>
      )}
    </div>
  );
};

export default CommentsManagement;
