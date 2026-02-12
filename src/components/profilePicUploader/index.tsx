import axios from "axios";
import { useState } from "react";
import toast from "react-hot-toast";
import imageCompression from "browser-image-compression";
const CLOUDINARY_UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "";
const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "";
const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

export default function ProfilePicUploader({
  profilePic,
  onChange,
}: {
  profilePic: string;
  onChange: (photo: string) => void;
}) {
  const [isUploading, setIsUploading] = useState(false);

  const uploadSingleImage = async (file: any) => {
    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

    const res = await axios.post(CLOUDINARY_UPLOAD_URL, data, {
      withCredentials: false,
    });

    return res.data.secure_url;
  };

  const compressImage = async (file: any) => {
    const options = {
      maxSizeMB: 0.5,
      maxWidthOrHeight: 1000,
      useWebWorker: true,
    };
    try {
      return await imageCompression(file, options);
    } catch (error) {
      console.error("Error occurred while compressing image", error);
      return file;
    }
  };

  const handleImageUpload = async (e: any) => {
    setIsUploading(true);
    try {
      const file = e.target.files[0];

      if (!file) {
        toast("No file selected");
        return;
      }

      if (file.size > 7 * 1024 * 1024) {
        throw new Error("File size should not exceed 7MB");
      }

      if (!file.type.startsWith("image/")) {
        throw new Error("Uploaded file is not an image");
      }

      const compressedFile = await compressImage(file);
      const url = await uploadSingleImage(compressedFile);

      toast("Profile picture uploaded successfully");
      onChange(url); // Update profile picture with the new URL
    } catch (error: any) {
      toast("Error uploading profile picture");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex justify-center items-center flex-col">
      {/* Profile Image */}
      <div className="relative w-32 h-32 mb-4">
        <img
          className="w-full h-full object-cover rounded-full border-4 border-gray-300"
          src={profilePic || "/images/default-avatar.jpg"}
          alt="Profile"
        />

        {/* Upload Button */}
        <label
          htmlFor="profilePic"
          className={`absolute bottom-0 right-0 bg-black bg-opacity-50 rounded-full p-2 cursor-pointer text-white ${
            isUploading ? "animate-pulse" : ""
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="h-6 w-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z"
            />
          </svg>
        </label>
      </div>

      {/* File Input for Profile Picture */}
      <input
        type="file"
        id="profilePic"
        accept="image/*"
        className="hidden"
        onChange={handleImageUpload}
        disabled={isUploading}
      />

      {/* Upload Status */}
      <div className="mt-2 text-lg text-gray-700 dark:text-gray-400 text-center">
        {isUploading ? "Uploading..." : "Select a profile picture"}
      </div>
    </div>
  );
}
