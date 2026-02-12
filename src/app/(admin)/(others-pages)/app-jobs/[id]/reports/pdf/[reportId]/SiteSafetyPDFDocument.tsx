import React, { JSX } from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image as PDFImage,
  Font,
} from "@react-pdf/renderer";

// Register fonts (optional - fallback to built-in fonts if not available)
// You can add custom fonts here if needed

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

interface Props {
  report: JobReport;
}

const styles = StyleSheet.create({
  // Cover Page Styles
  coverPage: {
    padding: 24,
    position: "relative",
    height: "100%",
  },
  coverWatermark: {
    position: "absolute",
    right: -50,
    bottom: -50,
    width: 300,
    height: 300,
    opacity: 0.1,
  },
  coverHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 60,
  },
  coverLogo: {
    maxWidth: 200,
    maxHeight: 150,
  },
  coverPhoto: {
    width: 200,
    height: 120,
    borderRadius: 8,
  },
  coverTitleContainer: {
    marginBottom: 80,
  },
  coverTitle1: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#2D3748",
  },
  coverTitle2: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#E53E3E",
  },
  coverInfoBox: {
    padding: 20,
    backgroundColor: "#F7FAFC",
    borderRadius: 8,
    marginBottom: 60,
  },
  coverInfoTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#E53E3E",
    marginBottom: 4,
  },
  coverInfoValue: {
    fontSize: 14,
    color: "#2D3748",
    marginBottom: 12,
  },
  coverFooter: {
    position: "absolute",
    bottom: 24,
    left: 24,
    right: 24,
    padding: 20,
    backgroundColor: "#2D3748",
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  coverFooterText: {
    color: "#FFFFFF",
    fontSize: 12,
  },
  coverFooterLogo: {
    width: 150,
    height: 60,
  },

  // Main Page Styles
  page: {
    padding: 20,
    fontSize: 9,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 6,
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  headerLogo: {
    width: 150,
    height: 45,
  },
  footer: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#9CA3AF",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  footerText: {
    fontSize: 8,
  },

  // Tables
  table: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#9CA3AF",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#9CA3AF",
  },
  tableCell: {
    padding: 4,
    fontSize: 9,
    borderRightWidth: 1,
    borderRightColor: "#9CA3AF",
  },
  tableCellLabel: {
    padding: 4,
    fontSize: 9,
    fontWeight: "bold",
    backgroundColor: "#E5E7EB",
    borderRightWidth: 1,
    borderRightColor: "#9CA3AF",
  },
  tableHeader: {
    padding: 6,
    fontSize: 9,
    fontWeight: "bold",
    backgroundColor: "#D1D5DB",
    textAlign: "center",
    borderRightWidth: 1,
    borderRightColor: "#9CA3AF",
  },

  // Inspection Table
  inspectionTable: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#9CA3AF",
    marginBottom: 12,
  },
  inspectionHeaderRow: {
    flexDirection: "row",
    backgroundColor: "#D1D5DB",
    borderBottomWidth: 1,
    borderBottomColor: "#9CA3AF",
    minHeight: 32,
  },
  inspectionRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#9CA3AF",
    minHeight: 60,
  },
  cellNumber: {
    width: "5%",
    padding: 6,
    textAlign: "center",
    fontSize: 8,
    fontWeight: "bold",
    borderRightWidth: 1,
    borderRightColor: "#9CA3AF",
  },
  cellSection: {
    width: "30%",
    padding: 6,
    fontSize: 9,
    borderRightWidth: 1,
    borderRightColor: "#9CA3AF",
  },
  cellCheck: {
    width: "10%",
    padding: 6,
    textAlign: "center",
    fontSize: 9,
    fontWeight: "bold",
    borderRightWidth: 1,
    borderRightColor: "#9CA3AF",
  },
  cellStatus: {
    width: "15%",
    padding: 4,
    textAlign: "center",
    fontSize: 7,
    fontWeight: "bold",
    borderRightWidth: 1,
    borderRightColor: "#9CA3AF",
  },
  cellComments: {
    width: "25%",
    padding: 6,
    fontSize: 8,
    borderRightWidth: 1,
    borderRightColor: "#9CA3AF",
  },
  cellImages: {
    width: "15%",
    padding: 4,
    alignItems: "center",
  },
  sectionImage: {
    width: 70,
    height: 50,
    marginBottom: 2,
  },

  // Comments Table
  commentsTable: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#9CA3AF",
    marginTop: 12,
  },
  commentsHeaderRow: {
    flexDirection: "row",
    backgroundColor: "#E5E7EB",
    borderBottomWidth: 1,
    borderBottomColor: "#9CA3AF",
    minHeight: 32,
  },
  commentsRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#9CA3AF",
    minHeight: 80,
  },
  commentsArea: {
    width: "20%",
    padding: 8,
    fontSize: 9,
    borderRightWidth: 1,
    borderRightColor: "#9CA3AF",
  },
  commentsText: {
    width: "55%",
    padding: 8,
    fontSize: 9,
    borderRightWidth: 1,
    borderRightColor: "#9CA3AF",
  },
  commentsPhoto: {
    width: "25%",
    padding: 8,
    alignItems: "center",
  },
  commentImage: {
    width: 60,
    height: 60,
  },

  // Signatures
  signatureTable: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#9CA3AF",
    marginTop: 12,
  },
  signatureRow: {
    flexDirection: "row",
    minHeight: 32,
  },
  signatureCell: {
    width: "25%",
    padding: 8,
    borderRightWidth: 1,
    borderRightColor: "#9CA3AF",
  },
  signatureCellLast: {
    width: "25%",
    padding: 8,
  },
  signatureImage: {
    height: 60,
  },

  // Utilities
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
    marginTop: 12,
  },
  smallTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 8,
    marginTop: 12,
  },
});

