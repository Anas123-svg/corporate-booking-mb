"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Eye, EyeOff } from "lucide-react";

import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { login } from "@/hooks/auth";
import axios from "axios";
import useAuthStore from "@/store/authStore";

export default function AuthForm() {
  const router = useRouter();
  const { setToken, setUser } = useAuthStore();

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const countries = [{ code: "US", countryname: "United States" }];

  // Sign In
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Sign Up
  const [form, setForm] = useState({
    firstname: "",
    lastname: "",
    email: "",
    password: "",
    password_repeat: "",
    address1: "",
    country: "",
    city: "",
    username: "",
    state: "",
  });

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Email and password are required.");
      return;
    }

    setLoading(true);
    try {
      const response = await login(email, password);
      console.log('Login API response:', response);
      if (response && (response.success === true || response.token)) {
        // Set token and user in store for UserDropdown
        if (response.token) setToken(response.token);
        if (response.user) setUser(response.user);
        toast.success("Signed in successfully!");
        router.push("/");
      } else {
        toast.error("Invalid login response.");
      }
    } catch (err: any) {
      const errorMessage = 
        err?.response?.data?.message ||
        err?.message ||
        (err instanceof Error ? err.toString() : "Sign in failed. Please try again.");
      
      console.error('[SignIn] Error caught:', err);
      console.error('[SignIn] Error message:', errorMessage);
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSignUpChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    console.log('[SignUp] Input Change:', e.target.name, e.target.value);
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('[SignUp] Button clicked');
    console.log('[SignUp] Form state before validation:', form);
    const { firstname, lastname, username, email, password, password_repeat, country, city, state } = form;
    if (!firstname || !lastname || !username || !email || !password || !password_repeat) {
      console.warn('[SignUp] Missing required fields:', { firstname, lastname, username, email, password, password_repeat });
      toast.error("Please fill all required fields.");
      return;
    }
    if (password !== password_repeat) {
      console.warn('[SignUp] Passwords do not match:', { password, password_repeat });
      toast.error("Passwords do not match.");
      return;
    }
    setLoading(true);
    const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/user/signup`;
    console.log('[SignUp] API URL:', apiUrl);
    try {
      const payload: any = {
        firstname,
        lastname,
        username,
        email,
        password,
        password_repeat,
        corporate_booking: 1,
      };
      if (country) payload.country = country;
      if (city) payload.city = city;
      if (state) payload.state = state;
      console.log('[SignUp] Payload:', payload);
      const { data } = await axios.post(apiUrl, payload);
      console.log('[SignUp] API raw response:', data);
      if ((data && (data.success === true || data.token)) || (data && data.status === 200)) {
        if (data.token) {
          localStorage.setItem("token", data.token);
          console.log('[SignUp] Sign up API response:', data);
          setUser(data.user || null);
          setToken(data.token);
        }
        toast.success("Account created and signed in!");
        console.log('[SignUp] Redirecting to home page');
        router.push("/");
      } else {
        console.error('[SignUp] Signup failed: No token returned.', data);
        toast.error("Signup failed: No token returned.");
      }
    } catch (err: any) {
      // Log full error response for debugging
      if (err?.response) {
        console.error('[SignUp] Sign up error response:', err.response);
      } else {
        console.error('[SignUp] Sign up error:', err);
      }
      toast.error(err?.response?.data?.message || err?.message || "Sign up failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full">
      <div className="flex flex-col flex-1 w-full px-6">
        <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div className="mb-6">
          <h1 className="mb-2 font-semibold text-gray-800 dark:text-white/90 text-title-sm sm:text-title-md">
            {mode === "signin" ? "Sign In" : "Sign Up"}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {mode === "signin"
              ? "Enter your email and password to sign in!"
              : "Create your account"}
          </p>
        </div>

        {/* ================= SIGN IN ================= */}
        {mode === "signin" && (
          <form onSubmit={handleSignIn} className="space-y-6">
            <div>
              <Label>
                Email <span className="text-error-500">*</span>
              </Label>
              <Input
                type="email"
                placeholder="info@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <Label>
                Password <span className="text-error-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <span
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer"
                >
                  {showPassword ? <Eye /> : <EyeOff />}
                </span>
              </div>
            </div>

            <Button
              disabled={loading}
              className="w-full !bg-[#b8936d] !text-white hover:!bg-[#a5815f]"
              size="sm"
              type="submit"
            >
              {loading ? "Loading..." : "Sign In"}
            </Button>

            <Button
              variant="outline"
              className="w-full"
              onClick={() => setMode("signup")}
            >
              Don’t have an account? Sign Up
            </Button>
          </form>
        )}

        {/* ================= SIGN UP ================= */}
        {mode === "signup" && (
          <form onSubmit={(e) => { console.log('[SignUp] Form onSubmit triggered'); handleSignUp(e); }} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>First Name *</Label>
                <Input name="firstname" value={form.firstname} onChange={handleSignUpChange} />
              </div>
              <div>
                <Label>Last Name *</Label>
                <Input name="lastname" value={form.lastname} onChange={handleSignUpChange} />
              </div>
            </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div>
                 <Label>Email *</Label>
                 <Input name="email" type="email" value={form.email} onChange={handleSignUpChange} />
               </div>
               <div>
                 <Label>Username *</Label>
                 <Input name="username" value={form.username} onChange={handleSignUpChange} />
               </div>
             </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Password *</Label>
                <div className="relative">
                  <Input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={handleSignUpChange}
                  />
                  <span
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer"
                  >
                    {showPassword ? <Eye /> : <EyeOff />}
                  </span>
                </div>
              </div>
              <div>
                <Label>Confirm Password *</Label>
                <div className="relative">
                  <Input
                    name="password_repeat"
                    type={showPassword ? "text" : "password"}
                    value={form.password_repeat}
                    onChange={handleSignUpChange}
                  />
                </div>
              </div>
            </div>






              <div>
                <Label>Country</Label>
                <select
                  name="country"
                  value={form.country}
                  onChange={handleSignUpChange}
                  disabled={false}
                  className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-800 dark:text-white/90 dark:placeholder:text-white/30"
                >
                  <option value="US">
                    United States
                  </option>
                  {countries.map((country) => (
                    <option key={country.code} value={country.code}>
                      {country.countryname}
                    </option>
                  ))}
                </select>
              </div>









            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>City *</Label>
                <Input name="city" value={form.city} onChange={handleSignUpChange} />
              </div>
              <div>
                <Label>State *</Label>
                <Input name="state" value={form.state} onChange={handleSignUpChange} />
              </div>
            </div>

            <Button
              disabled={loading}
              className="w-full !bg-[#b8936d] !text-white hover:!bg-[#a5815f]"
              size="sm"
              type="submit"
            >
              {loading ? "Loading..." : "Sign Up"}
            </Button>

            <Button
              variant="outline"
              className="w-full"
              onClick={() => setMode("signin")}
            >
              Already have an account? Sign In
            </Button>
          </form>
        )}
        </div>
      </div>
    </div>
  );
}
