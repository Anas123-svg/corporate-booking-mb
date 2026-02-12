import ThemeTogglerTwo from "@/components/common/ThemeTogglerTwo";
import { ThemeProvider } from "@/context/ThemeContext";
import React from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative p-6 bg-white z-1 dark:bg-gray-900 sm:p-0">
      <ThemeProvider>
        <div className="relative flex w-full min-h-screen flex-col dark:bg-gray-900 sm:p-0 lg:flex-row">
          <div className="flex w-full flex-1 items-center justify-center">
            {children}
          </div>
          <div className="hidden lg:flex lg:w-1/2 items-center justify-center px-10">
            <div className="w-full max-w-md rounded-3xl border border-gray-200 bg-white/80 p-10 shadow-theme-lg backdrop-blur dark:border-gray-800 dark:bg-white/[0.03]">
              <div className="mb-6 inline-flex items-center gap-3 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 dark:border-gray-800 dark:bg-gray-900/40 dark:text-gray-200">
                Corporate Booking Panel
              </div>
              <h2 className="mb-3 text-2xl font-semibold text-gray-900 dark:text-white/90">
                Manage bookings with clarity
              </h2>
              <p className="mb-6 text-sm text-gray-600 dark:text-gray-400">
                Track reservations, invoices, and client activity in one secure place. Keep your team aligned and operations smooth.
              </p>
              <div className="grid gap-4">
                <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 dark:border-gray-800 dark:bg-gray-900/40 dark:text-gray-300">
                  Centralized view of active and cancelled bookings
                </div>
                <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 dark:border-gray-800 dark:bg-gray-900/40 dark:text-gray-300">
                  Quick access to invoices and payment status
                </div>
                <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 dark:border-gray-800 dark:bg-gray-900/40 dark:text-gray-300">
                  Client onboarding with streamlined setup
                </div>
              </div>
            </div>
          </div>
          <div className="fixed bottom-6 right-6 z-50 hidden sm:block">
            <ThemeTogglerTwo />
          </div>
        </div>
      </ThemeProvider>
    </div>
  );
}
