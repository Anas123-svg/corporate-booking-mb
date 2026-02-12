"use client";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import ProfilePicUploader from "@/components/profilePicUploader";
import Button from "@/components/ui/button/Button";
import useAuthStore from "@/store/authStore";
import axios from "axios";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

type Admin = {
  name: string;
  email: string;
  phone: string;
  profileImage: string;
  verificationStatus?: 'PENDING' | 'VERIFIED' | 'REJECTED';
};

interface ValidationState {
  name: boolean;
  email: boolean;
  phone: boolean;
  profileImage: boolean;
}
interface PasswordState {
  currentPassword: boolean;
  newPassword: boolean;
  confirmPassword: boolean;
}


export default function Profile() {
  const { user, token , setUser } = useAuthStore();
  // cast the store user to a Partial<Admin> so TypeScript knows these optional properties exist
  const userData = user as unknown as Partial<Admin> | undefined;
  const [admin, setAdmin] = useState<Admin>({
    name: userData?.name || "",
    email: userData?.email || "",
    phone: userData?.phone || "",
    profileImage: userData?.profileImage || "",
    verificationStatus: userData?.verificationStatus || 'PENDING',
  });

  // Dummy state for KYB verification process
  const [kybLoading, setKybLoading] = useState(false);
    // Dummy KYB verification handler
    const handleKybVerification = async () => {
      setKybLoading(true);
      // Simulate async verification
      await new Promise(res => setTimeout(res, 1200));
      // Cycle through statuses for demo
      setAdmin(prev => {
        let nextStatus: 'PENDING' | 'VERIFIED' | 'REJECTED';
        if (prev.verificationStatus === 'PENDING') nextStatus = 'VERIFIED';
        else if (prev.verificationStatus === 'VERIFIED') nextStatus = 'REJECTED';
        else nextStatus = 'PENDING';
        toast.success(`Verification status: ${nextStatus}`);
        return { ...prev, verificationStatus: nextStatus };
      });
      setKybLoading(false);
    };
  const [password, setPassword] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  
  // Initialize with empty errors
  const [errors, setErrors] = useState<Partial<Record<keyof Admin, string>>>({});
  const [passwordErrors, setPasswordErrors] = useState<Partial<Record<keyof PasswordState, string>>>();
  
  // Validate all fields on component mount
   useEffect(() => {
    // Validate each field with its initial value
    if (user) {
      validateField("name", admin.name);
      validateField("email", admin.email);
      validateField("phone", admin.phone);
    }
  }, []);
  const [validation, setValidation] = useState<ValidationState>({
    name: userData?.name ? true : false,
    email: userData?.email ? true : false,
    phone: userData?.phone ? true : false,
    profileImage: true,
  });
  const [passwordValidation, setPasswordValidation] = useState<PasswordState>({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPasswordSubmitting, setIsPasswordSubmitting] = useState(false);

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

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPassword({
      ...password,
      [name]: value,
    });
    
    let isValid = true;
    let errorMessage = "";
    
    switch (name) {
      case "currentPassword":
        isValid = value.trim() !== "";
        errorMessage = isValid ? "" : "Current password is required";
        break;
      case "newPassword":
        isValid = value.length >= 8;
        errorMessage = isValid ? "" : "New password must be at least 8 characters long";
        break;
      case "confirmPassword":
        isValid = value === password.newPassword;
        errorMessage = isValid ? "" : "Passwords do not match";
        break;
      default:
        isValid = true;
        errorMessage = "";
    }
    
    setPasswordErrors(prev => ({ ...prev, [name]: errorMessage }));
    setPasswordValidation(prev => ({ ...prev, [name]: isValid }));
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

      // Only validate fields that exist in ValidationState
      if (["name", "email", "phone"].includes(key)) {
        const fieldName = key as keyof ValidationState;
        const isFieldValid = validateField(fieldName as keyof Admin, value);
        newValidation[fieldName] = isFieldValid;

        if (!isFieldValid) {
          isFormValid = false;
          newErrors[fieldName as keyof Admin] = newErrors[fieldName as keyof Admin] || `${fieldName} is required`;
        }
      }
    });
    
    setValidation(newValidation);
    setErrors(newErrors);
    return isFormValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    try {
      setIsSubmitting(true);
      // Simulate API call delay
      await new Promise(res => setTimeout(res, 1000));
      // Simulate successful update with dummy data
      setUser({ ...admin, id: (user as any)?.id });
      toast.success("Profile updated successfully (demo mode)");
      setValidation({
        name: true,
        email: true,
        phone: true,
        profileImage: true,
      });
      setErrors({});
    } catch (error) {
      toast.error("Failed to update profile (demo mode)");
    } finally {
      setIsSubmitting(false);
    }
  };

  const validatePasswordForm = (): boolean => {
    let isFormValid = true;
    const newPasswordValidation = { ...passwordValidation };
    const newPasswordErrors: Partial<Record<keyof PasswordState, string>> = {};
    
    // Validate current password
    if (!password.currentPassword.trim()) {
      newPasswordValidation.currentPassword = false;
      newPasswordErrors.currentPassword = "Current password is required";
      isFormValid = false;
    } else {
      newPasswordValidation.currentPassword = true;
    }
    
    // Validate new password
    if (password.newPassword.length < 8) {
      newPasswordValidation.newPassword = false;
      newPasswordErrors.newPassword = "New password must be at least 8 characters long";
      isFormValid = false;
    } else {
      newPasswordValidation.newPassword = true;
    }
    
    // Validate confirm password
    if (password.confirmPassword !== password.newPassword) {
      newPasswordValidation.confirmPassword = false;
      newPasswordErrors.confirmPassword = "Passwords do not match";
      isFormValid = false;
    } else if (!password.confirmPassword) {
      newPasswordValidation.confirmPassword = false;
      newPasswordErrors.confirmPassword = "Confirm password is required";
      isFormValid = false;
    } else {
      newPasswordValidation.confirmPassword = true;
    }
    
    setPasswordValidation(newPasswordValidation);
    setPasswordErrors(newPasswordErrors);
    return isFormValid;
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatePasswordForm()) {
      return;
    }
    try {
      setIsPasswordSubmitting(true);
      // Simulate API call delay
      await new Promise(res => setTimeout(res, 1000));
      // Simulate password change success
      toast.success("Password changed successfully (demo mode)");
      setPassword({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setPasswordValidation({
        currentPassword: false,
        newPassword: false,
        confirmPassword: false,
      });
      setPasswordErrors({});
    } catch (error) {
      toast.error("Failed to update password (demo mode)");
    } finally {
      setIsPasswordSubmitting(false);
    }
  };



  return (
    <div>
      <PageBreadcrumb pageTitle="Settings" />
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <ComponentCard
          title="Personal Information"
          desc="Update your personal information."
        >
          {/* Verification Status */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="font-semibold">Verification Status: </span>
              <span
                className={
                  admin.verificationStatus === 'VERIFIED'
                    ? 'text-green-600 font-bold'
                    : admin.verificationStatus === 'REJECTED'
                    ? 'text-red-600 font-bold'
                    : 'text-yellow-600 font-bold'
                }
              >
                {admin.verificationStatus}
              </span>
            </div>
            <Button
              variant="outline"
              className="ml-4"
              onClick={handleKybVerification}
              disabled={kybLoading}
            >
              {kybLoading ? 'Verifying...' : 'Do KYB Verification'}
            </Button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-2">
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
            <div className="flex justify-end pt-4">
              <Button 
                disabled={isSubmitting}
                className="px-6"
                variant="primary"
              >
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </ComponentCard>
        <ComponentCard
          title="Change Password"
          desc="Update your password."
          className="h-fit"
        >
          <form onSubmit={handlePasswordSubmit} className="space-y-2">
            <div>
              <Label>Current Password *</Label>
              <Input
                type="password"
                name="currentPassword"
                value={password.currentPassword}
                onChange={handlePasswordChange}
                error={!passwordValidation.currentPassword && password.currentPassword !== ""}
                success={passwordValidation.currentPassword && password.currentPassword !== ""}
                placeholder="Enter current password"
                hint={passwordErrors?.currentPassword || ""}
              />
            </div>
            <div>
              <Label>New Password *</Label>
              <Input
                type="password"
                name="newPassword"
                value={password.newPassword}
                onChange={handlePasswordChange}
                error={!passwordValidation.newPassword && password.newPassword !== ""}
                success={passwordValidation.newPassword && password.newPassword !== ""}
                placeholder="Enter new password"
                hint={passwordErrors?.newPassword || ""}
              />
            </div>
            <div>
              <Label>Confirm New Password *</Label>
              <Input
                type="password"
                name="confirmPassword"
                value={password.confirmPassword}
                onChange={handlePasswordChange}
                error={!passwordValidation.confirmPassword && password.confirmPassword !== ""}
                success={passwordValidation.confirmPassword && password.confirmPassword !== ""}
                placeholder="Confirm new password"
                hint={passwordErrors?.confirmPassword || ""}
              />
            </div>
            <div className="flex justify-end pt-4">
              <Button 
                disabled={isPasswordSubmitting}
                className="px-6"
                variant="primary"
              >
                {isPasswordSubmitting ? "Changing..." : "Change Password"}
              </Button>
            </div>
          </form>
        </ComponentCard>
      </div>
    </div>
  );
}