"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";




const Hostings = () => {
  const [userId, setUserId] = useState<number | null>(null);
  const [hostings, setHostings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  // Filters
  const [search, setSearch] = useState("");
  const [city, setCity] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  // Fetch hostings from API when userId is available
  useEffect(() => {
    if (!userId) return;
    const fetchHostings = async () => {
      setLoading(true);
      setError("");
      try {
        const baseUrl = `${process.env.NEXT_PUBLIC_API_URL}/listing/filter`;
        const params = new URLSearchParams();
        if (minPrice) params.set("min_price", minPrice);
        if (maxPrice) params.set("max_price", maxPrice);
        if (selectedLocation) {
          params.set("latitude", String(selectedLocation.lat));
          params.set("longitude", String(selectedLocation.lng));
        }
        const url = params.toString() ? `${baseUrl}?${params.toString()}` : baseUrl;
        const res = await fetch(url, {
          method: "GET",
          headers: { "Content-Type": "application/json" }
        });
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          setHostings(data.data);
        } else {
          setHostings([]);
          setError("No hostings found.");
        }
      } catch (err) {
        setError("Failed to fetch hostings");
        setHostings([]);
      } finally {
        setLoading(false);
      }
    };
    fetchHostings();
  }, [userId, minPrice, maxPrice, selectedLocation]);
  
  useEffect(() => {
    let adminId = null;
    if (typeof window !== "undefined") {
      const authRaw = localStorage.getItem("auth-storage");
      if (authRaw) {
        try {
          const authObj = JSON.parse(authRaw);
          if (authObj?.state?.user?.id) {
            adminId = authObj.state.user.id;
          }
        } catch (e) {
          console.error("Error parsing auth storage:", e);
        }
      }
    }
    setUserId(adminId);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.google?.maps) {
      setMapReady(true);
      return;
    }
    if (document.getElementById("google-maps-script")) return;
    const script = document.createElement("script");
    script.id = "google-maps-script";
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAP_API_KEY}`;
    script.async = true;
    script.onload = () => setMapReady(true);
    document.body.appendChild(script);
  }, []);

  useEffect(() => {
    if (!showMapPicker || !mapReady || !mapContainerRef.current) return;
    if (!window.google?.maps) return;
    const defaultCenter = selectedLocation || { lat: 40.7128, lng: -74.006 };
    if (!mapInstanceRef.current) {
      mapInstanceRef.current = new window.google.maps.Map(mapContainerRef.current, {
        center: defaultCenter,
        zoom: selectedLocation ? 14 : 11,
        mapId: process.env.NEXT_PUBLIC_GOOGLE_MAP_ID || undefined
      });
      mapInstanceRef.current.addListener("click", (event: any) => {
        if (!event.latLng) return;
        setSelectedLocation({ lat: event.latLng.lat(), lng: event.latLng.lng() });
      });
    }
    if (!markerRef.current) {
      markerRef.current = new window.google.maps.Marker({ map: mapInstanceRef.current });
    }
    if (selectedLocation) {
      markerRef.current.setPosition(selectedLocation);
      mapInstanceRef.current.setCenter(selectedLocation);
    }
  }, [showMapPicker, mapReady, selectedLocation]);

  // Unique city list for filter dropdown
  const cityOptions = Array.from(new Set(hostings.map(h => h.city).filter(Boolean)));

  // Filtered hostings
  const filteredHostings = hostings.filter((h) => {
    const matchesSearch =
      h.listingname?.toLowerCase().includes(search.toLowerCase()) ||
      h.streetaddress?.toLowerCase().includes(search.toLowerCase()) ||
      h.city?.toLowerCase().includes(search.toLowerCase());
    const matchesCity = !city || h.city === city;
    const matchesMin = !minPrice || (parseFloat(h.nightlyprice) >= parseFloat(minPrice));
    const matchesMax = !maxPrice || (parseFloat(h.nightlyprice) <= parseFloat(maxPrice));
    return matchesSearch && matchesCity && matchesMin && matchesMax;
  });

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
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-slide-up { animation: slideUp 0.6s ease-out forwards; }
        .animate-fade-in { animation: fadeIn 0.8s ease-out forwards; }
        input:focus, select:focus {
          outline: none;
          border-color: var(--secondary) !important;
          box-shadow: 0 0 0 3px rgba(212, 165, 116, 0.1) !important;
        }
        .card {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 1.25rem;
          box-shadow: 0 4px 6px -1px var(--shadow), 0 2px 4px -1px var(--shadow);
          overflow: hidden;
          transition: box-shadow 0.2s, transform 0.2s;
        }
        .card:hover {
          box-shadow: 0 8px 16px -2px var(--shadow), 0 4px 8px -2px var(--shadow);
          transform: scale(1.025);
        }
        .card-img {
          width: 100%;
          height: 12rem;
          object-fit: cover;
          background: #f3f3f3;
        }
        .card-title {
          font-family: 'Playfair Display', serif;
          font-size: 1.15rem;
          font-weight: 600;
          color: var(--text-primary);
        }
        .card-price {
          color: var(--secondary);
          font-weight: 600;
          font-size: 1rem;
        }
        .card-meta, .card-desc {
          color: var(--text-secondary);
        }
        .card-btn {
          background: var(--secondary);
          color: #fff;
          font-weight: 600;
          border-radius: 0.75rem;
          padding: 0.5rem 1.5rem;
          margin-top: 1rem;
          transition: background 0.2s;
        }
        .card-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        .card-btn:hover:not(:disabled) {
          background: #b8936d;
        }
      `}</style>
      <div className="min-h-screen pt-2 pb-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-block mb-2">
              <div className="w-20 h-1 bg-gradient-to-r from-transparent via-secondary to-transparent mx-auto mb-3"></div>
            </div>
            <h1 className="playfair text-2xl md:text-5xl font-semibold mb-2 tracking-tight" style={{ color: 'var(--text-primary)' }}>Your Hostings</h1>
            <p className="text-base md:text-lg" style={{ color: 'var(--text-secondary)' }}>
              View and manage your hostings
            </p>
          </div>
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-600 dark:text-red-400 text-center">{error}</p>
            </div>
          )}
          {/* Filters Bar */}
          <div className="flex flex-wrap gap-3 w-full bg-white dark:bg-gray-900/40 border border-gray-200 dark:border-gray-800 rounded-xl p-4 shadow-sm mb-4 animate-fade-in">
            <input
              type="text"
              placeholder="Search by name, address, city..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="flex-1 min-w-[180px] max-w-xs rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-800 dark:bg-gray-800 dark:text-white dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <select
              value={city}
              onChange={e => setCity(e.target.value)}
              className="min-w-[120px] rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-800 dark:bg-gray-800 dark:text-white dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary appearance-none pr-8"
              style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'16\' height=\'16\' fill=\'none\' viewBox=\'0 0 24 24\'%3E%3Cpath fill=\'gray\' d=\'M7 10l5 5 5-5H7z\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem center', backgroundSize: '1.25em 1.25em' }}
            >
              <option value="">All Cities</option>
              {cityOptions.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
            <input
              type="number"
              min="0"
              placeholder="Min Price"
              value={minPrice}
              onChange={e => setMinPrice(e.target.value)}
              className="min-w-[90px] max-w-[120px] rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-800 dark:bg-gray-800 dark:text-white dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <input
              type="number"
              min="0"
              placeholder="Max Price"
              value={maxPrice}
              onChange={e => setMaxPrice(e.target.value)}
              className="min-w-[90px] max-w-[120px] rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-800 dark:bg-gray-800 dark:text-white dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              type="button"
              onClick={() => setShowMapPicker((prev) => !prev)}
              className="min-w-[160px] rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-800 dark:bg-gray-800 dark:text-white dark:border-gray-700 hover:border-secondary"
            >
              {showMapPicker ? "Hide Map" : "Select Coordinates"}
            </button>
          </div>
          {showMapPicker && (
            <div className="w-full bg-white dark:bg-gray-900/40 border border-gray-200 dark:border-gray-800 rounded-xl p-4 shadow-sm mb-8 animate-fade-in">
              <div className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                Click on the map to select coordinates.
              </div>
              <div
                ref={mapContainerRef}
                className="h-64 w-full rounded-lg border border-gray-200 dark:border-gray-700"
              />
              <div className="mt-3 flex flex-wrap gap-3">
                <input
                  type="text"
                  readOnly
                  placeholder="Latitude"
                  value={selectedLocation ? selectedLocation.lat.toFixed(6) : ""}
                  className="min-w-[160px] rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-800 dark:bg-gray-800 dark:text-white dark:border-gray-700"
                />
                <input
                  type="text"
                  readOnly
                  placeholder="Longitude"
                  value={selectedLocation ? selectedLocation.lng.toFixed(6) : ""}
                  className="min-w-[160px] rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-800 dark:bg-gray-800 dark:text-white dark:border-gray-700"
                />
                <button
                  type="button"
                  onClick={() => setSelectedLocation(null)}
                  className="min-w-[120px] rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-800 dark:bg-gray-800 dark:text-white dark:border-gray-700 hover:border-secondary"
                >
                  Clear
                </button>
              </div>
            </div>
          )}
          <div className="bg-card rounded-2xl shadow-lg overflow-hidden border animate-slide-up" style={{ background: 'var(--bg-card)', boxShadow: '0 4px 6px -1px var(--shadow), 0 2px 4px -1px var(--shadow)' }}>
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary"></div>
                <span className="ml-4 text-lg text-gray-500 dark:text-gray-300">Loading hostings...</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-8 items-stretch p-8">
                {filteredHostings.length === 0 ? (
                  <div className="col-span-full text-center text-gray-500 dark:text-gray-400 py-12 text-lg">No hostings found.</div>
                ) : (
                  filteredHostings.map((hosting) => (
                    <div key={hosting.id} className="card animate-fade-in relative">
                      <div className="relative">
                        <img
                          src={hosting.photos && hosting.photos.length > 0 ? hosting.photos[0].image_name : "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png?20150327203541"}
                          alt={hosting.listingname}
                          className="card-img"
                        />
                        {/* Status Badge Overlay */}
                        {typeof hosting.liststatus !== 'undefined' && (
                          <span
                            className="absolute top-2 left-2 px-3 py-1 rounded-full text-xs font-semibold shadow"
                            style={{
                              background: hosting.liststatus === 1 ? '#22c55e' : hosting.liststatus === 0 ? '#facc15' : '#ef4444',
                              color: '#fff',
                              zIndex: 2
                            }}
                          >
                            {hosting.liststatus === 1 ? 'Active' : hosting.liststatus === 0 ? 'Pending' : 'Blocked'}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-col p-6 gap-2 h-full">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="card-title line-clamp-2 min-h-[2.5rem]">{hosting.listingname}</h4>
                          <span className="card-price">
                            {hosting.nightlyprice ? `$${hosting.nightlyprice}` : "-"} <span className="text-xs font-normal card-meta">/ night</span>
                          </span>
                        </div>
                        <span className="text-xs card-meta mb-1">{hosting.streetaddress}</span>
                        <span className="text-xs card-meta mb-1">{hosting.city}</span>
                        <p className="text-sm card-desc mb-2 line-clamp-2 min-h-[2.5rem]">{hosting.description}</p>
                        <div className="flex flex-wrap items-center justify-between text-xs card-meta mb-2 gap-2">
                          <span className="flex items-center gap-1"><svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path fill="currentColor" d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm-7 8a7 7 0 1 1 14 0H5Z"/></svg> {hosting.accommodates} Guests</span>
                          <span className="flex items-center gap-1"><svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path fill="currentColor" d="M4 10V7a4 4 0 0 1 8 0v3h1a3 3 0 0 1 3 3v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-5a3 3 0 0 1 3-3h1Zm2-3a2 2 0 1 1 4 0v3H6V7Z"/></svg> {hosting.bedrooms} Bedroom</span>
                          <span className="flex items-center gap-1"><svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path fill="currentColor" d="M2 13.5V19a1 1 0 0 0 1 1h18a1 1 0 0 0 1-1v-5.5a3.5 3.5 0 0 0-7 0V18H9v-4.5a3.5 3.5 0 0 0-7 0ZM7 18v-4.5a1.5 1.5 0 0 1 3 0V18H7Zm7 0v-5.5a1.5 1.5 0 0 1 3 0V18h-3Z"/></svg> {hosting.beds} Bed</span>
                          <span className="flex items-center gap-1"><svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path fill="currentColor" d="M7 10V7a5 5 0 1 1 10 0v3h1a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h1Zm2-3a3 3 0 1 1 6 0v3H9V7Z"/></svg> {hosting.bathrooms} Bath</span>
                        </div>
                        <div className="mt-3 flex justify-center gap-2">
                          <Link href={`/properties/${hosting.id}/view`} passHref legacyBehavior>
                            <button className="card-btn w-full !bg-secondary !text-white !py-2 !px-4 !rounded-md" type="button" style={{flex: 1, minWidth: 0}}>Book</button>
                          </Link>
                          <Link href={``} passHref legacyBehavior>
                            <button className="card-btn w-full !bg-secondary !text-white !py-2 !px-4 !rounded-md" type="button" style={{flex: 1, minWidth: 0}}>Inquiry</button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Hostings;
