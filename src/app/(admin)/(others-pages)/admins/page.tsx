"use client";

import { useState } from "react";
import useAuthStore from "@/store/authStore";
import toast from "react-hot-toast";

const Admins = () => {
  const [searchTerm, setSearchTerm] = useState("");
  
  return (
    <div>
      Admins Page
    </div>
  );
};

export default Admins;  
