"use client";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import React, { useState } from 'react';
import ComponentCard from '@/components/common/ComponentCard';
import Label from '@/components/form/Label';
import Input from '@/components/form/input/InputField';

import ProfilePicUploader from "@/components/profilePicUploader";
import toast from "react-hot-toast";
import axios from "axios";
import { useRouter, useParams } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

interface ValidationState {
  name: boolean;
  surname: boolean;
  email: boolean;
  password: boolean;
  password_confirmation: boolean;
  phone: boolean;
  country: boolean;
  city: boolean;
  notes: boolean;
  profileImage: boolean;
  role: boolean;
}

const CreateClientUser = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const params = useParams();
  const clientId = params.id;
  
  type Client = {
    name: string;
    surname: string;
    email: string;
    password: string;
    password_confirmation: string;
    phone: string;
    country: string;
    city: string;
    notes: string;
    profileImage: string;
    role: string;
  };

  const [client, setClient] = useState<Client>({
    name: "",
    surname: "",
    email: "",
    password: "",
    password_confirmation: "",
    phone: "",
    country: "",
    city: "",
    notes: "",
    profileImage: "",
    role: "user",
  });
  
  const [errors, setErrors] = useState<Partial<Record<keyof Client, string>>>({});
  
  const [validation, setValidation] = useState<ValidationState>({
    name: false,
    surname: false,
    email: false,
    password: false,
    password_confirmation: false,
    phone: false,
    country: false,
    city: false,
    notes: false,
    profileImage: true,
    role: true,
  });

  const validateField = (name: keyof Client, value: string): boolean => {
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
          isValid = value === client.password;
          errorMessage = isValid ? "" : "Passwords do not match";
          break;
        case "phone":
          isValid = /^[\d\s+()-]+$/.test(value) && value.length >= 10;
          errorMessage = isValid ? "" : "Please enter a valid phone number";
          break;
        case "role":
          isValid = value.trim() !== "";
          errorMessage = isValid ? "" : "Role is required";
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setClient({
      ...client,
      [name]: value,
    });
    
    validateField(name as keyof Client, value);
  };

  const handleProfileImageChange = (photo: string) => {
    setClient({
      ...client,
      profileImage: photo,
    });
    
    setValidation(prev => ({ ...prev, profileImage: true }));
  };

  const validateForm = (): boolean => {
    let isFormValid = true;
    const newValidation = { ...validation };
    const newErrors = { ...errors };
    
    Object.entries(client).forEach(([key, value]) => {
      if (key === "profileImage") {
        newValidation.profileImage = true;
        return;
      }
      
      const fieldName = key as keyof Client;
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
    try{
        setLoading(true);
        // send client-user creation with client_id (API expects snake_case)
        const payload = { ...client, client_id: clientId };
        await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/client-users`, payload);
        toast.success("Client user created successfully");
        // redirect to client users list
        if (clientId) router.push(`/clients/${encodeURIComponent(String(clientId))}/users`);
        else router.push('/clients');

    } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 422) {
          toast.error("Validation error");
          if (error.response?.data?.errors) {
            const serverErrors = error.response.data.errors;
            const newErrors: Partial<Record<keyof Client, string>> = {};
            const newValidation = {...validation};
            
            Object.keys(serverErrors).forEach((key) => {
              const fieldName = key as keyof Client;
              newErrors[fieldName] = serverErrors[key][0];
              newValidation[fieldName] = false;
            });
            
            setErrors(newErrors);
            setValidation(newValidation);
          }
        } else {
        console.log("Error creating client:", error);
        toast.error("Failed to create client");
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
      <PageBreadcrumb pageTitle="Add Client User" />
      <ComponentCard title="Client Information" desc="Fill in all required fields to create a new client.">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <div className="xl:col-span-2">
              <Label>Profile Picture (Optional)</Label>
              <ProfilePicUploader 
                profilePic={client.profileImage} 
                onChange={handleProfileImageChange} 
              />
            </div>
            
            <div>
              <Label>First Name *</Label>
              <Input 
                type="text" 
                name="name"
                value={client.name}
                onChange={handleChange}
                error={!validation.name && client.name !== ""}
                success={validation.name && client.name !== ""}
                placeholder="John" 
                hint={errors.name || ""}
              />
            </div>
            
            <div>
              <Label>Last Name *</Label>
              <Input 
                type="text" 
                name="surname"
                value={client.surname}
                onChange={handleChange}
                error={!validation.surname && client.surname !== ""}
                success={validation.surname && client.surname !== ""}
                placeholder="Doe" 
                hint={errors.surname || ""}
              />
            </div>
            
            <div>
              <Label>Email *</Label>
              <Input 
                type="email" 
                name="email"
                value={client.email}
                onChange={handleChange}
                error={!validation.email && client.email !== ""}
                success={validation.email && client.email !== ""}
                placeholder="info@example.com" 
                hint={errors.email || ""}
              />
            </div>
            
            <div>
              <Label>Phone Number *</Label>
              <Input 
                type="tel" 
                name="phone"
                value={client.phone}
                onChange={handleChange}
                error={!validation.phone && client.phone !== ""}
                success={validation.phone && client.phone !== ""}
                placeholder="+1 234 567 8900" 
                hint={errors.phone || ""}
              />
            </div>
            
            <div>
              <Label>Country *</Label>
              <Input 
                type="text" 
                name="country"
                value={client.country}
                onChange={handleChange}
                error={!validation.country && client.country !== ""}
                success={validation.country && client.country !== ""}
                placeholder="United States" 
                hint={errors.country || ""}
              />
            </div>
            
            <div>
              <Label>City *</Label>
              <Input 
                type="text" 
                name="city"
                value={client.city}
                onChange={handleChange}
                error={!validation.city && client.city !== ""}
                success={validation.city && client.city !== ""}
                placeholder="New York" 
                hint={errors.city || ""}
              />
            </div>
            
            <div>
              <Label>Password *</Label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={client.password}
                  onChange={handleChange}
                  error={!validation.password && client.password !== ""}
                  success={validation.password && client.password !== ""}
                  placeholder="Enter your password"
                  hint={errors.password || ""}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                >
                      {showPassword ? (
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
                  value={client.password_confirmation}
                  onChange={handleChange}
                  error={!validation.password_confirmation && client.password_confirmation !== ""}
                  success={validation.password_confirmation && client.password_confirmation !== ""}
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
              <Label>Notes *</Label>
              <Input
                name="notes"
                value={client.notes}
                onChange={handleChange}
                error={!validation.notes && client.notes !== ""}
                success={validation.notes && client.notes !== ""}
                placeholder="Additional client information"
                hint={errors.notes || ""}
              />
            </div>
            
            <div>
              <Label>Role *</Label>
              <select
                name="role"
                value={client.role}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              >
                <option value="user">User</option>
                <option value="site_manager">Site Manager</option>
              </select>
              {errors.role && <p className="text-red-600 text-sm mt-1">{errors.role}</p>}
            </div>
            
            <div className="xl:col-span-2">
              <button
                disabled={loading}
                type="submit"
                className="px-4 py-2 text-white bg-red-500 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
               {loading ? "Creating..." : "Create Client User"}
              </button>
            </div>
          </div>
        </form>
      </ComponentCard>
    </div>
  );
};

export default CreateClientUser;