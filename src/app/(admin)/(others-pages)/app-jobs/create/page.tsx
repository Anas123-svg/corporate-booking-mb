"use client";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import React, { useState, useEffect } from 'react';
import ComponentCard from '@/components/common/ComponentCard';
import Label from '@/components/form/Label';
import Input from '@/components/form/input/InputField';
import toast from "react-hot-toast";
import axios from "axios";
import { useRouter } from "next/navigation";
import useAuthStore from "@/store/authStore";
import type { Client } from "@/types";

interface ValidationState {
  job_title: boolean;
  notes: boolean;
  on_site_date: boolean;
  status: boolean;
  due_on: boolean;
  client_name: boolean;
  clientId?: boolean;
}

const CreateJob = () => {
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [useExistingClient, setUseExistingClient] = useState(false);
  const router = useRouter();
  const { token } = useAuthStore();
  
  type Job = {
    job_title: string;
    notes: string;
    on_site_date: string;
    status: string;
    due_on: string;
    client_name: string;
    clientId?: number;
  };

  const [job, setJob] = useState<Job>({
    job_title: "",
    notes: "",
    on_site_date: "",
    status: "scheduled",
    due_on: "",
    client_name: "",
  });
  
  const [errors, setErrors] = useState<Partial<Record<keyof Job, string>>>({});
  
  const [validation, setValidation] = useState<ValidationState>({
    job_title: false,
    notes: false,
    on_site_date: false,
    status: true,
    due_on: false,
    client_name: false,
  });

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/client`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setClients(response.data);
      } catch (error) {
        console.log("Error fetching clients:", error);
        toast.error("Failed to fetch clients");
      }
    };
    
    fetchClients();
  }, [token]);

  const validateField = (name: keyof Job, value: string): boolean => {
    let isValid = true;
    let errorMessage = "";
    
    switch (name) {
      case "on_site_date":
      case "due_on":
        isValid = value.trim() !== "";
        errorMessage = isValid ? "" : "Date is required";
        break;
      case "status":
        isValid = ["scheduled", "in-progress", "completed"].includes(value);
        errorMessage = isValid ? "" : "Invalid status";
        break;
      default:
        isValid = value.trim() !== "";
        errorMessage = isValid ? "" : `${name.replace(/_/g, ' ')} is required`;
    }
    
    setErrors(prev => ({ ...prev, [name]: errorMessage }));
    setValidation(prev => ({ ...prev, [name]: isValid }));
    
    return isValid;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setJob({
      ...job,
      [name]: value,
    });
    
    validateField(name as keyof Job, value);
  };

  const validateForm = (): boolean => {
    let isFormValid = true;
    const newValidation = { ...validation };
    const newErrors = { ...errors };
    
    // Skip validation for client_name and clientId as they are optional
    Object.entries(job).forEach(([key, value]) => {
      if (key === 'clientId' || key === 'client_name') return;
      
      const fieldName = key as keyof Job;
      const isFieldValid = validateField(fieldName, String(value));
      newValidation[fieldName] = isFieldValid;
      
      if (!isFieldValid) {
        isFormValid = false;
        newErrors[fieldName] = newErrors[fieldName] || `${fieldName.replace(/_/g, ' ')} is required`;
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
        
        // Prepare the payload based on whether user selected existing client or entered name
        const payload: any = {
          job_title: job.job_title,
          notes: job.notes,
          on_site_date: job.on_site_date,
          status: job.status,
          due_on: job.due_on,
        };
        
        if (useExistingClient && job.clientId) {
          payload.clientId = job.clientId;
        } else if (job.client_name) {
          payload.client_name = job.client_name;
        }
        
        await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/jobs`, payload);
        toast.success("Job created successfully");
        router.push("/app-jobs");
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 422) {
          toast.error("Validation error");
          if (error.response?.data?.errors) {
            const serverErrors = error.response.data.errors;
            const newErrors: Partial<Record<keyof Job, string>> = {};
            const newValidation = {...validation};
            
            Object.keys(serverErrors).forEach((key) => {
              const fieldName = key as keyof Job;
              newErrors[fieldName] = serverErrors[key][0];
              newValidation[fieldName] = false;
            });
            
            setErrors(newErrors);
            setValidation(newValidation);
          }
        } else {
          console.log("Error creating job:", error);
          toast.error("Failed to create job");
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
      <PageBreadcrumb pageTitle="Add Job" />
      <ComponentCard title="Job Information" desc="Fill in all required fields to create a new job.">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <div className="xl:col-span-2">
              <Label>Job Title *</Label>
              <Input 
                type="text" 
                name="job_title"
                value={job.job_title}
                onChange={handleChange}
                error={!validation.job_title && job.job_title !== ""}
                success={validation.job_title && job.job_title !== ""}
                placeholder="Office Cleaning" 
                hint={errors.job_title || ""}
              />
            </div>
            
            <div className="xl:col-span-2">
              <Label>Client (Optional)</Label>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                You can either select an existing client from the list below or enter a new client name if the client is not in the system.
              </p>
              <div className="mb-3 flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={!useExistingClient}
                    onChange={() => {
                      setUseExistingClient(false);
                      setJob({ ...job, clientId: undefined });
                    }}
                    className="w-4 h-4 text-red-500 focus:ring-red-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Enter Client Name</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={useExistingClient}
                    onChange={() => {
                      setUseExistingClient(true);
                      setJob({ ...job, client_name: "" });
                    }}
                    className="w-4 h-4 text-red-500 focus:ring-red-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Select Existing Client</span>
                </label>
              </div>
              
              {!useExistingClient ? (
                <Input 
                  type="text" 
                  name="client_name"
                  value={job.client_name}
                  onChange={handleChange}
                  placeholder="Enter client name (Optional)" 
                  hint=""
                />
              ) : (
                <select
                  name="clientId"
                  value={job.clientId || ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    setJob({
                      ...job,
                      clientId: value ? Number(value) : undefined,
                    });
                  }}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                >
                  <option value="">Select a client</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name} {client.surname} - {client.email}
                    </option>
                  ))}
                </select>
              )}
            </div>
            
            <div className="xl:col-span-2">
              <Label>Status *</Label>
              <select
                name="status"
                value={job.status}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              >
                <option value="scheduled">Scheduled</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            
            <div>
              <Label>On-Site Date *</Label>
              <Input 
                type="date" 
                name="on_site_date"
                value={job.on_site_date}
                onChange={handleChange}
                error={!validation.on_site_date && job.on_site_date !== ""}
                success={validation.on_site_date && job.on_site_date !== ""}
                hint={errors.on_site_date || ""}
              />
            </div>
            
            <div>
              <Label>Due Date *</Label>
              <Input 
                type="date" 
                name="due_on"
                value={job.due_on}
                onChange={handleChange}
                error={!validation.due_on && job.due_on !== ""}
                success={validation.due_on && job.due_on !== ""}
                hint={errors.due_on || ""}
              />
            </div>
            
            <div className="xl:col-span-2">
              <Label>Notes *</Label>
              <textarea
                name="notes"
                value={job.notes}
                onChange={handleChange}
                rows={4}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white ${
                  !validation.notes && job.notes !== "" ? 'border-red-500' : 
                  validation.notes && job.notes !== "" ? 'border-green-500' : ''
                }`}
                placeholder="Focus on conference rooms and kitchen"
              />
              {errors.notes && (
                <p className="mt-1 text-sm text-red-500">{errors.notes}</p>
              )}
            </div>
            
            <div className="xl:col-span-2">
              <button
                disabled={loading}
                type="submit"
                className="px-4 py-2 text-white bg-red-500 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
               {loading ? "Creating..." : "Create Job"}
              </button>
            </div>
          </div>
        </form>
      </ComponentCard>
    </div>
  );
};

export default CreateJob;