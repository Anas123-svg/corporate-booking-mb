"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import React from "react";
import { Elements, CardElement, ElementsConsumer } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import type { Stripe, StripeElements } from "@stripe/stripe-js";

type ListingData = {
    hometype?: string;
    roomtype?: string;
    userid?: number;
    listingname?: string;
    youtubeurl?: string;
    city?: string;
    streetaddress?: string;
    accesscode?: string;
    state?: string;
    zipcode?: string;
    country?: string;
    timezone?: string;
    nightlyprice?: number;
    bookingstyle?: string;
    bookingavailability?: string;
    startdate?: number;
    enddate?: number;
    cancellation?: string;
    cleaningfees?: number;
    servicefees?: number;
    accomadtionfees?: number;
    description?: string;
    bedrooms?: number;
    beds?: number;
    bathrooms?: number;
    accommodates?: number;
    common_amenities?: any[];
    additional_amenities?: any[];
    special_listings?: any[];
    safety_listings?: any[];
    currency?: string;
    photos?: any[];
    latitude?: number;
    longitude?: number;
};

type ReservationData = {
    id: number;
    userid: number;
    hostid: number;
    listid: number;
    fromdate: number;
    todate: number;
    checkin: string;
    checkout: string;
    guests: number;
    pricepernight: string;
    totaldays: number;
    currencycode: string;
    servicefees: string;
    cleaningfees: string;
    total: string;
    booktype: string;
    bookstatus: string;
    orderstatus: string;
    sdstatus: string;
    discount: string;
    platformfee: string;
    accomadtionfees: string;
    stripe_payment_intent_id?: string;
    stripe_status?: string;
    book_admin_id?: number;
    property?: ListingData;
    client_name?: string;
    host_name?: string;
};

// Declare google for TypeScript
declare global {
    interface Window {
        google?: any;
    }
}

const stripePublicKey =
    process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY || process.env.STRIPE_PUBLIC_KEY || "";
const stripePromise = stripePublicKey ? loadStripe(stripePublicKey) : null;

