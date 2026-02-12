"use client";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import React, { useState, useEffect } from 'react';
import ComponentCard from '@/components/common/ComponentCard';
import Label from '@/components/form/Label';
import Input from '@/components/form/input/InputField';
import ProfilePicUploader from "@/components/profilePicUploader";
import toast from "react-hot-toast";
import axios from "axios";
import { useRouter, useParams } from "next/navigation";
import useAuthStore from "@/store/authStore";

interface ValidationState {
  name: boolean;
  email: boolean;
  phone: boolean;
  profileImage: boolean;
}

const EditAdmin = () => {
  const [loading, setLoading] = useState(false);
  const [fetchingAdmin, setFetchingAdmin] = useState(true);
  const router = useRouter();
  const {token} = useAuthStore();
  const {id} = useParams();
  
  type Admin = {
    id: number;
    name: string;
    email: string;
    phone: string;
    profileImage: string;
  };

  const [admin, setAdmin] = useState<Admin>({
    id: 0,
    name: "",
    email: "",
    phone: "",
    profileImage: "",
  });
  
  const [errors, setErrors] = useState<Partial<Record<keyof Admin, string>>>({});
  
  const [validation, setValidation] = useState<ValidationState>({
    name: false,
    email: false,
    phone: false,
    profileImage: true,
  });

  const fetchAdminData = async () => {
    try {
      setFetchingAdmin(true);
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/admin/${id}`,{
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const adminData = response.data;
      
      // Set admin data
      setAdmin({
        id: adminData.id || 0,
        name: adminData.name || "",
        email: adminData.email || "",
        phone: adminData.phone || "",
        profileImage: adminData.profileImage || "",
      });
      
      // Set validation state for fetched fields
      setValidation({
        ...validation,
        name: !!adminData.name,
        email: !!adminData.email,
        phone: !!adminData.phone,
        profileImage: true,
      });
    } catch (error) {
      console.error("Error fetching admin data:", error);
      toast.error("Failed to fetch admin data");
    } finally {
      setFetchingAdmin(false);
    }
  };

  useEffect(() => {
      fetchAdminData();
  }, [id]);

  const validateField = (name: keyof Admin, value: string): boolean => {
    let isValid = true;
    let errorMessage = "";
    
    if (name === "profileImage" || name === "id") {
      isValid = true;
      errorMessage = "";
    } else {
      switch (name) {
        case "email":
          isValid = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value);
          errorMessage = isValid ? "" : "Please enter a valid email address";
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
      const fieldName = key as keyof Admin;
      
      if (fieldName === "profileImage" || fieldName === "id") {
        return;
      }
      
      const isFieldValid = validateField(fieldName, String(value));
      if (fieldName in newValidation) {
        newValidation[fieldName as keyof ValidationState] = isFieldValid;
      }
      
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
        await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/admin/${id}`, admin, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        toast.success("Admin updated successfully");
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
              if (key in validation) {
                newErrors[fieldName] = serverErrors[key][0];
                newValidation[fieldName as keyof ValidationState] = false;
              }
            });
            
            setErrors(newErrors);
            setValidation(newValidation);
          }
        } else {
          console.error("Error updating admin:", error);
          toast.error("Failed to update admin");
        }
      } finally {
        setLoading(false);
      }
    } else {
      toast.error("Form validation failed");
    }
  };

  if (fetchingAdmin) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl">Loading admin data...</div>
      </div>
    );
  }

  return (
    <div>
      <PageBreadcrumb pageTitle="Edit Admin" />
      <ComponentCard title="Admin Information" desc="Update admin information as needed.">
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
                placeholder="John Doe" 
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
            
            <div className="xl:col-span-2">
              <button
                disabled={loading}
                type="submit"
                className="px-4 py-2 text-white bg-red-500 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                {loading ? "Updating..." : "Update Admin"}
              </button>
              <button
                type="button"
                onClick={() => router.push("/admins")}
                className="px-4 py-2 ml-4 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2"
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      </ComponentCard>
    </div>
  );
};

export default EditAdmin;