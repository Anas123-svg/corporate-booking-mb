"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";


type Amenity = {
  id: number;
  name: string;
  description?: string;
};

type FormState = {
  homeType: number;
  roomType: string;
  listingName: string;
  youtubeUrl: string;
  city: string;
  streetAddress: string;
  accessCode: string;
  state: string;
  zipCode: string;
  country: string;
  timezone: string;
  basePrice: string;
  pricePerNight: string;
  bookingStyle: string;
  bookingAvailability: string;
  oneTimeStartDate: string;
  oneTimeEndDate: string;
  cancellationPolicy: string;
  duration: string;
  cleaningfees: string | number;
  servicefees: string | number;
  accomadtionfees: string | number;
  description: string;
  bedrooms: string | number;
  beds: string | number;
  bathrooms: string | number;
  accommodates: string | number;
  common_amenities: number[];
  additional_amenities: number[];
  special_features: number[];
  safety_checks: number[];
  currency?: string | number;
  liststatus: number; // default to active
};
// Cloudinary upload section state and handler
import React from "react";

// Add google to window type for TypeScript
declare global {
  interface Window {
    google?: any;
  }
}

export default function CreateHostingPage() {
  const router = useRouter();

  // Listing for self or client
  const [listingFor, setListingFor] = useState<'self' | 'client'>('self');
  const [selectedClientId, setSelectedClientId] = useState('');
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
const [uploading, setUploading] = useState(false);


  // Client dropdown state
  const [clientList, setClientList] = useState<{ id: number; firstname: string; lastname: string; email: string }[]>([]);
  const [clientsLoading, setClientsLoading] = useState(false);
  const [clientsError, setClientsError] = useState("");

  // Fetch clients when listingFor changes to 'client'
  useEffect(() => {
    if (listingFor !== 'client') return;
    const fetchClients = async () => {
      setClientsLoading(true);
      setClientsError("");
      let corporate_host_id = null;
      if (typeof window !== "undefined") {
        const authRaw = localStorage.getItem("auth-storage");
        if (authRaw) {
          try {
            const authObj = JSON.parse(authRaw);
            if (authObj?.state?.user?.id) {
              corporate_host_id = authObj.state.user.id;
            }
          } catch (e) {
            // ignore parse error
          }
        }
      }
      if (!corporate_host_id) {
        setClientsError("Corporate Host ID not found. Please login again.");
        setClientsLoading(false);
        return;
      }
      try {
        const url = `${process.env.NEXT_PUBLIC_API_URL}/user/getbycorporatehostid/${corporate_host_id}`;
        const res = await fetch(url, {
          method: "GET",
          headers: { "Content-Type": "application/json" }
        });
        const data = await res.json();
        if (data.success && Array.isArray(data.clients)) {
          setClientList(data.clients);
        } else {
          setClientList([]);
        }
      } catch (err) {
        setClientsError("Failed to fetch clients");
        setClientList([]);
      } finally {
        setClientsLoading(false);
      }
    };
    fetchClients();
  }, [listingFor]);

  const initialFormState: FormState = {
    homeType: 0,
    roomType: "",
    listingName: "",
    youtubeUrl: "",
    city: "",
    streetAddress: "",
    accessCode: "",
    state: "",
    zipCode: "",
    country: "",
    timezone: "",
    basePrice: "",
    pricePerNight: "",
    bookingStyle: "",
    bookingAvailability: "",
    oneTimeStartDate: "",
    oneTimeEndDate: "",
    cancellationPolicy: "",
    duration: "",
    cleaningfees: "",
    servicefees: "",
    accomadtionfees: "",
    description: "",
    bedrooms: "",
    beds: "",
    bathrooms: "",
    accommodates: "",
    common_amenities: [],
    additional_amenities: [],
    special_features: [],
    safety_checks: [],
    currency: "",
    liststatus: 1, // default to active
  };
  const [form, setForm] = useState<FormState>(initialFormState);

  // Google Maps location state
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Dynamically load Google Maps script
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (document.getElementById('google-maps-script')) return;
    const script = document.createElement('script');
    script.id = 'google-maps-script';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAP_API_KEY}`;
    script.async = true;
    script.onload = () => {
      // Map will be initialized in the component below
    };
    document.body.appendChild(script);
  }, []);

  // Handle base price change and update price per night
  const handleBasePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    let pricePerNight = "";
    if (value && !isNaN(Number(value))) {
      const monthly = parseFloat(value);
      if (!isNaN(monthly) && monthly > 0) {
        pricePerNight = (monthly / 30).toFixed(2);
      }
    }
    setForm((prev) => ({ ...prev, basePrice: value, pricePerNight }));
  };




  const handleCloudinaryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    const uploaded: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || '');
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
      try {
        const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
          method: 'POST',
          body: formData
        });
        const data = await res.json();
        if (data.secure_url) {
          uploaded.push(data.secure_url);
        }
      } catch (err) {
        // Optionally handle error
      }
    }
    setUploadedImages((prev) => [...prev, ...uploaded]);
    setUploading(false);
  };

  // Remove uploaded image by index
  const handleRemoveImage = (idx: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== idx));
  };


  const [homeTypes, setHomeTypes] = useState<any[]>([]);
  const [homeTypesLoading, setHomeTypesLoading] = useState(false);
  const [roomTypes, setRoomTypes] = useState<any[]>([]);
  const [roomTypesLoading, setRoomTypesLoading] = useState(false);
  const [countries, setCountries] = useState<any[]>([]);
  const [countriesLoading, setCountriesLoading] = useState(false);
  const [timezones, setTimezones] = useState<any[]>([]);
  const [timezonesLoading, setTimezonesLoading] = useState(false);
  const [currencyTypes, setCurrencyTypes] = useState<any[]>([]);
  const [currencyTypesLoading, setCurrencyTypesLoading] = useState(false);
  const [cancellationPolicies, setCancellationPolicies] = useState<any[]>([]);
  const [cancellationLoading, setCancellationLoading] = useState(false);
  const [amenities, setAmenities] = useState<{
    common_amenities: Amenity[];
    additional_amenities: Amenity[];
    special_features: Amenity[];
    safety_checks: Amenity[];
  }>({
    common_amenities: [],
    additional_amenities: [],
    special_features: [],
    safety_checks: [],
  });
  const [amenitiesLoading, setAmenitiesLoading] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchHomeTypes = async () => {
      setHomeTypesLoading(true);
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/listing/hometypes`);
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          setHomeTypes(data.data);
        } else {
          setHomeTypes([]);
        }
      } catch (e) {
        setHomeTypes([]);
      } finally {
        setHomeTypesLoading(false);
      }
    };

    const fetchRoomTypes = async () => {
      setRoomTypesLoading(true);
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/listing/roomtypes`);
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          setRoomTypes(data.data);
        } else {
          setRoomTypes([]);
        }
      } catch (e) {
        setRoomTypes([]);
      } finally {
        setRoomTypesLoading(false);
      }
    };
    const fetchCurrency = async () => {
      setCurrencyTypesLoading(true);
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/common/currencies`);
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          setCurrencyTypes(data.data);
        } else {
          setCurrencyTypes([]);
        }
      } catch (e) {
        setCurrencyTypes([]);
      } finally {
        setCurrencyTypesLoading(false);
      }
    };
    const fetchCountries = async () => {
      setCountriesLoading(true);
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/common/countries`);
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          setCountries(data.data);
        } else {
          setCountries([]);
        }
      } catch (e) {
        setCountries([]);
      } finally {
        setCountriesLoading(false);
      }
    };

    const fetchTimezones = async () => {
      setTimezonesLoading(true);
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/common/timezones`);
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          setTimezones(data.data);
        } else {
          setTimezones([]);
        }
      } catch (e) {
        setTimezones([]);
      } finally {
        setTimezonesLoading(false);
      }
    };

    const fetchAmenities = async () => {
      setAmenitiesLoading(true);
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/common/amenities`);
        const data = await res.json();
        if (data.success && data.data) {
          setAmenities({
            common_amenities: data.data.common_amenities || [],
            additional_amenities: data.data.additional_amenities || [],
            special_features: data.data.special_features || [],
            safety_checks: data.data.safety_checks || [],
          });
        } else {
          setAmenities({
            common_amenities: [],
            additional_amenities: [],
            special_features: [],
            safety_checks: [],
          });
        }
      } catch (e) {
        setAmenities({
          common_amenities: [],
          additional_amenities: [],
          special_features: [],
          safety_checks: [],
        });
      } finally {
        setAmenitiesLoading(false);
      }
    };

    const fetchCancellationPolicies = async () => {
      setCancellationLoading(true);
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/common/cancellation`);
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          setCancellationPolicies(data.data.map((item: any) => ({ id: item.id, policyname: item.policyname })));
        } else {
          setCancellationPolicies([]);
        }
      } catch (e) {
        setCancellationPolicies([]);
      } finally {
        setCancellationLoading(false);
      }
    };

    fetchHomeTypes();
    fetchCurrency();
    fetchRoomTypes();
    fetchCountries();
    fetchTimezones();
    fetchAmenities();
    fetchCancellationPolicies();
  }, []);

  const handleAmenityChange = (
    type: keyof Pick<FormState, "common_amenities" | "additional_amenities" | "special_features" | "safety_checks">,
    id: number
  ) => {
    setForm((prev) => {
      const selected: number[] = prev[type];
      if (selected.includes(id)) {
        return { ...prev, [type]: selected.filter((x: number) => x !== id) };
      } else {
        return { ...prev, [type]: [...selected, id] };
      }
    });
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    let userId = null;
    if (listingFor === 'self') {
      // Get admin id from localStorage
      if (typeof window !== "undefined") {
        const authRaw = localStorage.getItem("auth-storage");
        if (authRaw) {
          try {
            const authObj = JSON.parse(authRaw);
            if (authObj?.state?.user?.id) {
              userId = authObj.state.user.id;
            }
          } catch (e) {}
        }
      }
    } else {
      userId = selectedClientId;
    }
    if (!userId) {
      alert("User ID not found. Please login again or select a client.");
      setLoading(false);
      return;
    }

    // Convert dates to unix timestamps if present and valid
    let startdate = undefined;
    let enddate = undefined;
    const isValidDate = (d: any) => {
      return d instanceof Date && !isNaN(d.getTime());
    };
    if (form.oneTimeStartDate) {
      const d = new Date(form.oneTimeStartDate);
      if (isValidDate(d)) {
        const ts = Math.floor(d.getTime() / 1000);
        // Only allow positive, reasonable timestamps (1971-01-01 to 2038-01-19 for signed INT)
        if (ts > 0 && ts <= 2147483647) {
          startdate = ts;
        }
      }
    }
    if (form.oneTimeEndDate) {
      const d = new Date(form.oneTimeEndDate);
      if (isValidDate(d)) {
        const ts = Math.floor(d.getTime() / 1000);
        if (ts > 0 && ts <= 2147483647) {
          enddate = ts;
        }
      }
    }

    // Find selected objects for debug and id extraction
    const selectedHomeType = homeTypes.find(ht => String(ht.hometype) === String(form.homeType) || String(ht.id) === String(form.homeType));
    const selectedRoomType = roomTypes.find(rt => String(rt.roomtype) === String(form.roomType) || String(rt.id) === String(form.roomType));
    const selectedTimezone = timezones.find(tz => String(tz.zonecode) === String(form.timezone) || String(tz.id) === String(form.timezone));
    const selectedCurrency = currencyTypes.find(c => String(c.currencycode) === String(form.currency) || String(c.id) === String(form.currency));

    // Compose payload with .id for hometype, roomtype, timezone
    const payload = {
      userid: Number(userId),
      hometype: selectedHomeType?.id ? Number(selectedHomeType.id) : Number(form.homeType),
      roomtype: selectedRoomType?.id ? Number(selectedRoomType.id) : Number(form.roomType),
      listingname: form.listingName,
      youtubeurl: form.youtubeUrl,
      city: form.city,
      streetaddress: form.streetAddress,
      accesscode: form.accessCode,
      country: Number(form.country),
      state: form.state,
      zipcode: form.zipCode === '' ? 0 : Number(form.zipCode),
      timezone: selectedTimezone?.id ? Number(selectedTimezone.id) : Number(form.timezone),
      currency: selectedCurrency?.id ? Number(selectedCurrency.id) : Number(form.currency),
      nightlyprice: form.pricePerNight,
      bookingstyle: form.bookingStyle,
      bookingavailability: form.bookingAvailability,
      startdate: startdate,
      enddate: enddate,
      cancellation: form.cancellationPolicy,
      cleaningfees: form.cleaningfees === '' || isNaN(Number(form.cleaningfees)) ? 0 : Number(form.cleaningfees),
      accomadtionfees: form.accomadtionfees === '' || isNaN(Number(form.accomadtionfees)) ? 0 : Number(form.accomadtionfees),
      servicefees: form.servicefees === '' || isNaN(Number(form.servicefees)) ? 0 : Number(form.servicefees),
      accommodates: form.accommodates === '' ? 0 : Number(form.accommodates),
      bedrooms: form.bedrooms === '' ? 0 : Number(form.bedrooms),
      beds: form.beds === '' ? 0 : Number(form.beds),
      bathrooms: form.bathrooms === '' ? 0 : Number(form.bathrooms),
      description: form.description,
      additional_amenities: form.additional_amenities,
      common_amenities: form.common_amenities,
      safety_features: form.safety_checks,
      special_features: form.special_features,
      photos: uploadedImages,
      cdate: String(Math.floor(Date.now() / 1000)),
      longitude: selectedLocation?.lng ?? null,
      latitude: selectedLocation?.lat ?? null,
      liststatus: form.liststatus,
    };
    // Remove undefined start/end date if not oneTime
    if (form.bookingAvailability !== 'oneTime') {
      delete payload.startdate;
      delete payload.enddate;
    } else {
      // If oneTime but invalid dates, remove from payload
      if (!startdate) delete payload.startdate;
      if (!enddate) delete payload.enddate;
    }
      // Debug log selected objects and payload
      console.log("Selected HomeType:", selectedHomeType);
      console.log("Selected RoomType:", selectedRoomType);
      console.log("Selected Timezone:", selectedTimezone);
      console.log("Selected Currency:", selectedCurrency);
      console.log("Request payload sent to server:", payload);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/listing/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      console.log("API response status:", res.status);
      let data = null;
      try {
        data = await res.json();
      } catch (jsonErr) {
        console.error("Error parsing server response as JSON:", jsonErr);
      }
      console.log("API response body:", data);
      if (!res.ok || !data || !data.success) {
        console.error("Server error:", data);
        alert((data && data.message) || "Failed to create listing");
        setLoading(false);
        return;
      }
      setLoading(false);
      // Reset form state after successful submission
      setForm(initialFormState);
      setUploadedImages([]);
      setSelectedClientId("");
      router.push("/hostings");
    } catch (err) {
      console.error("API error:", err);
      alert("An error occurred. Please try again.");
      setLoading(false);
    }
  };

  // Google Map Section Component
  const GoogleMapSection = () => {
    const mapRef = React.useRef<HTMLDivElement>(null);
    const markerRef = React.useRef<any>(null);
    React.useEffect(() => {
      if (!window.google || !mapRef.current) return;
      // Use type assertions for google types
      const googleMaps = window.google.maps;
      let map: any;
      let marker: any = null;
      const mapOptions = {
        center: selectedLocation || { lat: 37.7749, lng: -122.4194 }, // Default: San Francisco
        zoom: 10,
        mapId: process.env.NEXT_PUBLIC_GOOGLE_MAP_ID || undefined,
      };
      map = new googleMaps.Map(mapRef.current, mapOptions);
      if (selectedLocation) {
        marker = new googleMaps.Marker({
          position: selectedLocation,
          map,
        });
        markerRef.current = marker;
      }
      map.addListener('click', (e: any) => {
        if (e.latLng) {
          const lat = e.latLng.lat();
          const lng = e.latLng.lng();
          setSelectedLocation({ lat, lng });
          if (markerRef.current) {
            markerRef.current.setMap(null);
          }
          markerRef.current = new googleMaps.Marker({
            position: { lat, lng },
            map,
          });
        }
      });
    }, [selectedLocation]);
    return (
      <div>
        <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
          Select Location on Map
        </label>
        <div
          ref={mapRef}
          style={{ width: '100%', height: '350px', borderRadius: '12px', border: '2px solid var(--border)' }}
        />
        {selectedLocation && (
          <div className="mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
            Selected Coordinates: <span className="font-mono">{selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;900&family=Inter:wght@300;400;500;600&display=swap');
        
        :root {
          --primary: #1a1a1a;
          --secondary: #d4a574;
          --accent: #8b7355;
          --bg-light: #fafaf8;
          --bg-card: #ffffff;
          --text-primary: #1a1a1a;
          --text-secondary: #6b6b6b;
          --border: #e8e8e6;
          --shadow: rgba(0, 0, 0, 0.08);
        }

        .dark {
          --primary: #ffffff;
          --secondary: #d4a574;
          --accent: #b8936d;
          --bg-light: #0f0f0f;
          --bg-card: #1a1a1a;
          --text-primary: #ffffff;
          --text-secondary: #a3a3a3;
          --border: #2a2a2a;
          --shadow: rgba(0, 0, 0, 0.3);
        }

        body {
          background: var(--bg-light);
          font-family: 'Inter', sans-serif;
        }

        .playfair {
          font-family: 'Playfair Display', serif;
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .animate-slide-up {
          animation: slideUp 0.6s ease-out forwards;
        }

        .animate-fade-in {
          animation: fadeIn 0.8s ease-out forwards;
        }

        input:focus, select:focus, textarea:focus {
          outline: none;
          border-color: var(--secondary) !important;
          box-shadow: 0 0 0 3px rgba(212, 165, 116, 0.1) !important;
        }

        .checkbox-custom {
          appearance: none;
          width: 20px;
          height: 20px;
          border: 2px solid var(--border);
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;
        }

        .checkbox-custom:checked {
          background: var(--secondary);
          border-color: var(--secondary);
        }

        .checkbox-custom:checked::after {
          content: '✓';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          color: white;
          font-size: 14px;
          font-weight: bold;
        }

        .section-divider {
          height: 2px;
          background: linear-gradient(90deg, transparent, var(--secondary), transparent);
          opacity: 0.3;
          margin: 3rem 0;
        }
      `}</style>

      <div className="min-h-screen pt-2 pb-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-8">
            <div className="inline-block mb-2">
              <div className="w-20 h-1 bg-gradient-to-r from-transparent via-secondary to-transparent mx-auto mb-3"></div>
            </div>

            <h1
              className="playfair text-6xl md:text-7xl font-bold mb-2 tracking-tight"
              style={{ color: 'var(--text-primary)' }}
            >
              Create Your Listing
            </h1>

            <p
              className="text-base md:text-lg"
              style={{ color: 'var(--text-secondary)' }}
            >
              Craft an exceptional hosting experience
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-12 animate-slide-up">
            {/* Property Details */}
            <section className="bg-card rounded-2xl shadow-lg overflow-hidden border" style={{
              background: 'var(--bg-card)',
              borderColor: 'var(--border)',
              boxShadow: '0 4px 6px -1px var(--shadow), 0 2px 4px -1px var(--shadow)'
            }}>
              <div className="p-8 md:p-12">
                <div className="flex items-center mb-8">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center mr-4" style={{ background: 'var(--secondary)' }}>
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="playfair text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>Property Details</h2>
                    <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Define your property's character</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {/* Google Map Location Picker */}
                                    <div className="md:col-span-2 lg:col-span-3">
                                      <GoogleMapSection />
                                    </div>
                  <div className="group">
                    <label className="block text-sm font-semibold mb-2 transition-colors" style={{ color: 'var(--text-primary)' }}>
                      Home Type
                    </label>
                    <select
                      name="homeType"
                      value={form.homeType}
                      onChange={handleChange}
                      required
                      disabled={homeTypesLoading}
                      className="w-full px-4 py-3.5 rounded-lg border-2 transition-all duration-200 hover:border-secondary/50"
                      style={{
                        background: 'var(--bg-light)',
                        borderColor: 'var(--border)',
                        color: 'var(--text-primary)'
                      }}
                    >
                      <option value="" disabled>{homeTypesLoading ? "Loading..." : "Select home type"}</option>
                      {homeTypes.map((type) => (
                        <option key={type.id} value={type.hometype}>{type.hometype}</option>
                      ))}
                    </select>
                  </div>

                  <div className="group">
                    <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                      Room Type
                    </label>
                    <select
                      name="roomType"
                      value={form.roomType}
                      onChange={handleChange}
                      required
                      disabled={roomTypesLoading}
                      className="w-full px-4 py-3.5 rounded-lg border-2 transition-all duration-200 hover:border-secondary/50"
                      style={{
                        background: 'var(--bg-light)',
                        borderColor: 'var(--border)',
                        color: 'var(--text-primary)'
                      }}
                    >
                      <option value="" disabled>{roomTypesLoading ? "Loading..." : "Select room type"}</option>
                      {roomTypes.map((type) => (
                        <option key={type.id} value={type.roomtype}>{type.roomtype}</option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-2 lg:col-span-1">
                    <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                      Listing Name
                    </label>
                    <input
                      type="text"
                      name="listingName"
                      value={form.listingName}
                      onChange={handleChange}
                      required
                      placeholder="A memorable name for your space"
                      className="w-full px-4 py-3.5 rounded-lg border-2 transition-all duration-200 hover:border-secondary/50"
                      style={{
                        background: 'var(--bg-light)',
                        borderColor: 'var(--border)',
                        color: 'var(--text-primary)'
                      }}
                    />
                  </div>

                  <div className="md:col-span-2 lg:col-span-3">
                    <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                      YouTube URL <span className="text-xs font-normal" style={{ color: 'var(--text-secondary)' }}>(Optional)</span>
                    </label>
                    <input
                      type="url"
                      name="youtubeUrl"
                      value={form.youtubeUrl}
                      onChange={handleChange}
                      placeholder="https://youtube.com/..."
                      className="w-full px-4 py-3.5 rounded-lg border-2 transition-all duration-200 hover:border-secondary/50"
                      style={{
                        background: 'var(--bg-light)',
                        borderColor: 'var(--border)',
                        color: 'var(--text-primary)'
                      }}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                      City
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={form.city}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3.5 rounded-lg border-2 transition-all duration-200 hover:border-secondary/50"
                      style={{
                        background: 'var(--bg-light)',
                        borderColor: 'var(--border)',
                        color: 'var(--text-primary)'
                      }}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                      Street Address
                    </label>
                    <input
                      type="text"
                      name="streetAddress"
                      value={form.streetAddress}
                      onChange={handleChange}
                      className="w-full px-4 py-3.5 rounded-lg border-2 transition-all duration-200 hover:border-secondary/50"
                      style={{
                        background: 'var(--bg-light)',
                        borderColor: 'var(--border)',
                        color: 'var(--text-primary)'
                      }}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                      Apt, Suite <span className="text-xs font-normal" style={{ color: 'var(--text-secondary)' }}>(Optional)</span>
                    </label>
                    <input
                      type="text"
                      name="accessCode"
                      value={form.accessCode}
                      onChange={handleChange}
                      className="w-full px-4 py-3.5 rounded-lg border-2 transition-all duration-200 hover:border-secondary/50"
                      style={{
                        background: 'var(--bg-light)',
                        borderColor: 'var(--border)',
                        color: 'var(--text-primary)'
                      }}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                      State
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={form.state}
                      onChange={handleChange}
                      className="w-full px-4 py-3.5 rounded-lg border-2 transition-all duration-200 hover:border-secondary/50"
                      style={{
                        background: 'var(--bg-light)',
                        borderColor: 'var(--border)',
                        color: 'var(--text-primary)'
                      }}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                      Zip Code
                    </label>
                    <input
                      type="text"
                      name="zipCode"
                      value={form.zipCode}
                      onChange={handleChange}
                      className="w-full px-4 py-3.5 rounded-lg border-2 transition-all duration-200 hover:border-secondary/50"
                      style={{
                        background: 'var(--bg-light)',
                        borderColor: 'var(--border)',
                        color: 'var(--text-primary)'
                      }}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                      Country
                    </label>
                    <select
                      name="country"
                      value={form.country}
                      onChange={handleChange}
                      required
                      disabled={countriesLoading}
                      className="w-full px-4 py-3.5 rounded-lg border-2 transition-all duration-200 hover:border-secondary/50"
                      style={{
                        background: 'var(--bg-light)',
                        borderColor: 'var(--border)',
                        color: 'var(--text-primary)'
                      }}
                    >
                      <option value="" disabled>{countriesLoading ? "Loading..." : "Select country"}</option>
                      {countries.map((country) => (
                        <option key={country.id} value={country.countryid}>
                          {country.countryname ? country.countryname : `Country #${country.countryid}`}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                      Timezone
                    </label>
                    <select
                      name="timezone"
                      value={form.timezone}
                      onChange={handleChange}
                      required
                      disabled={timezonesLoading}
                      className="w-full px-4 py-3.5 rounded-lg border-2 transition-all duration-200 hover:border-secondary/50"
                      style={{
                        background: 'var(--bg-light)',
                        borderColor: 'var(--border)',
                        color: 'var(--text-primary)'
                      }}
                    >
                      <option value="" disabled>{timezonesLoading ? "Loading..." : "Select timezone"}</option>
                      {timezones.map((tz) => (
                        <option key={tz.id} value={tz.zonecode}>{tz.timezone}</option>
                      ))}
                    </select>
                  </div>


                    <div >
                    <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                        Currency
                      </label>
                      <select
                        name="currency"
                        value={form.currency}
                        onChange={handleChange}
                        required
                        disabled={currencyTypesLoading}
                        className="w-full px-4 py-3.5 rounded-lg border-2 transition-all duration-200 hover:border-secondary/50"
                        style={{
                          background: 'var(--bg-light)',
                          borderColor: 'var(--border)',
                          color: 'var(--text-primary)'
                        }}
                      >
                        <option value="" disabled>{currencyTypesLoading ? "Loading..." : "Select currency"}</option>
                        {currencyTypes.map((type) => (
                          <option key={type.id} value={type.currencycode}>{type.currencycode} {type.symbol ? `(${type.symbol})` : ''}</option>
                        ))}
                      </select>
                    </div>

                </div>
              </div>
            </section>


            <div className="section-divider"></div>

            {/* Photo Upload Section */}
            <section className="bg-card rounded-2xl shadow-lg overflow-hidden border mb-8" style={{
              background: 'var(--bg-card)',
              borderColor: 'var(--border)',
              boxShadow: '0 4px 6px -1px var(--shadow), 0 2px 4px -1px var(--shadow)'
            }}>
              <div className="p-8 md:p-12">
                <h2 className="playfair text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Upload Photos</h2>
                <p className="mb-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
                  Add high-quality photos to showcase your property. You can upload multiple images.
                </p>
                <div className="mb-4">
                  <label
                    htmlFor="photo-upload-input"
                    className="inline-block px-6 py-2.5 text-white font-semibold rounded-lg shadow transition-colors cursor-pointer"
                    style={{ background: '#D4A574', border: 'none' }}
                  >
                    {uploading ? 'Uploading...' : 'Upload Photos'}
                  </label>
                  <input
                    id="photo-upload-input"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleCloudinaryUpload}
                    disabled={uploading}
                    className="hidden"
                  />
                </div>
                {uploadedImages.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 mt-4">
                    {uploadedImages.map((url, idx) => (
                      <div key={idx} className="relative group border rounded-lg overflow-hidden" style={{ borderColor: 'var(--border)' }}>
                        <img src={url} alt="Uploaded" className="object-cover w-full h-32" />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          className="absolute top-1 right-1 bg-white bg-opacity-80 rounded-full p-1 shadow hover:bg-red-500 hover:text-white transition-colors text-xs"
                          title="Remove photo"
                          style={{ lineHeight: 1 }}
                        >
                          &times;
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>

            {/* Booking & Pricing */}
            <section className="bg-card rounded-2xl shadow-lg overflow-hidden border" style={{
              background: 'var(--bg-card)',
              borderColor: 'var(--border)',
              boxShadow: '0 4px 6px -1px var(--shadow), 0 2px 4px -1px var(--shadow)'
            }}>
              <div className="p-8 md:p-12">
                <div className="flex items-center mb-8">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center mr-4" style={{ background: 'var(--secondary)' }}>
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="playfair text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>Booking & Pricing</h2>
                    <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Set your rates and availability</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                      Base Price
                    </label>
                    <input
                      type="number"
                      name="basePrice"
                      value={form.basePrice}
                      onChange={handleBasePriceChange}
                      required
                      min={0}
                      step={0.01}
                      placeholder="$0.00"
                      className="w-full px-4 py-3.5 rounded-lg border-2 transition-all duration-200 hover:border-secondary/50"
                      style={{
                        background: 'var(--bg-light)',
                        borderColor: 'var(--border)',
                        color: 'var(--text-primary)'
                      }}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                      Price Per Night
                    </label>
                    <input
                      type="number"
                      name="pricePerNight"
                      value={form.pricePerNight}
                      readOnly
                      required
                      placeholder="$0.00"
                      className="w-full px-4 py-3.5 rounded-lg border-2 bg-gray-100 text-gray-500 cursor-not-allowed"
                      style={{
                        borderColor: 'var(--border)',
                        color: 'var(--text-secondary)',
                        background: '#f3f4f6'
                      }}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                      Booking Style
                    </label>
                    <select
                      name="bookingStyle"
                      value={form.bookingStyle}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3.5 rounded-lg border-2 transition-all duration-200 hover:border-secondary/50"
                      style={{
                        background: 'var(--bg-light)',
                        borderColor: 'var(--border)',
                        color: 'var(--text-primary)'
                      }}
                    >
                      <option value="" disabled>Select booking style</option>
                      <option value="instant">Instant</option>
                      <option value="request">Request</option>
                    </select>
                  </div>

                  <div className="md:col-span-2 lg:col-span-1">
                    <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                      Booking Availability
                    </label>
                    <select
                      name="bookingAvailability"
                      value={form.bookingAvailability}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3.5 rounded-lg border-2 transition-all duration-200 hover:border-secondary/50"
                      style={{
                        background: 'var(--bg-light)',
                        borderColor: 'var(--border)',
                        color: 'var(--text-primary)'
                      }}
                    >
                      <option value="" disabled>Select availability</option>
                      <option value="instant">Always</option>
                      <option value="oneTime">One Time</option>
                    </select>
                  </div>

                  {form.bookingAvailability === "oneTime" && (
                    <>
                      <div>
                        <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                          Start Date
                        </label>
                        <input
                          type="date"
                          name="oneTimeStartDate"
                          value={form.oneTimeStartDate || ""}
                          onChange={(e) => setForm((f) => ({ ...f, oneTimeStartDate: e.target.value }))}
                          required
                          className="w-full px-4 py-3.5 rounded-lg border-2 transition-all duration-200 hover:border-secondary/50"
                          style={{
                            background: 'var(--bg-light)',
                            borderColor: 'var(--border)',
                            color: 'var(--text-primary)'
                          }}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                          End Date
                        </label>
                        <input
                          type="date"
                          name="oneTimeEndDate"
                          value={form.oneTimeEndDate || ""}
                          onChange={(e) => setForm((f) => ({ ...f, oneTimeEndDate: e.target.value }))}
                          required
                          className="w-full px-4 py-3.5 rounded-lg border-2 transition-all duration-200 hover:border-secondary/50"
                          style={{
                            background: 'var(--bg-light)',
                            borderColor: 'var(--border)',
                            color: 'var(--text-primary)'
                          }}
                        />
                      </div>
                    </>
                  )}

                  <div className="md:col-span-2 lg:col-span-1">
                    <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                      Cancellation Policy
                    </label>
                    <select
                      name="cancellationPolicy"
                      value={form.cancellationPolicy}
                      onChange={handleChange}
                      required
                      disabled={cancellationLoading}
                      className="w-full px-4 py-3.5 rounded-lg border-2 transition-all duration-200 hover:border-secondary/50"
                      style={{
                        background: 'var(--bg-light)',
                        borderColor: 'var(--border)',
                        color: 'var(--text-primary)'
                      }}
                    >
                      <option value="" disabled>{cancellationLoading ? "Loading..." : "Select policy"}</option>
                      {cancellationPolicies.map((policy) => (
                        <option key={policy.id} value={policy.policyname}>{policy.policyname}</option>
                      ))}
                    </select>
                  </div>


                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                      Cleaning Fees
                    </label>
                    <input
                      type="number"
                      name="cleaningfees"
                      value={form.cleaningfees}
                      onChange={(e) => setForm((f) => ({ ...f, cleaningfees: e.target.value === "" ? "" : Number(e.target.value) }))}
                      min={0}
                      step={1}
                      placeholder="$0"
                      className="w-full px-4 py-3.5 rounded-lg border-2 transition-all duration-200 hover:border-secondary/50"
                      style={{
                        background: 'var(--bg-light)',
                        borderColor: 'var(--border)',
                        color: 'var(--text-primary)'
                      }}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                      Service Fees
                    </label>
                    <input
                      type="number"
                      name="servicefees"
                      value={form.servicefees}
                      onChange={(e) => setForm((f) => ({ ...f, servicefees: e.target.value === "" ? "" : Number(e.target.value) }))}
                      min={0}
                      step={1}
                      placeholder="$0"
                      className="w-full px-4 py-3.5 rounded-lg border-2 transition-all duration-200 hover:border-secondary/50"
                      style={{
                        background: 'var(--bg-light)',
                        borderColor: 'var(--border)',
                        color: 'var(--text-primary)'
                      }}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                      Accommodation Fees
                    </label>
                    <input
                      type="number"
                      name="accomadtionfees"
                      value={form.accomadtionfees}
                      onChange={(e) => setForm((f) => ({ ...f, accomadtionfees: e.target.value === "" ? "" : Number(e.target.value) }))}
                      min={0}
                      step={1}
                      placeholder="$0"
                      className="w-full px-4 py-3.5 rounded-lg border-2 transition-all duration-200 hover:border-secondary/50"
                      style={{
                        background: 'var(--bg-light)',
                        borderColor: 'var(--border)',
                        color: 'var(--text-primary)'
                      }}
                    />
                  </div>

                                    <div className="md:col-span-2 lg:col-span-1">
                    <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                      Status
                    </label>
                    <select
                      name="liststatus"
                      value={form.liststatus}
                      onChange={handleChange}
                      required
                      disabled={cancellationLoading}
                      className="w-full px-4 py-3.5 rounded-lg border-2 transition-all duration-200 hover:border-secondary/50"
                      style={{
                        background: 'var(--bg-light)',
                        borderColor: 'var(--border)',
                        color: 'var(--text-primary)'
                      }}
                    >
                      <option value={1}>Pending</option>
                      <option value={1}>Active</option>
                      <option value={2}>Blocked</option>
                    </select>
                  </div>

                </div>
              </div>
            </section>

            <div className="section-divider"></div>

            {/* Amenities & Features */}
            <section className="bg-card rounded-2xl shadow-lg overflow-hidden border" style={{
              background: 'var(--bg-card)',
              borderColor: 'var(--border)',
              boxShadow: '0 4px 6px -1px var(--shadow), 0 2px 4px -1px var(--shadow)'
            }}>
              <div className="p-8 md:p-12">
                <div className="flex items-center mb-8">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center mr-4" style={{ background: 'var(--secondary)' }}>
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="playfair text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>Amenities & Features</h2>
                    <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Highlight what makes your space special</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Common Amenities</h3>
                    {amenitiesLoading ? (
                      <div className="text-center py-8" style={{ color: 'var(--text-secondary)' }}>Loading amenities...</div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {amenities.common_amenities.map((item) => (
                          <label key={item.id} className="flex items-center p-3 rounded-lg cursor-pointer transition-all hover:bg-opacity-50 border" style={{ borderColor: 'var(--border)' }}>
                            <input
                              type="checkbox"
                              checked={form.common_amenities.includes(item.id)}
                              onChange={() => handleAmenityChange("common_amenities", item.id)}
                              className="checkbox-custom mr-3"
                            />
                            <span style={{ color: 'var(--text-primary)' }}>{item.name}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Additional Amenities</h3>
                    {amenitiesLoading ? (
                      <div className="text-center py-8" style={{ color: 'var(--text-secondary)' }}>Loading amenities...</div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {amenities.additional_amenities.map((item) => (
                          <label key={item.id} className="flex items-center p-3 rounded-lg cursor-pointer transition-all hover:bg-opacity-50 border" style={{ borderColor: 'var(--border)' }}>
                            <input
                              type="checkbox"
                              checked={form.additional_amenities.includes(item.id)}
                              onChange={() => handleAmenityChange("additional_amenities", item.id)}
                              className="checkbox-custom mr-3"
                            />
                            <span style={{ color: 'var(--text-primary)' }}>{item.name}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Special Features</h3>
                    {amenitiesLoading ? (
                      <div className="text-center py-8" style={{ color: 'var(--text-secondary)' }}>Loading features...</div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {amenities.special_features.map((item) => (
                          <label key={item.id} className="flex items-center p-3 rounded-lg cursor-pointer transition-all hover:bg-opacity-50 border" style={{ borderColor: 'var(--border)' }}>
                            <input
                              type="checkbox"
                              checked={form.special_features.includes(item.id)}
                              onChange={() => handleAmenityChange("special_features", item.id)}
                              className="checkbox-custom mr-3"
                            />
                            <span style={{ color: 'var(--text-primary)' }}>{item.name}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Safety & Security</h3>
                    {amenitiesLoading ? (
                      <div className="text-center py-8" style={{ color: 'var(--text-secondary)' }}>Loading checks...</div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {amenities.safety_checks.map((item) => (
                          <label key={item.id} className="flex items-center p-3 rounded-lg cursor-pointer transition-all hover:bg-opacity-50 border" style={{ borderColor: 'var(--border)' }}>
                            <input
                              type="checkbox"
                              checked={form.safety_checks.includes(item.id)}
                              onChange={() => handleAmenityChange("safety_checks", item.id)}
                              className="checkbox-custom mr-3"
                            />
                            <span style={{ color: 'var(--text-primary)' }}>{item.name}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </section>

            <div className="section-divider"></div>

            {/* Description & Capacity */}
            <section className="bg-card rounded-2xl shadow-lg overflow-hidden border" style={{
              background: 'var(--bg-card)',
              borderColor: 'var(--border)',
              boxShadow: '0 4px 6px -1px var(--shadow), 0 2px 4px -1px var(--shadow)'
            }}>
              <div className="p-8 md:p-12">
                <div className="flex items-center mb-8">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center mr-4" style={{ background: 'var(--secondary)' }}>
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="playfair text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>Description & Capacity</h2>
                    <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Tell your property's story</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                      Property Description
                    </label>
                    <textarea
                      name="description"
                      value={form.description}
                      onChange={handleChange}
                      required
                      rows={6}
                      placeholder="Paint a vivid picture of your space. What makes it unique? What experiences await your guests?"
                      className="w-full px-4 py-3.5 rounded-lg border-2 transition-all duration-200 hover:border-secondary/50 resize-none"
                      style={{
                        background: 'var(--bg-light)',
                        borderColor: 'var(--border)',
                        color: 'var(--text-primary)'
                      }}
                    />
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div>
                      <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                        Bedrooms
                      </label>
                      <input
                        type="number"
                        name="bedrooms"
                        value={form.bedrooms}
                        onChange={handleChange}
                        required
                        min={0}
                        step={1}
                        className="w-full px-4 py-3.5 rounded-lg border-2 transition-all duration-200 hover:border-secondary/50 text-center text-lg font-semibold"
                        style={{
                          background: 'var(--bg-light)',
                          borderColor: 'var(--border)',
                          color: 'var(--text-primary)'
                        }}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                        Beds
                      </label>
                      <input
                        type="number"
                        name="beds"
                        value={form.beds}
                        onChange={handleChange}
                        required
                        min={0}
                        step={1}
                        className="w-full px-4 py-3.5 rounded-lg border-2 transition-all duration-200 hover:border-secondary/50 text-center text-lg font-semibold"
                        style={{
                          background: 'var(--bg-light)',
                          borderColor: 'var(--border)',
                          color: 'var(--text-primary)'
                        }}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                        Bathrooms
                      </label>
                      <input
                        type="number"
                        name="bathrooms"
                        value={form.bathrooms}
                        onChange={handleChange}
                        required
                        min={0}
                        step={1}
                        className="w-full px-4 py-3.5 rounded-lg border-2 transition-all duration-200 hover:border-secondary/50 text-center text-lg font-semibold"
                        style={{
                          background: 'var(--bg-light)',
                          borderColor: 'var(--border)',
                          color: 'var(--text-primary)'
                        }}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                        Guests
                      </label>
                      <input
                        type="number"
                        name="accommodates"
                        value={form.accommodates}
                        onChange={handleChange}
                        required
                        min={0}
                        step={1}
                        className="w-full px-4 py-3.5 rounded-lg border-2 transition-all duration-200 hover:border-secondary/50 text-center text-lg font-semibold"
                        style={{
                          background: 'var(--bg-light)',
                          borderColor: 'var(--border)',
                          color: 'var(--text-primary)'
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Submit Button Section */}

            <section className="bg-card rounded-2xl shadow-lg overflow-hidden border" style={{
              background: 'var(--bg-card)',
              borderColor: 'var(--border)',
              boxShadow: '0 4px 6px -1px var(--shadow), 0 2px 4px -1px var(--shadow)'
            }}>
              {/* Listing For Toggle */}
              <div className="p-8 md:p-12">
                <label className="block text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                  Who are you adding this listing for?
                </label>
                <div className="flex gap-4 mb-4">
                  <button
                    type="button"
                    className={`px-6 py-3 rounded-lg font-semibold border-2 transition-all duration-200 ${listingFor === 'self' ? 'bg-secondary text-white border-secondary' : 'bg-transparent text-primary border-gray-300 hover:border-secondary'}`}
                    onClick={() => setListingFor('self')}
                  >
                    For Myself
                  </button>
                  <button
                    type="button"
                    className={`px-6 py-3 rounded-lg font-semibold border-2 transition-all duration-200 ${listingFor === 'client' ? 'bg-secondary text-white border-secondary' : 'bg-transparent text-primary border-gray-300 hover:border-secondary'}`}
                    onClick={() => setListingFor('client')}
                  >
                    For Client
                  </button>
                </div>
                {listingFor === 'client' && (
                  <div className="mt-2">
                    <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                      Select Client
                    </label>
                    {clientsLoading ? (
                      <div className="text-sm text-gray-500">Loading clients...</div>
                    ) : clientsError ? (
                      <div className="text-sm text-red-500">{clientsError}</div>
                    ) : (
                      <select
                        name="clientId"
                        value={selectedClientId}
                        onChange={e => setSelectedClientId(e.target.value)}
                        className="w-full px-4 py-3.5 rounded-lg border-2 transition-all duration-200 hover:border-secondary/50"
                        style={{ background: 'var(--bg-light)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                        required
                      >
                        <option value="" disabled>Select a client</option>
                        {clientList.map(client => (
                          <option key={client.id} value={client.id}>
                            {client.firstname} {client.lastname} ({client.email})
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                )}
              </div>
            </section>



            <div className="flex justify-center mt-10 mb-16 px-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full max-w-md px-12 py-5 rounded-lg font-semibold text-lg tracking-wide disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: 'var(--secondary)',
                  color: 'white'
                }}
              >
                <span className="flex items-center justify-center gap-3">
                  {loading ? (
                    <>
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating Your Listing...
                    </>
                  ) : (
                    <>Create Listing</>
                  )}
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}