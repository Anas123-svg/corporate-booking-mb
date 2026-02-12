"use client";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import React, { useState } from 'react';
import ComponentCard from '@/components/common/ComponentCard';
import Label from '@/components/form/Label';
import Input from '@/components/form/input/InputField';
import ProfilePicUploader from "@/components/profilePicUploader";
import toast from "react-hot-toast";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

interface ValidationState {
  name: boolean;
  email: boolean;
  password: boolean;
  password_confirmation: boolean;
  phone: boolean;
  profileImage: boolean;
}

const CreateAdmin = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  type Admin = {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    phone: string;
    profileImage: string;
  };

  const [admin, setAdmin] = useState<Admin>({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
    phone: "",
    profileImage: "",
  });

  const [errors, setErrors] = useState<Partial<Record<keyof Admin, string>>>({});
  const [validation, setValidation] = useState<ValidationState>({
    name: false,
    email: false,
    password: false,
    password_confirmation: false,
    phone: false,
    profileImage: true,
  });

  const validateField = (name: keyof Admin, value: string): boolean => {
    let isValid = true;
    let errorMessage = "";

    if (name === "profileImage") {
      isValid = true;
      errorMessage = "";
    } else {
      switch (name) {
        case "email":
          isValid = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value);
          errorMessage = isValid ? "" : "Please enter a valid email address";
          break;
        case "password":
          isValid = value.length >= 8;
          errorMessage = isValid ? "" : "Password must be at least 8 characters";
          break;
        case "password_confirmation":
          isValid = value === admin.password;
          errorMessage = isValid ? "" : "Passwords do not match";
          break;
        case "phone":
          isValid = /^[\d\s+()-]+$/.test(value) && value.length >= 10;
          errorMessage = isValid ? "" : "Please enter a valid phone number";
          break;
        default:
          isValid = value.trim() !== "";
          errorMessage = isValid ? "" : `${name} is required`;
      }
    }

    setErrors(prev => ({ ...prev, [name]: errorMessage }));
    setValidation(prev => ({ ...prev, [name]: isValid }));
    return isValid;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setAdmin({
      ...admin,
      [name]: value,
    });
    validateField(name as keyof Admin, value);
  };

  const handleProfileImageChange = (photo: string) => {
    setAdmin({
      ...admin,
      profileImage: photo,
    });
    setValidation(prev => ({ ...prev, profileImage: true }));
  };

  const validateForm = (): boolean => {
    let isFormValid = true;
    const newValidation = { ...validation };
    const newErrors = { ...errors };

    Object.entries(admin).forEach(([key, value]) => {
      if (key === "profileImage") {
        newValidation.profileImage = true;
        return;
      }
      
      const fieldName = key as keyof Admin;
      const isFieldValid = validateField(fieldName, value);
      newValidation[fieldName] = isFieldValid;
      
      if (!isFieldValid) {
        isFormValid = false;
        newErrors[fieldName] = newErrors[fieldName] || `${fieldName} is required`;
      }
    });

    setValidation(newValidation);
    setErrors(newErrors);
    return isFormValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      try {
        setLoading(true);
        await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/admin/register`, admin);
        toast.success("Admin created successfully");
        router.push("/admins");
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 422) {
          toast.error("Validation error");
          if (error.response?.data?.errors) {
            const serverErrors = error.response.data.errors;
            const newErrors: Partial<Record<keyof Admin, string>> = {};
            const newValidation = {...validation};
            
            Object.keys(serverErrors).forEach((key) => {
              const fieldName = key as keyof Admin;
              newErrors[fieldName] = serverErrors[key][0];
              newValidation[fieldName] = false;
            });
            
            setErrors(newErrors);
            setValidation(newValidation);
          }
        } else {
          console.log("Error creating admin:", error);
          toast.error("Failed to create admin");
        }
      } finally {
        setLoading(false);
      }
    } else {
      toast.error("Form validation failed");
    }
  };

  return (
    <div>
      <PageBreadcrumb pageTitle="Add Admin" />
      <ComponentCard title="Admin Information" desc="Fill in all required fields to create a new admin.">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <div className="xl:col-span-2">
              <Label>Profile Picture (Optional)</Label>
              <ProfilePicUploader
                profilePic={admin.profileImage}
                onChange={handleProfileImageChange}
              />
            </div>
            
            <div>
              <Label>Name *</Label>
              <Input
                type="text"
                name="name"
                value={admin.name}
                onChange={handleChange}
                error={!validation.name && admin.name !== ""}
                success={validation.name && admin.name !== ""}
                placeholder="Jane Doe"
                hint={errors.name || ""}
              />
            </div>
            
            <div>
              <Label>Email *</Label>
              <Input
                type="email"
                name="email"
                value={admin.email}
                onChange={handleChange}
                error={!validation.email && admin.email !== ""}
                success={validation.email && admin.email !== ""}
                placeholder="admin@example.com"
                hint={errors.email || ""}
              />
            </div>
            
            <div>
              <Label>Phone Number *</Label>
              <Input
                type="tel"
                name="phone"
                value={admin.phone}
                onChange={handleChange}
                error={!validation.phone && admin.phone !== ""}
                success={validation.phone && admin.phone !== ""}
                placeholder="+1 234 567 8900"
                hint={errors.phone || ""}
              />
            </div>
            
            <div>
              <Label>Password *</Label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={admin.password}
                  onChange={handleChange}
                  error={!validation.password && admin.password !== ""}
                  success={validation.password && admin.password !== ""}
                  placeholder="Enter your password"
                  hint={errors.password || ""}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                >
                  {showConfirmPassword ? (
                    <Eye className="text-gray-500 dark:text-gray-400" />
                  ) : (
                    <EyeOff className="text-gray-500 dark:text-gray-400" />
                  )}
                </button>
              </div>
            </div>
            
            <div>
              <Label>Confirm Password *</Label>
              <div className="relative">
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  name="password_confirmation"
                  value={admin.password_confirmation}
                  onChange={handleChange}
                  error={!validation.password_confirmation && admin.password_confirmation !== ""}
                  success={validation.password_confirmation && admin.password_confirmation !== ""}
                  placeholder="Confirm your password"
                  hint={errors.password_confirmation || ""}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                >
                  {showConfirmPassword ? (
                    <Eye className="text-gray-500 dark:text-gray-400" />
                  ) : (
                    <EyeOff className="text-gray-500 dark:text-gray-400" />
                  )}
                </button>
              </div>
            </div>
            
            <div className="xl:col-span-2">
              <button
                disabled={loading}
                type="submit"
                className="px-4 py-2 text-white bg-red-500 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                {loading ? "Creating..." : "Create Admin"}
              </button>
            </div>
          </div>
        </form>
      </ComponentCard>
    </div>
  );
};

export default CreateAdmin;