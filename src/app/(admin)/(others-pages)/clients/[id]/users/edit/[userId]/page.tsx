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
  surname: boolean;
  email: boolean;
  phone: boolean;
  country: boolean;
  city: boolean;
  notes: boolean;
  profileImage: boolean;
  role: boolean;
}

const EditClientUser = () => {
  const [loading, setLoading] = useState(false);
  const [fetchingClient, setFetchingClient] = useState(true);
  const router = useRouter();
  const {token} = useAuthStore();
  const {userId} = useParams();
  
  type Client = {
    name: string;
    surname: string;
    email: string;
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
    phone: false,
    country: false,
    city: false,
    notes: false,
    profileImage: true,
    role: true,
  });

  const fetchClientData = async () => {
    try {
      setFetchingClient(true);
      // fetch client-user by id
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/client-users/${userId}`,{
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const clientData = response.data;
      
      // Set client user data
      setClient({
        name: clientData.name || "",
        surname: clientData.surname || "",
        email: clientData.email || "",
        phone: clientData.phone || "",
        country: clientData.country || "",
        city: clientData.city || "",
        notes: clientData.notes || "",
        profileImage: clientData.profileImage || "",
        role: clientData.role || "user",
      });
      
      // Set validation state for fetched fields
      setValidation({
        ...validation,
        name: !!clientData.name,
        surname: !!clientData.surname,
        email: !!clientData.email,
        phone: !!clientData.phone,
        country: !!clientData.country,
        city: !!clientData.city,
        notes: !!clientData.notes,
        profileImage: true,
        role: !!clientData.role,
      });
    } catch (error) {
      console.error("Error fetching client data:", error);
      toast.error("Failed to fetch client data");
    } finally {
      setFetchingClient(false);
    }
  };

  useEffect(() => {
      fetchClientData();
  }, [userId]);

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
      const fieldName = key as keyof Client;
      
      if (fieldName === "profileImage") {
        newValidation.profileImage = true;
        return;
      }
      
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
        // Update client-user record
        await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/client-users/${userId}`, client,{
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        toast.success("Client user updated successfully");
        // go back to previous page (users list)
        router.back();
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
          console.error("Error updating client:", error);
          toast.error("Failed to update client");
        }
      } finally {
        setLoading(false);
      }
    } else {
      toast.error("Form validation failed");
    }
  };

  if (fetchingClient) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl">Loading client data...</div>
      </div>
    );
  }

  return (
    <div>
      <PageBreadcrumb pageTitle="Edit Client" />
      <ComponentCard title="Client Information" desc="Update client information as needed.">
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
            
            <div className="xl:col-span-2">
              <button
                disabled={loading}
                type="submit"
                className="px-4 py-2 text-white bg-red-500 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                {loading ? "Updating..." : "Update Client"}
              </button>
              <button
                type="button"
                onClick={() => router.push("/clients")}
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

export default EditClientUser;