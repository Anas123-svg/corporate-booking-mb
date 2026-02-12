import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Badge from "@/components/ui/badge/Badge";
import { PlusIcon } from "@/icons";
import React from "react";

// Some bundlers return SVG imports as objects (with .src) or as React components.
// Use a small wrapper to render correctly in both cases to avoid prerender errors.
const RenderPlusIcon = (props: any) => {
  try {
    // If PlusIcon is a React component (function or class), render it.
    if (typeof PlusIcon === "function" || typeof PlusIcon === "object" && (PlusIcon as any).$$typeof) {
      // Pass className through props if provided
      return React.createElement(PlusIcon as any, props);
    }
    // Otherwise treat it as an imported asset (object with src or a string URL)
    const src = (PlusIcon as any)?.src || (PlusIcon as any);
    return <img src={src} alt="plus" {...props} />;
  } catch (err) {
    // Fallback: render nothing on error
    // eslint-disable-next-line no-console
    console.warn("Failed to render PlusIcon:", err);
    return null;
  }
};

export default function BadgePage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Badges" />
      <div className="space-y-5 sm:space-y-6">
        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="px-6 py-5">
            <h3 className="text-base font-medium text-gray-800 dark:text-white/90">
              With Light Background
            </h3>
          </div>
          <div className="p-6 border-t border-gray-100 dark:border-gray-800 xl:p-10">
            <div className="flex flex-wrap gap-4 sm:items-center sm:justify-center">
              {/* Light Variant */}
              <Badge variant="light" color="primary">
                Primary
              </Badge>
              <Badge variant="light" color="success">
                Success
              </Badge>{" "}
              <Badge variant="light" color="error">
                Error
              </Badge>{" "}
              <Badge variant="light" color="warning">
                Warning
              </Badge>{" "}
              <Badge variant="light" color="info">
                Info
              </Badge>
              <Badge variant="light" color="light">
                Light
              </Badge>
              <Badge variant="light" color="dark">
                Dark
              </Badge>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="px-6 py-5">
            <h3 className="text-base font-medium text-gray-800 dark:text-white/90">
              With Solid Background
            </h3>
          </div>
          <div className="p-6 border-t border-gray-100 dark:border-gray-800 xl:p-10">
            <div className="flex flex-wrap gap-4 sm:items-center sm:justify-center">
              {/* Light Variant */}
              <Badge variant="solid" color="primary">
                Primary
              </Badge>
              <Badge variant="solid" color="success">
                Success
              </Badge>{" "}
              <Badge variant="solid" color="error">
                Error
              </Badge>{" "}
              <Badge variant="solid" color="warning">
                Warning
              </Badge>{" "}
              <Badge variant="solid" color="info">
                Info
              </Badge>
              <Badge variant="solid" color="light">
                Light
              </Badge>
              <Badge variant="solid" color="dark">
                Dark
              </Badge>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="px-6 py-5">
            <h3 className="text-base font-medium text-gray-800 dark:text-white/90">
              Light Background with Left Icon
            </h3>
          </div>
          <div className="p-6 border-t border-gray-100 dark:border-gray-800 xl:p-10">
            <div className="flex flex-wrap gap-4 sm:items-center sm:justify-center">
              <Badge variant="light" color="primary" startIcon={<RenderPlusIcon className="w-4 h-4" />}>
                Primary
              </Badge>
              <Badge variant="light" color="success" startIcon={<RenderPlusIcon className="w-4 h-4" />}>
                Success
              </Badge>{" "}
              <Badge variant="light" color="error" startIcon={<RenderPlusIcon className="w-4 h-4" />}>
                Error
              </Badge>{" "}
              <Badge variant="light" color="warning" startIcon={<RenderPlusIcon className="w-4 h-4" />}>
                Warning
              </Badge>{" "}
              <Badge variant="light" color="info" startIcon={<RenderPlusIcon className="w-4 h-4" />}>
                Info
              </Badge>
              <Badge variant="light" color="light" startIcon={<RenderPlusIcon className="w-4 h-4" />}>
                Light
              </Badge>
              <Badge variant="light" color="dark" startIcon={<RenderPlusIcon className="w-4 h-4" />}>
                Dark
              </Badge>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="px-6 py-5">
            <h3 className="text-base font-medium text-gray-800 dark:text-white/90">
              Solid Background with Left Icon
            </h3>
          </div>
          <div className="p-6 border-t border-gray-100 dark:border-gray-800 xl:p-10">
            <div className="flex flex-wrap gap-4 sm:items-center sm:justify-center">
              <Badge variant="solid" color="primary" startIcon={<RenderPlusIcon className="w-4 h-4" />}>
                Primary
              </Badge>
              <Badge variant="solid" color="success" startIcon={<RenderPlusIcon className="w-4 h-4" />}>
                Success
              </Badge>{" "}
              <Badge variant="solid" color="error" startIcon={<RenderPlusIcon className="w-4 h-4" />}>
                Error
              </Badge>{" "}
              <Badge variant="solid" color="warning" startIcon={<RenderPlusIcon className="w-4 h-4" />}>
                Warning
              </Badge>{" "}
              <Badge variant="solid" color="info" startIcon={<RenderPlusIcon className="w-4 h-4" />}>
                Info
              </Badge>
              <Badge variant="solid" color="light" startIcon={<RenderPlusIcon className="w-4 h-4" />}>
                Light
              </Badge>
              <Badge variant="solid" color="dark" startIcon={<RenderPlusIcon className="w-4 h-4" />}>
                Dark
              </Badge>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="px-6 py-5">
            <h3 className="text-base font-medium text-gray-800 dark:text-white/90">
              Light Background with Right Icon
            </h3>
          </div>
          <div className="p-6 border-t border-gray-100 dark:border-gray-800 xl:p-10">
            <div className="flex flex-wrap gap-4 sm:items-center sm:justify-center">
              <Badge variant="light" color="primary" endIcon={<RenderPlusIcon className="w-4 h-4" />}>
                Primary
              </Badge>
              <Badge variant="light" color="success" endIcon={<RenderPlusIcon className="w-4 h-4" />}>
                Success
              </Badge>{" "}
              <Badge variant="light" color="error" endIcon={<RenderPlusIcon className="w-4 h-4" />}>
                Error
              </Badge>{" "}
              <Badge variant="light" color="warning" endIcon={<RenderPlusIcon className="w-4 h-4" />}>
                Warning
              </Badge>{" "}
              <Badge variant="light" color="info" endIcon={<RenderPlusIcon className="w-4 h-4" />}>
                Info
              </Badge>
              <Badge variant="light" color="light" endIcon={<RenderPlusIcon className="w-4 h-4" />}>
                Light
              </Badge>
              <Badge variant="light" color="dark" endIcon={<RenderPlusIcon className="w-4 h-4" />}>
                Dark
              </Badge>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="px-6 py-5">
            <h3 className="text-base font-medium text-gray-800 dark:text-white/90">
              Solid Background with Right Icon
            </h3>
          </div>
          <div className="p-6 border-t border-gray-100 dark:border-gray-800 xl:p-10">
            <div className="flex flex-wrap gap-4 sm:items-center sm:justify-center">
              <Badge variant="solid" color="primary" endIcon={<RenderPlusIcon className="w-4 h-4" />}>
                Primary
              </Badge>
              <Badge variant="solid" color="success" endIcon={<RenderPlusIcon className="w-4 h-4" />}>
                Success
              </Badge>{" "}
              <Badge variant="solid" color="error" endIcon={<RenderPlusIcon className="w-4 h-4" />}>
                Error
              </Badge>{" "}
              <Badge variant="solid" color="warning" endIcon={<RenderPlusIcon className="w-4 h-4" />}>
                Warning
              </Badge>{" "}
              <Badge variant="solid" color="info" endIcon={<RenderPlusIcon className="w-4 h-4" />}>
                Info
              </Badge>
              <Badge variant="solid" color="light" endIcon={<RenderPlusIcon className="w-4 h-4" />}>
                Light
              </Badge>
              <Badge variant="solid" color="dark" endIcon={<RenderPlusIcon className="w-4 h-4" />}>
                Dark
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
