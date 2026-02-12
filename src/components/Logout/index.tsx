"use client";
import React, { useState } from "react";
import Modal from "react-modal";
import toast from "react-hot-toast";
import useAuthStore from "@/store/authStore";
import { logout } from "@/hooks/auth";
import { useTranslation } from "react-i18next";

interface Props {
  className: string;
  children: React.ReactNode;
}

const customStyles = {
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)",
    width: "100%",
    maxWidth: "650px",
    maxHeight: "90vh",
    backgroundColor: "#1f2937", // Dark mode background color
    color: "#ffffff", // Dark mode text color
    border: "1px solid #4b5563", // Border for dark mode
    padding: "20px",
    borderRadius: "8px",
  },
  overlay: {
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    zIndex: 1000,
  },
};

const Logout = ({ children, className }: Props) => {
  const { setToken, setUser } = useAuthStore();
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const { t } = useTranslation();
  const openModal = () => {
    setModalIsOpen(true);
  };
  const closeModal = () => {
    setModalIsOpen(false);
  };

  return (
    <>
      <button onClick={openModal} className={className}>
        {children}
      </button>
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        style={customStyles}
        contentLabel="Delete Modal"
      >
        <div className="space-y-6 p-4 sm:p-6">
          <h2 className="text-2xl font-semibold text-[#ffffff]">
            {t("logoutConfirmation")}
          </h2>
          <p className="text-base text-[#d1d5db]">
            {t("logoutConfirmationText")}
          </p>
          <div className="mt-8 flex justify-end gap-3">
            <button
              onClick={closeModal}
              className="rounded-md bg-[#4b5563] px-5 py-2.5 text-sm font-semibold text-white transition-colors duration-200 ease-in-out hover:bg-[#374151]"
            >
              {t("no")}
            </button>
            <button
              onClick={() => {
                logout();
                setUser(null);
                setToken(null);
                toast.success("Logged out successfully");
              }}
              className="rounded-md bg-[#ef4444] px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-colors duration-200 ease-in-out hover:bg-[#dc2626]"
            >
              {t("yes")}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default Logout;
