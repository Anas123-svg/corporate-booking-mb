"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BarChart2, CheckCircle, XCircle } from "lucide-react";
import dynamic from "next/dynamic";

const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

const barOptions = {
  chart: { type: "bar" as const, height: 220, toolbar: { show: false }, fontFamily: "Outfit, sans-serif" },
  colors: ["#b8936d"],
  plotOptions: { bar: { borderRadius: 6, columnWidth: "40%" } },
  dataLabels: { enabled: false },
  xaxis: { categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"] },
  yaxis: { labels: { style: { fontSize: "13px", colors: ["#6B7280"] } } },
  grid: { yaxis: { lines: { show: true } } },
  tooltip: { y: { formatter: (val: number) => `${val}` } },
};

const areaOptions = {
  chart: { type: "area" as const, height: 220, toolbar: { show: false }, fontFamily: "Outfit, sans-serif" },
  colors: ["#997c60", "#f90606"],
  stroke: { curve: "smooth" as "smooth", width: [2, 2] },
  fill: { type: "gradient", gradient: { opacityFrom: 0.55, opacityTo: 0 } },
  dataLabels: { enabled: false },
  xaxis: { categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"] },
  yaxis: { labels: { style: { fontSize: "13px", colors: ["#6B7280"] } } },
  grid: { yaxis: { lines: { show: true } } },
  tooltip: { y: { formatter: (val: number) => `${val}` } },
};
type DashboardStats = {
  total_bookings: number;
  active_bookings: number;
  cancelled_bookings: number;
};

type DashboardCharts = {
  bookings_per_month: number[];
  active_per_month: number[];
  cancelled_per_month: number[];
};

type LatestBooking = {
  property: string;
  guest: string;
  check_in: string;
  check_out: string;
  status: string;
};

export default function Dashboard() {

  ///copy for mishor as well///
  const router = useRouter();
  const [showDashboard, setShowDashboard] = useState(false);
  const [stats, setStats] = useState<DashboardStats>({
    total_bookings: 0,
    active_bookings: 0,
    cancelled_bookings: 0,
  });
  const [charts, setCharts] = useState<DashboardCharts>({
    bookings_per_month: [],
    active_per_month: [],
    cancelled_per_month: [],
  });
  const [latestBookings, setLatestBookings] = useState<LatestBooking[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      router.replace("/signin");
    } else {
      setShowDashboard(true);
    }
  }, [router]);

  useEffect(() => {
    if (!showDashboard) return;

    const fetchDashboardStats = async () => {
      setLoading(true);
      setError("");
      let corporateBookId = null;

      if (typeof window !== "undefined") {
        const authRaw = localStorage.getItem("auth-storage");
        if (authRaw) {
          try {
            const authObj = JSON.parse(authRaw);
            if (authObj?.state?.user?.id) {
              corporateBookId = authObj.state.user.id;
            }
          } catch (e) {
            console.error("Error parsing auth storage:", e);
          }
        }
      }

      if (!corporateBookId) {
        setError("Corporate Book ID not found. Please login again.");
        setLoading(false);
        return;
      }

      try {
        const url = `${process.env.NEXT_PUBLIC_API_URL}/reservation/dashboardstats/${corporateBookId}`;
        const res = await fetch(url, {
          method: "GET",
          headers: { "Content-Type": "application/json" }
        });
        const data = await res.json();
        if (data.success && data.data) {
          setStats({
            total_bookings: data.data?.stats?.total_bookings ?? 0,
            active_bookings: data.data?.stats?.active_bookings ?? 0,
            cancelled_bookings: data.data?.stats?.cancelled_bookings ?? 0,
          });
          setCharts({
            bookings_per_month: Array.isArray(data.data?.charts?.bookings_per_month)
              ? data.data.charts.bookings_per_month
              : [],
            active_per_month: Array.isArray(data.data?.charts?.active_per_month)
              ? data.data.charts.active_per_month
              : [],
            cancelled_per_month: Array.isArray(data.data?.charts?.cancelled_per_month)
              ? data.data.charts.cancelled_per_month
              : [],
          });
          setLatestBookings(Array.isArray(data.data?.latest_bookings) ? data.data.latest_bookings : []);
        } else {
          setStats({ total_bookings: 0, active_bookings: 0, cancelled_bookings: 0 });
          setCharts({ bookings_per_month: [], active_per_month: [], cancelled_per_month: [] });
          setLatestBookings([]);
        }
      } catch (err) {
        console.error("Error fetching dashboard stats:", err);
        setError("Failed to fetch dashboard stats");
        setStats({ total_bookings: 0, active_bookings: 0, cancelled_bookings: 0 });
        setCharts({ bookings_per_month: [], active_per_month: [], cancelled_per_month: [] });
        setLatestBookings([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, [showDashboard]);

  if (!showDashboard) return null;
  ///copy for mishor as well///

  const normalizeSeries = (values: number[]) => (values.length === 12 ? values : Array(12).fill(0));
  const summaryCards = [
    {
      label: "Total Bookings",
      value: stats.total_bookings,
      icon: <BarChart2 className="w-6 h-6 text-black dark:text-white" />,
      bg: "bg-[#ead5c1]/20 dark:bg-[#b8936d]/25",
    },
    {
      label: "Active Bookings",
      value: stats.active_bookings,
      icon: <CheckCircle className="w-6 h-6 text-green-600" />,
      bg: "bg-green-50 dark:bg-green-900/20",
    },
    {
      label: "Cancelled Bookings",
      value: stats.cancelled_bookings,
      icon: <XCircle className="w-6 h-6 text-red-600" />,
      bg: "bg-red-50 dark:bg-red-900/20",
    },
  ];
  const barSeries = [
    { name: "Bookings", data: normalizeSeries(charts.bookings_per_month) },
  ];
  const areaSeries = [
    { name: "Active", data: normalizeSeries(charts.active_per_month) },
    { name: "Cancelled", data: normalizeSeries(charts.cancelled_per_month) },
  ];

  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6">
      {/* Summary Cards */}
      <div className="col-span-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {summaryCards.map((card) => (
          <div key={card.label} className={`rounded-2xl p-6 flex flex-col items-center ${card.bg} border border-gray-200 dark:border-gray-800`}>
            <div className="mb-2">{card.icon}</div>
            <div className="text-2xl font-bold text-gray-800 dark:text-white/90">{card.value}</div>
            <div className="text-sm text-gray-500 dark:text-gray-300">{card.label}</div>
          </div>
        ))}
      </div>
      {error && (
        <div className="col-span-12 mb-6">
          <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-red-700">
            {error}
          </div>
        </div>
      )}
      {/* Dashboard summary text */}
      <div className="col-span-12 mb-6">
        <div className="rounded-xl bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-gray-800 p-5 text-gray-700 dark:text-gray-300 text-base">
          Welcome to your booking dashboard. Here you can view a summary of all bookings, track active and cancelled bookings, and analyze booking trends. Stay updated with the latest activity below.
        </div>
      </div>
      {/* Booking Statistics Graphs */}
      <div className="col-span-12 xl:col-span-6">
        <div className="rounded-2xl border border-gray-200 bg-white px-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-2">Bookings Per Month</h3>
          <ReactApexChart options={barOptions} series={barSeries} type="bar" height={220} />
        </div>
      </div>
      <div className="col-span-12 xl:col-span-6">
        <div className="rounded-2xl border border-gray-200 bg-white px-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-2">Active vs Cancelled</h3>
          <ReactApexChart options={areaOptions} series={areaSeries} type="area" height={220} />
        </div>
      </div>

      {/* Latest Bookings Table */}
      <div className="col-span-12 mb-6">
        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] p-5 sm:p-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">Latest Bookings</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-900/20">
                  <th className="px-4 py-2 text-left font-semibold text-gray-600 dark:text-gray-300">Property</th>
                  <th className="px-4 py-2 text-left font-semibold text-gray-600 dark:text-gray-300">Guest</th>
                  <th className="px-4 py-2 text-left font-semibold text-gray-600 dark:text-gray-300">Check-In</th>
                  <th className="px-4 py-2 text-left font-semibold text-gray-600 dark:text-gray-300">Check-Out</th>
                  <th className="px-4 py-2 text-left font-semibold text-gray-600 dark:text-gray-300">Status</th>
                </tr>
              </thead>
              <tbody>
                {latestBookings.length === 0 ? (
                  <tr className="border-b border-gray-100 dark:border-gray-800">
                    <td className="px-4 py-6 text-center text-gray-500 dark:text-gray-400" colSpan={5}>
                      {loading ? "Loading latest bookings..." : "No latest bookings found."}
                    </td>
                  </tr>
                ) : (
                  latestBookings.map((booking, idx) => {
                    const statusValue = (booking.status || "").toLowerCase();
                    const isActive = statusValue === "active" || statusValue === "accepted";
                    return (
                      <tr key={idx} className="border-b border-gray-100 dark:border-gray-800">
                        <td className="px-4 py-2 whitespace-nowrap text-gray-800 dark:text-white/90">{booking.property}</td>
                        <td className="px-4 py-2 whitespace-nowrap">{booking.guest}</td>
                        <td className="px-4 py-2 whitespace-nowrap">{booking.check_in}</td>
                        <td className="px-4 py-2 whitespace-nowrap">{booking.check_out}</td>
                        <td className="px-4 py-2 whitespace-nowrap">
                          <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${isActive ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300" : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"}`}>
                            {booking.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