export default function EditReservationPage() {
    const router = useRouter();
    const params = useParams();
    const reservationId = Array.isArray(params?.id) ? params.id[0] : params?.id;

    const [reservation, setReservation] = useState<ReservationData | null>(null);
    const [listing, setListing] = useState<ListingData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null);

    // Form state
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [checkInTime, setCheckInTime] = useState("15:00");
    const [checkOutTime, setCheckOutTime] = useState("11:00");
    const [guests, setGuests] = useState(1);
    const [selectedDuration, setSelectedDuration] = useState<number | null>(null);
    const [updateError, setUpdateError] = useState("");
    const [updateLoading, setUpdateLoading] = useState(false);
    const [updateSuccess, setUpdateSuccess] = useState(false);

    // Calendar visibility state
    const [showCheckInCalendar, setShowCheckInCalendar] = useState(false);
    const [showCheckOutCalendar, setShowCheckOutCalendar] = useState(false);

    const [corporate_book_host_id, setCorporateBookHostId] = useState<number | null>(null);

    // Client selection state
    const [clients, setClients] = useState<any[]>([]);
    const [clientsLoading, setClientsLoading] = useState(false);
    const [clientsError, setClientsError] = useState("");
    const [selectedClientId, setSelectedClientId] = useState<string | number>("");

    // Original reservation pricing
    const [originalPricing, setOriginalPricing] = useState<{
        days: number;
        total: number;
        nightsTotal: number;
        discount: number;
        platformFee: number;
    } | null>(null);

    // Additional charge/refund handling
    const [showPaymentModal, setShowPaymentModal] = useState(false);

    useEffect(() => {
        if (typeof window === "undefined") return;

        const authRaw = localStorage.getItem("auth-storage");
        if (!authRaw) return;

        try {
            const authData = JSON.parse(authRaw);
            setCorporateBookHostId(authData?.state?.user?.id ?? null);
        } catch {
            setCorporateBookHostId(null);
        }
    }, []);

    // Fetch clients for corporate host
    useEffect(() => {
        if (!corporate_book_host_id) return;

        const fetchClients = async () => {
            setClientsLoading(true);
            setClientsError("");
            try {
                const apiBase = process.env.NEXT_PUBLIC_API_URL;
                if (!apiBase) {
                    setClientsError("API base URL is not configured.");
                    return;
                }
                const res = await fetch(
                    `${apiBase}/user/getbycorporatebookhostid/${corporate_book_host_id}`
                );
                const data = await res.json();
                if (data?.success && Array.isArray(data?.clients)) {
                    setClients(data.clients);
                    console.log("Fetched clients:", data.clients);
                } else {
                    setClients([]);
                    setClientsError(data?.message || "Failed to load clients.");
                }
            } catch (err) {
                setClients([]);
                console.error("Error fetching clients:", err);
                setClientsError("Failed to load clients.");
            } finally {
                setClientsLoading(false);
            }
        };

        fetchClients();
    }, [corporate_book_host_id]);

    // Helper function to safely convert to number
    const toNumber = (value: any): number => {
        if (typeof value === 'number') return value;
        if (value === null || value === undefined) return 0;
        const normalized = String(value).replace(/[^0-9.-]/g, "");
        const num = parseFloat(normalized);
        return isNaN(num) ? 0 : num;
    };

    // Convert Unix timestamp to date string
    const timestampToDate = (timestamp: number): string => {
        const date = new Date(timestamp * 1000);
        return date.toISOString().slice(0, 10);
    };

    // Convert date string to Unix timestamp
    const dateToTimestamp = (dateString: string): number => {
        return Math.floor(new Date(dateString).getTime() / 1000);
    };

    const toMysqlDatetime = (timestamp: number): string => {
        const d = new Date(timestamp * 1000);
        return d.toISOString().slice(0, 19).replace('T', ' ');
    };

    // Fetch reservation details on mount
    useEffect(() => {
        if (!reservationId) {
            console.error("No reservation ID found in URL");
            setError("No reservation ID found");
            setLoading(false);
            return;
        }

        console.log("Fetching reservation with ID:", reservationId);

        const fetchReservation = async () => {
            setLoading(true);
            setError("");
            try {
                const url = `${process.env.NEXT_PUBLIC_API_URL}/reservation/view/${reservationId}`;
                console.log("Fetching from URL:", url);

                const res = await fetch(url);

                if (!res.ok) {
                    throw new Error(`HTTP error! status: ${res.status}`);
                }

                const result = await res.json();
                console.log("API Response:", result);

                if (result.success && result.reservation) {
                    const resData = result.reservation;
                    setReservation(resData);
                    
                    // Set property data
                    if (resData.property) {
                        setListing(resData.property);
                        if (resData.property.latitude && resData.property.longitude) {
                            setSelectedLocation({ 
                                lat: resData.property.latitude, 
                                lng: resData.property.longitude 
                            });
                        }
                    }

                    // Pre-populate form fields
                    setFromDate(timestampToDate(resData.fromdate));
                    setToDate(timestampToDate(resData.todate));
                    setCheckInTime(resData.checkin || "15:00");
                    setCheckOutTime(resData.checkout || "11:00");
                    setGuests(resData.guests || 1);
                    setSelectedClientId(resData.userid || "");

                    // Store original pricing
                    setOriginalPricing({
                        days: resData.totaldays || 0,
                        total: toNumber(resData.total),
                        nightsTotal: toNumber(resData.pricepernight) * (resData.totaldays || 0),
                        discount: toNumber(resData.discount),
                        platformFee: toNumber(resData.platformfee),
                    });
                } else {
                    setError(result.message || "Failed to load reservation details.");
                }
            } catch (err) {
                console.error("Error fetching reservation:", err);
                setError(`Error loading reservation details: ${err instanceof Error ? err.message : 'Unknown error'}`);
            } finally {
                setLoading(false);
            }
        };
        fetchReservation();
    }, [reservationId]);

    // Dynamically load Google Maps script
    useEffect(() => {
        if (typeof window === 'undefined') return;
        if (document.getElementById('google-maps-script')) return;
        const script = document.createElement('script');
        script.id = 'google-maps-script';
        script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAP_API_KEY}`;
        script.async = true;
        document.body.appendChild(script);
    }, []);

    // Calculate number of days between dates
    const calculateDays = (from: string, to: string): number => {
        if (!from || !to) return 0;
        const fromMs = new Date(from).getTime();
        const toMs = new Date(to).getTime();
        const diff = toMs - fromMs;
        return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
    };

    // Calculate discount based on duration
    const calculateDiscount = (days: number): number => {
        if (days >= 365) return 0.25;
        if (days >= 180) return 0.20;
        if (days >= 120) return 0.15;
        if (days >= 90) return 0.10;
        if (days >= 60) return 0.05;
        return 0;
    };

    const currencyPrefix = useMemo(() => {
        const raw = listing?.currency;
        if (raw === undefined || raw === null) return "$";
        const trimmed = String(raw).trim();
        if (!trimmed) return "$";
        if (/^\d+(\.\d+)?$/.test(trimmed)) return "$";
        const upper = trimmed.toUpperCase();
        if (upper === "USD" || upper === "AUD" || upper === "CAD" || upper === "NZD") return "$";
        if (upper === "GBP") return "GBP ";
        if (upper === "EUR") return "EUR ";
        return trimmed;
    }, [listing?.currency]);

    // Calculate total price
    const calculateTotalPrice = () => {
        const days = calculateDays(fromDate, toDate);
        const pricePerNight = toNumber(listing?.nightlyprice) || 0;
        const cleaningFees = toNumber(listing?.cleaningfees) || 0;
        const serviceFees = toNumber(listing?.servicefees) || 0;
        const accommodationFees = toNumber(listing?.accomadtionfees) || 0;

        const nightsTotal = days * pricePerNight;
        const discountPercent = calculateDiscount(days) || 0;
        const discount = nightsTotal * discountPercent;
        const nightsAfterDiscount = nightsTotal - discount;
        const platformFee = nightsAfterDiscount * 0.15;
        const subtotal = nightsTotal + cleaningFees + serviceFees + accommodationFees;
        const total = nightsAfterDiscount + cleaningFees + serviceFees + accommodationFees + platformFee;

        return {
            days,
            nightsTotal: parseFloat(nightsTotal.toFixed(2)),
            nightsAfterDiscount: parseFloat(nightsAfterDiscount.toFixed(2)),
            subtotal: parseFloat(subtotal.toFixed(2)),
            discount: parseFloat(discount.toFixed(2)),
            discountPercent,
            platformFee: parseFloat(platformFee.toFixed(2)),
            total: parseFloat(total.toFixed(2)),
        };
    };

    // Handle quick duration selection
    const handleDurationSelect = (days: number) => {
        setSelectedDuration(days);
        if (fromDate) {
            const from = new Date(fromDate);
            const to = new Date(from);
            to.setDate(to.getDate() + days);
            setToDate(to.toISOString().slice(0, 10));
        }
    };

    // Validate reservation update
    const validateUpdate = (): string | null => {
        if (!fromDate || !toDate) return "Please select check-in and check-out dates";

        const from = new Date(fromDate);
        const to = new Date(toDate);
        const days = calculateDays(fromDate, toDate);

        const minCheckoutDate = new Date(from);
        minCheckoutDate.setDate(minCheckoutDate.getDate() + 30);

        if (to < minCheckoutDate) {
            return `Check-out date must be at least 30 days after check-in (minimum: ${minCheckoutDate.toLocaleDateString()})`;
        }

        if (days < 30) return "Minimum booking duration is 30 days";
        if (guests < 1) return "Please specify at least 1 guest";
        if (listing?.accommodates && guests > listing.accommodates) {
            return `Maximum guests allowed: ${listing.accommodates}`;
        }
        return null;
    };

    // Handle reservation update
    const handleUpdate = async (
        e: React.FormEvent,
        stripe?: Stripe | null,
        elements?: StripeElements | null
    ) => {
        e.preventDefault();
        
        const validationError = validateUpdate();
        if (validationError) {
            setUpdateError(validationError);
            return;
        }

        if (!selectedClientId) {
            setUpdateError("Please select a client");
            return;
        }

        if (!reservation) {
            setUpdateError("Reservation data not loaded");
            return;
        }

        const apiBase = process.env.NEXT_PUBLIC_API_URL;
        if (!apiBase) {
            setUpdateError("API base URL is not configured.");
            return;
        }

        const pricing = calculateTotalPrice();
        const priceDifference = originalPricing ? pricing.total - originalPricing.total : 0;

        // If there's an additional charge, we need payment details
        if (priceDifference > 0.01) {
            if (!stripe || !elements) {
                setUpdateError("Payment system is not ready. Please try again.");
                return;
            }
        }

        setUpdateLoading(true);
        setUpdateError("");
        setUpdateSuccess(false);

        const updateData = {
            id: reservation.id,
            userid: selectedClientId,
            listid: reservation.listid,
            hostid: reservation.hostid,
            fromdate: dateToTimestamp(fromDate),
            todate: dateToTimestamp(toDate),
            checkin: checkInTime,
            checkout: checkOutTime,
            guests,
            totaldays: pricing.days,
            pricepernight: toNumber(listing?.nightlyprice),
            discount: pricing.discount,
            total: pricing.total,
            platformfee: pricing.platformFee,
            servicefees: listing?.servicefees,
            cleaningfees: listing?.cleaningfees,
            accomadtionfees: listing?.accomadtionfees,
            currencycode: reservation.currencycode || "USD",
            sitefees: pricing.platformFee,
            booktype: reservation.booktype,
            bookstatus: reservation.bookstatus,
            orderstatus: reservation.orderstatus,
            sdstatus: reservation.sdstatus,
            additional_charge: Math.abs(priceDifference) > 0.01 ? priceDifference : null,
            additional_charge_amount: Math.abs(priceDifference) > 0.01 ? Math.round(Math.abs(priceDifference) * 100) : null,
        };

        try {
            console.log('Sending update request to:', `${apiBase}/reservation/update/${reservationId}`);
            console.log('Update data:', updateData);
            
            const res = await fetch(`${apiBase}/reservation/update/${reservationId}`, {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                body: JSON.stringify(updateData),
            });
            
            console.log('Response status:', res.status);
            console.log('Response ok:', res.ok);
            
            // Try to get the response text first
            const responseText = await res.text();
            console.log('Response text:', responseText);
            
            let data;
            try {
                data = JSON.parse(responseText);
            } catch (parseError) {
                console.error('Failed to parse response as JSON:', parseError);
                setUpdateError(`Server returned invalid response: ${responseText.substring(0, 200)}`);
                setUpdateLoading(false);
                return;
            }
            
            console.log("Update API response:", data);
            
            if (!res.ok || !data || !data.success) {
                setUpdateError(data?.error || data?.message || `Server error: ${res.status}`);
                setUpdateLoading(false);
                return;
            }

            // If there's an additional charge and we got a client secret, process payment
            if (priceDifference > 0.01 && data.clientSecret && stripe && elements) {
                const cardElement = elements.getElement(CardElement);
                if (!cardElement) {
                    setUpdateError("Payment details are missing. Please try again.");
                    setUpdateLoading(false);
                    return;
                }

                const confirmResult = await stripe.confirmCardPayment(data.clientSecret, {
                    payment_method: {
                        card: cardElement,
                    },
                });

                if (confirmResult.error) {
                    setUpdateError(confirmResult.error.message || "Payment failed.");
                    setUpdateLoading(false);
                    return;
                }

                if (confirmResult.paymentIntent?.status !== "succeeded") {
                    setUpdateError("Payment was not completed. Please try again.");
                    setUpdateLoading(false);
                    return;
                }
            }

            setUpdateSuccess(true);
            setTimeout(() => {
                router.push("/bookings");
            }, 2000);
        } catch (err) {
            console.error("Update error:", err);
            setUpdateError("An error occurred while updating. Please try again.");
            setUpdateLoading(false);
        }
    };

    // Google Map Component
    const GoogleMapSection = () => {
        const mapRef = React.useRef<HTMLDivElement>(null);
        React.useEffect(() => {
            if (!window.google || !mapRef.current || !selectedLocation) return;
            const googleMaps = window.google.maps;
            const mapOptions = {
                center: selectedLocation,
                zoom: 15,
                mapId: process.env.NEXT_PUBLIC_GOOGLE_MAP_ID || undefined,
            };
            const map = new googleMaps.Map(mapRef.current, mapOptions);
            new googleMaps.Marker({
                position: selectedLocation,
                map,
            });
        }, []);

        if (!selectedLocation) return null;

        return (
            <div
                ref={mapRef}
                style={{ width: '100%', height: '400px', borderRadius: '12px', border: '2px solid var(--border)' }}
            />
        );
    };

    // Custom Calendar Component
    const Calendar = ({
        selectedDate,
        onSelectDate,
        minDate,
        onClose
    }: {
        selectedDate: string;
        onSelectDate: (date: string) => void;
        minDate?: string;
        onClose: () => void;
    }) => {
        const [currentMonth, setCurrentMonth] = useState(() => {
            if (selectedDate) return new Date(selectedDate);
            if (minDate) return new Date(minDate);
            return new Date();
        });

        const monthNames = ["January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"];

        const getDaysInMonth = (date: Date) => {
            const year = date.getFullYear();
            const month = date.getMonth();
            const firstDay = new Date(year, month, 1);
            const lastDay = new Date(year, month + 1, 0);
            const daysInMonth = lastDay.getDate();
            const startingDayOfWeek = firstDay.getDay();

            const days = [];
            for (let i = 0; i < startingDayOfWeek; i++) {
                days.push(null);
            }
            for (let i = 1; i <= daysInMonth; i++) {
                days.push(i);
            }
            return days;
        };

        const handleDateClick = (day: number) => {
            const year = currentMonth.getFullYear();
            const month = currentMonth.getMonth();
            const date = new Date(year, month, day);
            const dateString = date.toISOString().slice(0, 10);

            if (minDate && dateString < minDate) return;

            onSelectDate(dateString);
            onClose();
        };

        const isDateDisabled = (day: number | null) => {
            if (day === null) return true;
            const year = currentMonth.getFullYear();
            const month = currentMonth.getMonth();
            const date = new Date(year, month, day);
            const dateString = date.toISOString().slice(0, 10);

            if (minDate && dateString < minDate) return true;
            return false;
        };

        const isDateSelected = (day: number | null) => {
            if (day === null || !selectedDate) return false;
            const year = currentMonth.getFullYear();
            const month = currentMonth.getMonth();
            const date = new Date(year, month, day);
            return date.toISOString().slice(0, 10) === selectedDate;
        };

        const days = getDaysInMonth(currentMonth);

        return (
            <div className="absolute z-50 mt-2 p-4 rounded-lg shadow-2xl border-2"
                style={{
                    background: 'var(--bg-card)',
                    borderColor: 'var(--border)',
                    minWidth: '320px'
                }}
            >
                <div className="flex items-center justify-between mb-4">
                    <button
                        type="button"
                        onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                        className="p-2 rounded-lg hover:bg-opacity-10"
                        style={{ color: 'var(--secondary)' }}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                        {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                    </div>
                    <button
                        type="button"
                        onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                        className="p-2 rounded-lg hover:bg-opacity-10"
                        style={{ color: 'var(--secondary)' }}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>

                <div className="grid grid-cols-7 gap-1 mb-2">
                    {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                        <div key={day} className="text-center text-xs font-semibold py-2" style={{ color: 'var(--text-secondary)' }}>
                            {day}
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-7 gap-1">
                    {days.map((day, idx) => (
                        <button
                            key={idx}
                            type="button"
                            disabled={isDateDisabled(day)}
                            onClick={() => day && handleDateClick(day)}
                            className="p-2 text-sm rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:bg-opacity-10"
                            style={{
                                color: isDateSelected(day) ? 'white' : 'var(--text-primary)',
                                background: isDateSelected(day) ? 'var(--secondary)' : 'transparent',
                                fontWeight: isDateSelected(day) ? 'bold' : 'normal'
                            }}
                        >
                            {day || ''}
                        </button>
                    ))}
                </div>

                <div className="mt-4 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-full py-2 rounded-lg text-sm font-semibold"
                        style={{ background: 'var(--bg-light)', color: 'var(--text-primary)' }}
                    >
                        Close
                    </button>
                </div>
            </div>
        );
    };

    // Payment Status Badge Component
    const PaymentStatusBadge = ({ status }: { status: string }) => {
        const getStatusColor = () => {
            switch (status?.toLowerCase()) {
                case 'paid':
                case 'succeeded':
                    return { bg: '#10b981', text: 'white' };
                case 'pending':
                case 'requires_payment_method':
                    return { bg: '#f59e0b', text: 'white' };
                case 'failed':
                case 'canceled':
                    return { bg: '#ef4444', text: 'white' };
                default:
                    return { bg: '#6b7280', text: 'white' };
            }
        };

        const colors = getStatusColor();

        return (
            <span
                className="px-3 py-1 rounded-full text-sm font-semibold"
                style={{ background: colors.bg, color: colors.text }}
            >
                {status || 'Unknown'}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 mx-auto mb-4" style={{ borderColor: 'var(--secondary)' }}></div>
                    <p style={{ color: 'var(--text-secondary)' }}>Loading reservation details...</p>
                </div>
            </div>
        );
    }

    if (error || !reservation || !listing) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-500 mb-4">{error || "Reservation not found"}</p>
                    <button
                        onClick={() => router.back()}
                        className="px-6 py-2 rounded-lg"
                        style={{ background: 'var(--secondary)', color: 'white' }}
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    const pricing = calculateTotalPrice();

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

                .duration-pill {
                    transition: all 0.2s ease;
                }

                .duration-pill:hover {
                    transform: translateY(-2px);
                }

                .duration-pill.selected {
                    background: var(--secondary) !important;
                    color: white !important;
                    border-color: var(--secondary) !important;
                }

                input:focus, select:focus, textarea:focus {
                    outline: none;
                    border-color: var(--secondary) !important;
                    box-shadow: 0 0 0 3px rgba(212, 165, 116, 0.1) !important;
                }
            `}</style>

            <div className="min-h-screen pt-2 pb-10 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <button
                            onClick={() => router.back()}
                            className="mb-4 flex items-center gap-2 px-4 py-2 rounded-lg transition-colors"
                            style={{ color: 'var(--text-secondary)' }}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            Back
                        </button>

                        <h1 className="playfair text-4xl md:text-5xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                            Edit Reservation
                        </h1>
                        <p style={{ color: 'var(--text-secondary)' }}>
                            Reservation #{reservation.id}
                        </p>
                    </div>

                    {/* Reservation Info Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                        <div className="bg-card rounded-xl p-4 border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                            <div className="text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>Client</div>
                            <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                                {reservation.client_name || 'N/A'}
                            </div>
                        </div>
                        <div className="bg-card rounded-xl p-4 border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                            <div className="text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>Host</div>
                            <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                                {reservation.host_name || 'N/A'}
                            </div>
                        </div>
                        <div className="bg-card rounded-xl p-4 border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                            <div className="text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>Payment Status</div>
                            <PaymentStatusBadge status={reservation.sdstatus} />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left Column - Property Details (Read-only) */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Photo Gallery */}
                            {listing.photos && listing.photos.length > 0 && (
                                <div className="bg-card rounded-2xl overflow-hidden border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                                    <div className="grid grid-cols-2 gap-2 p-2">
                                        {listing.photos.slice(0, 4).map((photo: any, idx: number) => (
                                            <img
                                                key={idx}
                                                src={photo.image_name}
                                                alt={`Property ${idx + 1}`}
                                                className={`w-full object-cover rounded-lg ${idx === 0 ? 'col-span-2 h-96' : 'h-48'}`}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Property Info */}
                            <div className="bg-card rounded-2xl p-6 border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                                <h2 className="playfair text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Property Information</h2>

                                <div className="mb-4">
                                    <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                                        {listing.listingname || "Property"}
                                    </h3>
                                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                                        {listing.city && listing.state ? `${listing.city}, ${listing.state}` : listing.city || listing.state || "Location"}
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                    <div className="text-center p-4 rounded-lg" style={{ background: 'var(--bg-light)' }}>
                                        <div className="text-3xl font-bold mb-1" style={{ color: 'var(--secondary)' }}>{listing.bedrooms || 0}</div>
                                        <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Bedrooms</div>
                                    </div>
                                    <div className="text-center p-4 rounded-lg" style={{ background: 'var(--bg-light)' }}>
                                        <div className="text-3xl font-bold mb-1" style={{ color: 'var(--secondary)' }}>{listing.beds || 0}</div>
                                        <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Beds</div>
                                    </div>
                                    <div className="text-center p-4 rounded-lg" style={{ background: 'var(--bg-light)' }}>
                                        <div className="text-3xl font-bold mb-1" style={{ color: 'var(--secondary)' }}>{listing.bathrooms || 0}</div>
                                        <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Bathrooms</div>
                                    </div>
                                    <div className="text-center p-4 rounded-lg" style={{ background: 'var(--bg-light)' }}>
                                        <div className="text-3xl font-bold mb-1" style={{ color: 'var(--secondary)' }}>{listing.accommodates || 0}</div>
                                        <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Guests</div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    <div><span style={{ color: 'var(--text-secondary)' }}>Type:</span> <span style={{ color: 'var(--text-primary)' }}>{listing.hometype}</span></div>
                                    <div><span style={{ color: 'var(--text-secondary)' }}>Room:</span> <span style={{ color: 'var(--text-primary)' }}>{listing.roomtype}</span></div>
                                    <div><span style={{ color: 'var(--text-secondary)' }}>Address:</span> <span style={{ color: 'var(--text-primary)' }}>{listing.streetaddress}</span></div>
                                    <div><span style={{ color: 'var(--text-secondary)' }}>Cancellation:</span> <span style={{ color: 'var(--text-primary)' }}>{listing.cancellation}</span></div>
                                </div>
                            </div>

                            {/* Description */}
                            {listing.description && (
                                <div className="bg-card rounded-2xl p-6 border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                                    <h2 className="playfair text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Description</h2>
                                    <p style={{ color: 'var(--text-secondary)', lineHeight: '1.7' }}>{listing.description}</p>
                                </div>
                            )}

                            {/* Amenities */}
                            <div className="bg-card rounded-2xl p-6 border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                                <h2 className="playfair text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Amenities</h2>

                                <div className="space-y-4">
                                    {listing.common_amenities && listing.common_amenities.length > 0 && (
                                        <div>
                                            <h3 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Common Amenities</h3>
                                            <div className="grid grid-cols-2 gap-2">
                                                {listing.common_amenities.map((a: any, idx: number) => (
                                                    <div key={idx} className="flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
                                                        <svg className="w-4 h-4" style={{ color: 'var(--secondary)' }} fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                        </svg>
                                                        <span>{a.amenity?.name || a.name}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {listing.additional_amenities && listing.additional_amenities.length > 0 && (
                                        <div>
                                            <h3 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Additional Amenities</h3>
                                            <div className="grid grid-cols-2 gap-2">
                                                {listing.additional_amenities.map((a: any, idx: number) => (
                                                    <div key={idx} className="flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
                                                        <svg className="w-4 h-4" style={{ color: 'var(--secondary)' }} fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                        </svg>
                                                        <span>{a.amenity?.name || a.name}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Map */}
                            {selectedLocation && (
                                <div className="bg-card rounded-2xl p-6 border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                                    <h2 className="playfair text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Location</h2>
                                    <GoogleMapSection />
                                </div>
                            )}
                        </div>

                        {/* Right Column - Edit Reservation Form */}
                        <div className="lg:col-span-1 sticky top-4 h-fit">
                            <div className="bg-card rounded-2xl p-6 border shadow-lg" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                                <div className="mb-6">
                                    <div className="flex items-baseline gap-2 mb-2">
                                        <span className="playfair text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
                                            {currencyPrefix}{toNumber(listing.nightlyprice).toFixed(2)}
                                        </span>
                                        <span style={{ color: 'var(--text-secondary)' }}>/ night</span>
                                    </div>
                                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Minimum 30 days</p>
                                </div>

                                {/* Payment Information */}
                                <div className="mb-6 p-4 rounded-lg border" style={{ background: 'var(--bg-light)', borderColor: 'var(--border)' }}>
                                    <h3 className="font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Payment Information</h3>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span style={{ color: 'var(--text-secondary)' }}>Status:</span>
                                            <PaymentStatusBadge status={reservation.sdstatus} />
                                        </div>
                                        <div className="flex justify-between">
                                            <span style={{ color: 'var(--text-secondary)' }}>Order Status:</span>
                                            <span style={{ color: 'var(--text-primary)' }}>{reservation.orderstatus}</span>
                                        </div>
                                        {reservation.stripe_payment_intent_id && (
                                            <div className="flex justify-between">
                                                <span style={{ color: 'var(--text-secondary)' }}>Payment ID:</span>
                                                <span className="text-xs font-mono" style={{ color: 'var(--text-primary)' }}>
                                                    {reservation.stripe_payment_intent_id.substring(0, 15)}...
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <Elements stripe={stripePromise}>
                                    <ElementsConsumer>
                                        {({ stripe, elements }) => (
                                            <form
                                                onSubmit={(e) => handleUpdate(e, stripe, elements)}
                                                className="space-y-4"
                                            >
                                    {/* Check-in Date Selection */}
                                    <div className="relative">
                                        <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Check-in Date</label>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowCheckInCalendar(!showCheckInCalendar);
                                                setShowCheckOutCalendar(false);
                                            }}
                                            className="w-full px-4 py-3 rounded-lg border-2 text-left flex items-center justify-between"
                                            style={{ background: 'var(--bg-light)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                                        >
                                            <span>{fromDate ? new Date(fromDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Select check-in date'}</span>
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                        </button>
                                        {showCheckInCalendar && (
                                            <Calendar
                                                selectedDate={fromDate}
                                                onSelectDate={(date) => {
                                                    setFromDate(date);
                                                    setSelectedDuration(null);
                                                    if (toDate) {
                                                        const from = new Date(date);
                                                        const to = new Date(toDate);
                                                        const diffDays = Math.ceil((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));
                                                        if (diffDays < 30) {
                                                            setToDate("");
                                                        }
                                                    }
                                                }}
                                                minDate={new Date().toISOString().slice(0, 10)}
                                                onClose={() => setShowCheckInCalendar(false)}
                                            />
                                        )}
                                    </div>

                                    {/* Quick Duration Selection */}
                                    {fromDate && (
                                        <div>
                                            <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Quick Select Duration</label>
                                            <div className="grid grid-cols-3 gap-2">
                                                {[60, 90, 120, 180, 365].map((days) => (
                                                    <button
                                                        key={days}
                                                        type="button"
                                                        onClick={() => handleDurationSelect(days)}
                                                        className={`duration-pill px-3 py-2 text-xs font-semibold rounded-lg border-2 ${selectedDuration === days ? 'selected' : ''}`}
                                                        style={{
                                                            background: selectedDuration === days ? 'var(--secondary)' : 'var(--bg-light)',
                                                            borderColor: selectedDuration === days ? 'var(--secondary)' : 'var(--border)',
                                                            color: selectedDuration === days ? 'white' : 'var(--text-primary)'
                                                        }}
                                                    >
                                                        {days >= 365 ? '12mo' : days >= 180 ? '6mo' : `${days}d`}
                                                        {calculateDiscount(days) > 0 && (
                                                            <div className="text-xs mt-1" style={{ opacity: 0.9 }}>
                                                                -{(calculateDiscount(days) * 100).toFixed(0)}%
                                                            </div>
                                                        )}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Check-out Date Selection */}
                                    <div className="relative">
                                        <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                                            Check-out Date
                                            {fromDate && (
                                                <span className="text-xs ml-2" style={{ color: 'var(--text-secondary)' }}>
                                                    (min {(() => {
                                                        const minDate = new Date(fromDate);
                                                        minDate.setDate(minDate.getDate() + 30);
                                                        return minDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                                                    })()})
                                                </span>
                                            )}
                                        </label>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                if (fromDate) {
                                                    setShowCheckOutCalendar(!showCheckOutCalendar);
                                                    setShowCheckInCalendar(false);
                                                }
                                            }}
                                            disabled={!fromDate}
                                            className="w-full px-4 py-3 rounded-lg border-2 text-left flex items-center justify-between disabled:opacity-50 disabled:cursor-not-allowed"
                                            style={{ background: 'var(--bg-light)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                                        >
                                            <span>{toDate ? new Date(toDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Select check-out date'}</span>
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                        </button>
                                        {showCheckOutCalendar && fromDate && (
                                            <Calendar
                                                selectedDate={toDate}
                                                onSelectDate={(date) => {
                                                    setToDate(date);
                                                    setSelectedDuration(null);
                                                }}
                                                minDate={(() => {
                                                    const minDate = new Date(fromDate);
                                                    minDate.setDate(minDate.getDate() + 30);
                                                    return minDate.toISOString().slice(0, 10);
                                                })()}
                                                onClose={() => setShowCheckOutCalendar(false)}
                                            />
                                        )}
                                        {fromDate && toDate && (
                                            <div className="mt-2 p-3 rounded-lg" style={{ background: 'var(--bg-light)' }}>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Duration:</span>
                                                    <span className="font-semibold" style={{ color: pricing.days >= 30 ? 'var(--secondary)' : '#ef4444' }}>
                                                        {pricing.days} {pricing.days === 1 ? 'day' : 'days'}
                                                    </span>
                                                </div>
                                                {pricing.days < 30 && (
                                                    <p className="text-xs mt-1 text-red-500">
                                                        {30 - pricing.days} more {30 - pricing.days === 1 ? 'day' : 'days'} needed
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* Time Selection */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Check-in Time</label>
                                            <input
                                                type="time"
                                                value={checkInTime}
                                                onChange={(e) => setCheckInTime(e.target.value)}
                                                required
                                                className="w-full px-4 py-3 rounded-lg border-2"
                                                style={{ background: 'var(--bg-light)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Check-out Time</label>
                                            <input
                                                type="time"
                                                value={checkOutTime}
                                                onChange={(e) => setCheckOutTime(e.target.value)}
                                                required
                                                className="w-full px-4 py-3 rounded-lg border-2"
                                                style={{ background: 'var(--bg-light)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                                            />
                                        </div>
                                    </div>

                                    {/* Guests */}
                                    <div>
                                        <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                                            Guests {listing.accommodates && `(max ${listing.accommodates})`}
                                        </label>
                                        <input
                                            type="number"
                                            value={guests}
                                            onChange={(e) => setGuests(parseInt(e.target.value) || 1)}
                                            min={1}
                                            max={listing.accommodates || 100}
                                            required
                                            className="w-full px-4 py-3 rounded-lg border-2"
                                            style={{ background: 'var(--bg-light)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                                        />
                                    </div>

                                    {/* Client Selection */}
                                    <div>
                                        <label className="block text-sm font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
                                            Client
                                        </label>

                                        <select
                                            value={selectedClientId}
                                            onChange={(e) => setSelectedClientId(e.target.value)}
                                            className="w-full px-4 py-3 rounded-lg border-2"
                                            style={{ background: "var(--bg-light)", borderColor: "var(--border)", color: "var(--text-primary)" }}
                                            required
                                        >
                                            <option value="">Select a client</option>

                                            {Array.isArray(clients) && clients.length > 0 ? (
                                                clients.map((c) => (
                                                    <option key={c.id} value={c.id}>
                                                        {`${c.firstname ?? c.user?.firstname ?? ""} ${c.lastname ?? c.user?.lastname ?? ""}`.trim()
                                                            || c.email
                                                            || c.user?.email
                                                            || `Client #${c.id}`}
                                                    </option>
                                                ))
                                            ) : (
                                                <option disabled>No clients found</option>
                                            )}
                                        </select>

                                        {clientsLoading && <p className="text-xs mt-2" style={{ color: 'var(--text-secondary)' }}>Loading clients…</p>}
                                        {clientsError && <p className="text-xs mt-2 text-red-500">{clientsError}</p>}
                                    </div>

                                    {/* Card Details - Only show if there's an additional charge */}
                                    {originalPricing && pricing.total > originalPricing.total && pricing.days >= 30 && (
                                        <div>
                                            <label className="block text-sm font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
                                                Card Details for Additional Charge
                                            </label>
                                            <div className="mb-2 p-3 rounded-lg text-xs" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#dc2626' }}>
                                                Additional payment of {currencyPrefix}{(pricing.total - originalPricing.total).toFixed(2)} required
                                            </div>
                                            <div
                                                className="w-full px-4 py-3 rounded-lg border-2"
                                                style={{ background: "var(--bg-light)", borderColor: "var(--border)" }}
                                            >
                                                <CardElement
                                                    options={{
                                                        style: {
                                                            base: {
                                                                color: "var(--text-primary)",
                                                                fontFamily: "Inter, sans-serif",
                                                                fontSize: "16px",
                                                                "::placeholder": {
                                                                    color: "var(--text-secondary)",
                                                                },
                                                            },
                                                            invalid: {
                                                                color: "#ef4444",
                                                            },
                                                        },
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* Price Breakdown */}
                                    {fromDate && toDate && pricing.days >= 30 && (
                                        <div className="pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
                                            {/* Original Price Section (if dates changed) */}
                                            {originalPricing && (
                                                originalPricing.days !== pricing.days || 
                                                Math.abs(originalPricing.total - pricing.total) > 0.01
                                            ) && (
                                                <div className="mb-4 p-4 rounded-lg border-2" style={{ 
                                                    background: 'var(--bg-light)', 
                                                    borderColor: 'var(--secondary)',
                                                    borderStyle: 'dashed'
                                                }}>
                                                    <div className="text-xs font-semibold mb-3" style={{ color: 'var(--text-secondary)' }}>
                                                        ORIGINAL RESERVATION
                                                    </div>
                                                    <div className="space-y-2 text-sm">
                                                        <div className="flex justify-between">
                                                            <span style={{ color: 'var(--text-secondary)' }}>Duration:</span>
                                                            <span style={{ color: 'var(--text-primary)' }}>
                                                                {originalPricing.days} {originalPricing.days === 1 ? 'day' : 'days'}
                                                            </span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span style={{ color: 'var(--text-secondary)' }}>Nights subtotal:</span>
                                                            <span style={{ color: 'var(--text-primary)' }}>
                                                                {currencyPrefix}{originalPricing.nightsTotal.toFixed(2)}
                                                            </span>
                                                        </div>
                                                        {originalPricing.discount > 0 && (
                                                            <div className="flex justify-between" style={{ color: 'var(--secondary)' }}>
                                                                <span>Discount:</span>
                                                                <span>-{currencyPrefix}{originalPricing.discount.toFixed(2)}</span>
                                                            </div>
                                                        )}
                                                        <div className="flex justify-between">
                                                            <span style={{ color: 'var(--text-secondary)' }}>Platform fee:</span>
                                                            <span style={{ color: 'var(--text-primary)' }}>
                                                                {currencyPrefix}{originalPricing.platformFee.toFixed(2)}
                                                            </span>
                                                        </div>
                                                        <div className="flex justify-between items-center pt-2 border-t font-semibold" style={{ borderColor: 'var(--border)' }}>
                                                            <span style={{ color: 'var(--text-primary)' }}>Original Total:</span>
                                                            <span style={{ color: 'var(--text-primary)' }}>
                                                                {currencyPrefix}{originalPricing.total.toFixed(2)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* New Price Breakdown */}
                                            <div className="space-y-2 text-sm mb-4">
                                                {originalPricing && (
                                                    originalPricing.days !== pricing.days || 
                                                    Math.abs(originalPricing.total - pricing.total) > 0.01
                                                ) && (
                                                    <div className="text-xs font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>
                                                        NEW RESERVATION
                                                    </div>
                                                )}
                                                <div className="flex justify-between">
                                                    <span style={{ color: 'var(--text-secondary)' }}>
                                                        {currencyPrefix}{toNumber(listing.nightlyprice).toFixed(2)} × {pricing.days} nights
                                                    </span>
                                                    <span style={{ color: 'var(--text-primary)' }}>
                                                        {currencyPrefix}{pricing.nightsTotal.toFixed(2)}
                                                    </span>
                                                </div>
                                                {toNumber(listing.cleaningfees) > 0 && (
                                                    <div className="flex justify-between">
                                                        <span style={{ color: 'var(--text-secondary)' }}>Cleaning fee</span>
                                                        <span style={{ color: 'var(--text-primary)' }}>{currencyPrefix}{toNumber(listing.cleaningfees).toFixed(2)}</span>
                                                    </div>
                                                )}
                                                {toNumber(listing.servicefees) > 0 && (
                                                    <div className="flex justify-between">
                                                        <span style={{ color: 'var(--text-secondary)' }}>Service fee</span>
                                                        <span style={{ color: 'var(--text-primary)' }}>{currencyPrefix}{toNumber(listing.servicefees).toFixed(2)}</span>
                                                    </div>
                                                )}
                                                {toNumber(listing.accomadtionfees) > 0 && (
                                                    <div className="flex justify-between">
                                                        <span style={{ color: 'var(--text-secondary)' }}>Accommodation fee</span>
                                                        <span style={{ color: 'var(--text-primary)' }}>{currencyPrefix}{toNumber(listing.accomadtionfees).toFixed(2)}</span>
                                                    </div>
                                                )}
                                                {pricing.discount > 0 && (
                                                    <div className="flex justify-between" style={{ color: 'var(--secondary)' }}>
                                                        <span>Discount ({(pricing.discountPercent * 100).toFixed(0)}%)</span>
                                                        <span>-{currencyPrefix}{pricing.discount.toFixed(2)}</span>
                                                    </div>
                                                )}
                                                <div className="flex justify-between items-center">
                                                    <span style={{ color: 'var(--text-secondary)' }}>
                                                        Platform fee (15%)
                                                        <span title="Calculated on discounted nights total"> ⓘ</span>
                                                    </span>
                                                    <div className="text-right">
                                                        <div style={{ color: 'var(--text-primary)' }}>
                                                            {currencyPrefix}{pricing.platformFee.toFixed(2)}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Total and Difference */}
                                            <div className="flex justify-between items-center pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
                                                <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                                                    {originalPricing && (
                                                        originalPricing.days !== pricing.days || 
                                                        Math.abs(originalPricing.total - pricing.total) > 0.01
                                                    ) ? 'New Total' : 'Total'}
                                                </span>
                                                <span className="playfair text-2xl font-bold" style={{ color: 'var(--secondary)' }}>
                                                    {currencyPrefix}{pricing.total.toFixed(2)}
                                                </span>
                                            </div>

                                            {/* Price Difference Indicator */}
                                            {originalPricing && (
                                                originalPricing.days !== pricing.days || 
                                                Math.abs(originalPricing.total - pricing.total) > 0.01
                                            ) && (
                                                <div className="mt-4 p-4 rounded-lg" style={{ 
                                                    background: pricing.total > originalPricing.total 
                                                        ? 'rgba(239, 68, 68, 0.1)' 
                                                        : 'rgba(16, 185, 129, 0.1)',
                                                    border: `2px solid ${pricing.total > originalPricing.total ? '#ef4444' : '#10b981'}`
                                                }}>
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            {pricing.total > originalPricing.total ? (
                                                                <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                                                                </svg>
                                                            ) : (
                                                                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                                                                </svg>
                                                            )}
                                                            <span className="font-semibold" style={{ 
                                                                color: pricing.total > originalPricing.total ? '#ef4444' : '#10b981' 
                                                            }}>
                                                                {pricing.total > originalPricing.total ? 'Additional Payment Required' : 'Refund Due'}
                                                            </span>
                                                        </div>
                                                        <span className="font-bold text-lg" style={{ 
                                                            color: pricing.total > originalPricing.total ? '#ef4444' : '#10b981' 
                                                        }}>
                                                            {pricing.total > originalPricing.total ? '+' : '-'}
                                                            {currencyPrefix}{Math.abs(pricing.total - originalPricing.total).toFixed(2)}
                                                        </span>
                                                    </div>
                                                    <div className="mt-2 text-xs" style={{ 
                                                        color: pricing.total > originalPricing.total ? '#dc2626' : '#059669' 
                                                    }}>
                                                        {pricing.total > originalPricing.total 
                                                            ? 'Client will be charged the difference upon update' 
                                                            : 'Client will be refunded the difference upon update'}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {updateError && (
                                        <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm">
                                            {updateError}
                                        </div>
                                    )}

                                    {updateSuccess && (
                                        <div className="p-3 rounded-lg bg-green-50 text-green-600 text-sm">
                                            Reservation updated successfully! Redirecting...
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={updateLoading || pricing.days < 30 || updateSuccess}
                                        className="w-full py-4 rounded-lg font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                        style={{ background: 'var(--secondary)' }}
                                    >
                                        {updateLoading ? 'Updating...' : 'UPDATE RESERVATION'}
                                    </button>

                                    {pricing.days > 0 && pricing.days < 30 && (
                                        <p className="text-center text-sm text-red-500">
                                            Minimum booking is 30 days ({30 - pricing.days} more days needed)
                                        </p>
                                    )}
                                </form>
                                        )}
                                    </ElementsConsumer>
                                </Elements>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}