const SiteSafetyPDFDocument: React.FC<Props> = ({ report }) => {
  const formData = report.form_data || {};
  const job = report.job;

  // Helper function to format base64 images
  const formatBase64Image = (imageData: string | null | undefined): string | null => {
    if (!imageData) return null;
    // If it already has a data URI prefix, return as is
    if (imageData.startsWith('data:')) return imageData;
    // Otherwise, add the PNG data URI prefix
    return `data:image/png;base64,${imageData}`;
  };

  // Extract data
  const inspectionAnswers = (formData.inspectionAnswers || {}) as Record<string, string>;
  const sectionComments = (formData.sectionComments || {}) as Record<string, string[]>;
  const sectionImages = (formData.sectionImages || {}) as Record<string, string[]>;
  const sectionVisibility = (formData.sectionVisibility || {}) as Record<string, boolean>;
  const sectionStatus = (formData.sectionStatus || {}) as Record<string, string>;
  const inspectionSections = (formData.inspectionSections || {}) as Record<string, string[]>;
  const comments = (formData.comments || []) as Array<{
    text: string;
    imagePath?: string;
    area?: string;
  }>;

  // Helper to get answer for a question
  const getAnswer = (section: string, question: string): string | null => {
    const key = `${section}|${question}`;
    if (inspectionAnswers[key]) return inspectionAnswers[key];
    if (inspectionAnswers[question]) return inspectionAnswers[question];
    return null;
  };

  // Build inspection rows
  const buildInspectionRows = () => {
    const rows: JSX.Element[] = [];
    let counter = 1;

    Object.entries(inspectionSections).forEach(([sectionTitle, questions]) => {
      const isVisible = sectionVisibility[sectionTitle] ?? true;
      if (!isVisible) return;

      questions.forEach((question) => {
        const answer = getAnswer(sectionTitle, question);
        const status = sectionStatus[sectionTitle] || "";
        const sectionCommentList = sectionComments[sectionTitle] || [];
        const commentText = sectionCommentList.join("\n");
        const images = sectionImages[sectionTitle] || [];

        // Determine colors
        let checkBgColor = "#FFFFFF";
        if (answer === "Yes") checkBgColor = "#BBF7D0";
        else if (answer === "No") checkBgColor = "#FCA5A5";

        let statusBgColor = "#FFFFFF";
        let statusText = "";
        if (status === "Red") {
          statusBgColor = "#FCA5A5";
          statusText = "Rectify immediately";
        } else if (status === "Amber") {
          statusBgColor = "#FED7AA";
          statusText = "Within 1 week/7 days";
        } else if (status === "Green") {
          statusBgColor = "#BBF7D0";
          statusText = "All good";
        }

        rows.push(
          <View key={`${sectionTitle}-${question}-${counter}`} style={styles.inspectionRow} wrap={false}>
            <View style={[styles.cellNumber]}>
              <Text>{String(counter).padStart(2, "0")}</Text>
            </View>
            <View style={[styles.cellSection]}>
              <Text>{question}</Text>
            </View>
            <View style={[styles.cellCheck, { backgroundColor: checkBgColor }]}>
              <Text>{answer || ""}</Text>
            </View>
            <View style={[styles.cellStatus, { backgroundColor: statusBgColor }]}>
              <Text>{statusText}</Text>
            </View>
            <View style={[styles.cellComments]}>
              <Text>{commentText}</Text>
            </View>
            <View style={[styles.cellImages]}>
              {images.slice(0, 2).map((img, idx) => (
                <PDFImage key={idx} src={img} style={styles.sectionImage} />
              ))}
            </View>
          </View>
        );

        counter++;
      });
    });

    return rows;
  };

  return (
    <Document>
      {/* Cover Page */}
      <Page size="A4" style={styles.coverPage}>
        {/* Header with logo and photo */}
        <View style={styles.coverHeader}>
          {/* Logo */}
          <PDFImage src="/images/logo.png" style={styles.coverLogo} />

          {/* Cover photo */}
          {formData.CoverPagePhoto && (
            <PDFImage src={formData.CoverPagePhoto} style={styles.coverPhoto} />
          )}
        </View>

        {/* Main Title */}
        <View style={styles.coverTitleContainer}>
          <Text style={styles.coverTitle1}>SITE</Text>
          <Text style={styles.coverTitle2}>SAFETY</Text>
          <Text style={styles.coverTitle1}>INSPECTION</Text>
        </View>

        {/* Information Section */}
        <View style={styles.coverInfoBox}>
          <View style={{ marginBottom: 12 }}>
            <Text style={styles.coverInfoTitle}>LOCATION:</Text>
            <Text style={styles.coverInfoValue}>
              {formData.siteAddress || "33 Melrose Avenue London NW2 4LH"}
            </Text>
          </View>
          <View style={{ marginBottom: 12 }}>
            <Text style={styles.coverInfoTitle}>INSPECTED ON:</Text>
            <Text style={styles.coverInfoValue}>
              {formData.safetyAdvisorApprovalDate || job?.on_site_date || "12 Sep 2025"}
            </Text>
          </View>
          <View>
            <Text style={styles.coverInfoTitle}>OUR REF:</Text>
            <Text style={styles.coverInfoValue}>
              {formData.SafetyAdvisorName || formData.InspectorName || "John Doe"}
            </Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.coverFooter}>
          <View>
            <Text style={[styles.coverFooterText, { fontWeight: "bold", fontSize: 16 }]}>
              Mishor Compliance Services
            </Text>
            <Text style={[styles.coverFooterText, { marginTop: 8 }]}>
              office@mishor.co.uk
            </Text>
            <Text style={styles.coverFooterText}>Tel: 01634 590996</Text>
          </View>
          {/* Logo for footer */}
          <PDFImage src="/images/logoWhite.png" style={styles.coverFooterLogo} />
        </View>
      </Page>

      {/* Main Report Pages */}
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header} fixed>
          <Text style={styles.headerTitle}>Site Inspection Report</Text>
          {/* Logo */}
          <PDFImage src="/images/logo.png" style={styles.headerLogo} />
        </View>

        {/* Top Info Table */}
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <View style={[styles.tableCellLabel, { width: "25%" }]}>
              <Text>Client</Text>
            </View>
            <View style={[styles.tableCell, { width: "25%" }]}>
              <Text>{formData.ClientName || job?.client_name || ""}</Text>
            </View>
            <View style={[styles.tableCellLabel, { width: "25%" }]}>
              <Text>Date of Inspection</Text>
            </View>
            <View style={[styles.tableCell, { width: "25%" }]}>
              <Text>{formData.safetyAdvisorApprovalDate || ""}</Text>
            </View>
          </View>
          <View style={styles.tableRow}>
            <View style={[styles.tableCellLabel, { width: "25%" }]}>
              <Text>Site Address</Text>
            </View>
            <View style={[styles.tableCell, { width: "75%" }]}>
              <Text>{formData.siteAddress || ""}</Text>
            </View>
          </View>
          <View style={styles.tableRow}>
            <View style={[styles.tableCellLabel, { width: "25%" }]}>
              <Text>Safety Advisor</Text>
            </View>
            <View style={[styles.tableCell, { width: "25%" }]}>
              <Text>{formData.SafetyAdvisorName || ""}</Text>
            </View>
            <View style={[styles.tableCellLabel, { width: "25%" }]}>
              <Text>Person in Control</Text>
            </View>
            <View style={[styles.tableCell, { width: "25%" }]}>
              <Text>{formData.personInControlName || ""}</Text>
            </View>
          </View>
        </View>

        {/* Section Title */}
        <Text style={styles.sectionTitle}>Site Safety Inspection</Text>

        {/* Inspection Table */}
        <View style={styles.inspectionTable}>
          {/* Header */}
          <View style={styles.inspectionHeaderRow} wrap={false}>
            <View style={[styles.tableHeader, { width: "5%" }]}>
              <Text>#</Text>
            </View>
            <View style={[styles.tableHeader, { width: "30%" }]}>
              <Text>Section</Text>
            </View>
            <View style={[styles.tableHeader, { width: "10%" }]}>
              <Text>Check</Text>
            </View>
            <View style={[styles.tableHeader, { width: "15%" }]}>
              <Text>Status</Text>
            </View>
            <View style={[styles.tableHeader, { width: "25%" }]}>
              <Text>Comments</Text>
            </View>
            <View style={[styles.tableHeader, { width: "15%", borderRightWidth: 0 }]}>
              <Text>Images</Text>
            </View>
          </View>

          {/* Data Rows */}
          {buildInspectionRows()}
        </View>

        {/* Additional Comments */}
        {comments.length > 0 && (
          <>
            <Text style={styles.smallTitle}>Additional Comments</Text>
            <View style={styles.commentsTable}>
              {/* Header */}
              <View style={styles.commentsHeaderRow} wrap={false}>
                <View style={[styles.tableHeader, { width: "20%" }]}>
                  <Text>Area</Text>
                </View>
                <View style={[styles.tableHeader, { width: "55%" }]}>
                  <Text>Comments</Text>
                </View>
                <View style={[styles.tableHeader, { width: "25%" }]}>
                  <Text>Photo</Text>
                </View>
              </View>

              {/* Data */}
              {comments.map((comment, idx) => (
                <View key={idx} style={styles.commentsRow} wrap={false}>
                  <View style={styles.commentsArea}>
                    <Text>{comment.area || ""}</Text>
                  </View>
                  <View style={styles.commentsText}>
                    <Text>{comment.text}</Text>
                  </View>
                  <View style={styles.commentsPhoto}>
                    {comment.imagePath && (
                      <PDFImage src={comment.imagePath} style={styles.commentImage} />
                    )}
                  </View>
                </View>
              ))}
            </View>
          </>
        )}

        {/* Signatures */}
        <View style={styles.signatureTable}>
          <View style={styles.signatureRow} wrap={false}>
            <View style={[styles.tableCellLabel, { width: "37.5%" }]}>
              <Text>Safety Advisor Signature</Text>
            </View>
            <View style={[styles.tableCellLabel, { width: "12.5%" }]}>
              <Text>Date</Text>
            </View>
            <View style={[styles.tableCellLabel, { width: "37.5%" }]}>
              <Text>Person in Control Signature</Text>
            </View>
            <View style={[styles.tableCellLabel, { width: "12.5%", borderRightWidth: 0 }]}>
              <Text>Date</Text>
            </View>
          </View>
          <View style={styles.signatureRow} wrap={false}>
            <View style={[styles.signatureCell, { width: "37.5%" }]}>
              {formData.inspectorSignature && formatBase64Image(formData.inspectorSignature) && (
                <PDFImage
                  src={formatBase64Image(formData.inspectorSignature)!}
                  style={styles.signatureImage}
                />
              )}
            </View>
            <View style={[styles.signatureCell, { width: "12.5%" }]}>
              <Text>{formData.safetyAdvisorApprovalDate || ""}</Text>
            </View>
            <View style={[styles.signatureCell, { width: "37.5%" }]}>
              {formData.clientSignature && formatBase64Image(formData.clientSignature) && (
                <PDFImage 
                  src={formatBase64Image(formData.clientSignature)!} 
                  style={styles.signatureImage} 
                />
              )}
            </View>
            <View style={[styles.signatureCellLast, { width: "12.5%" }]}>
              <Text>{formData.personInControlApprovalDate || ""}</Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>
            Mishor Compliance Services {">"} Job ID: {job?.id || ""}
          </Text>
          <Text
            style={styles.footerText}
            render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
          />
        </View>
      </Page>
    </Document>
  );
};

export default SiteSafetyPDFDocument;
