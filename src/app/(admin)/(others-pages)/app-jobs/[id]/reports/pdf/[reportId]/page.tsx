"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import useAuthStore from "@/store/authStore";
import toast from "react-hot-toast";
import { Loader2, Download, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { PDFViewer, PDFDownloadLink } from "@react-pdf/renderer";
import dynamic from "next/dynamic";
import SiteSafetyPDFDocument from "./SiteSafetyPDFDocument";

interface JobReport {
  id: number;
  report_name: string;
  job_id: number;
  form_data: Record<string, any>;
  layout: string;
  created_at: string;
  updated_at: string;
  job: {
    id: number;
    client_name: string;
    job_title: string;
    notes: string;
    on_site_date: string;
    on_site_time: string;
    status: string;
    due_on: string;
  };
}

const PDFReportPage = () => {
  const params = useParams();
  const jobId = params.id as string;
  const reportId = params.reportId as string;
  
  const [report, setReport] = useState<JobReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [pdfRendering, setPdfRendering] = useState(true);
  const [keepAlive, setKeepAlive] = useState(0);
  
  const { token } = useAuthStore();
  
  useEffect(() => {
    setMounted(true);
    fetchReport();
  }, [reportId]);
  
  useEffect(() => {
    if (mounted && report) {
      // Keep UI responsive with animation frame updates
      let frameId: number;
      let startTime = Date.now();
      
      const animate = () => {
        const elapsed = Date.now() - startTime;
        setKeepAlive(prev => prev + 1);
        
        if (elapsed < 3000) {
          frameId = requestAnimationFrame(animate);
        } else {
          setPdfRendering(false);
        }
      };
      
      frameId = requestAnimationFrame(animate);
      
      return () => {
        if (frameId) {
          cancelAnimationFrame(frameId);
        }
      };
    }
  }, [mounted, report]);
  
  // Handle visibility changes to prevent freezing when tab is hidden
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && pdfRendering) {
        // Tab became visible again, ensure we're still animating
        setKeepAlive(prev => prev + 1);
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [pdfRendering]);
  
  const fetchReport = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/job-reports/${reportId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setReport(response.data);
    } catch (error) {
      console.error("Error fetching report:", error);
      toast.error("Error fetching report");
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-red-500" />
      </div>
    );
  }
  
  if (!report) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-4">Report not found</p>
        <Link
          href={`/app-jobs/${jobId}/reports`}
          className="text-red-500 hover:text-red-700 dark:text-red-400"
        >
          Back to Reports
        </Link>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Action buttons */}
      <div className="bg-white dark:bg-gray-800 p-4 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link
            href={`/app-jobs/${jobId}/reports`}
            className="inline-flex items-center px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Reports
          </Link>
          
          {mounted && (
            <PDFDownloadLink
              document={<SiteSafetyPDFDocument report={report} />}
              fileName={`${report.report_name.replace(/\s+/g, '_')}_${reportId}.pdf`}
              className="inline-flex items-center px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
            >
              {({ loading: pdfLoading }) =>
                pdfLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Preparing PDF...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Download PDF
                  </>
                )
              }
            </PDFDownloadLink>
          )}
        </div>
      </div>
      
      {/* PDF Viewer */}
      <div className="w-full h-[calc(100vh-80px)] relative">
        {/* Loading Overlay */}
        {pdfRendering && (
          <div 
            className="absolute inset-0 bg-white dark:bg-gray-900 z-10 flex flex-col items-center justify-center cursor-wait"
            key={keepAlive}
          >
            <div className="flex space-x-2 mb-4">
              <div 
                className="w-3 h-3 bg-red-500 rounded-full animate-bounce" 
                style={{ animationDelay: '0s', animationDuration: '1s' }}
              ></div>
              <div 
                className="w-3 h-3 bg-red-500 rounded-full animate-bounce" 
                style={{ animationDelay: '0.2s', animationDuration: '1s' }}
              ></div>
              <div 
                className="w-3 h-3 bg-red-500 rounded-full animate-bounce" 
                style={{ animationDelay: '0.4s', animationDuration: '1s' }}
              ></div>
            </div>
            <Loader2 className="w-12 h-12 animate-spin text-red-500 mb-4" />
            <p className="text-gray-600 dark:text-gray-400 text-lg font-medium animate-pulse">
              Generating PDF...
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
              Please keep this tab active
            </p>
          </div>
        )}
        
        {mounted && !pdfRendering && (
          <PDFViewer className="w-full h-full" showToolbar={true}>
            <SiteSafetyPDFDocument report={report} />
          </PDFViewer>
        )}
        
        {/* Render PDF in background during loading to speed up */}
        {mounted && pdfRendering && (
          <div className="absolute opacity-0 pointer-events-none">
            <PDFViewer className="w-full h-full" showToolbar={false}>
              <SiteSafetyPDFDocument report={report} />
            </PDFViewer>
          </div>
        )}
      </div>
    </div>
  );
};

export default PDFReportPage;
