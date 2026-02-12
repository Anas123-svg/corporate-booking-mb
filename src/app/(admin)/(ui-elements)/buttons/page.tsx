import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Button from "@/components/ui/button/Button";
import { BoxIcon } from "@/icons";
import React from "react";

// Wrapper to render imported SVGs that may be React components or asset objects
const RenderBoxIcon = (props: any) => {
  try {
    if (typeof BoxIcon === "function" || (typeof BoxIcon === "object" && (BoxIcon as any).$$typeof)) {
      return React.createElement(BoxIcon as any, props);
    }
    const src = (BoxIcon as any)?.src || (BoxIcon as any);
    return <img src={src} alt="icon" {...props} />;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn("Failed to render BoxIcon:", err);
    return null;
  }
};

export default function Buttons() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Buttons" />
      <div className="space-y-5 sm:space-y-6">
        {/* Primary Button */}
        <ComponentCard title="Primary Button">
          <div className="flex items-center gap-5">
            <Button size="sm" variant="primary">
              Button Text
            </Button>
            <Button size="md" variant="primary">
              Button Text
            </Button>
          </div>
        </ComponentCard>
        {/* Primary Button with Start Icon */}
        <ComponentCard title="Primary Button with Left Icon">
          <div className="flex items-center gap-5">
            <Button size="sm" variant="primary" startIcon={<RenderBoxIcon className="w-4 h-4" />}>
              Button Text
            </Button>
            <Button size="md" variant="primary" startIcon={<RenderBoxIcon className="w-4 h-4" />}>
              Button Text
            </Button>
          </div>
        </ComponentCard>{" "}
        {/* Primary Button with Start Icon */}
        <ComponentCard title="Primary Button with Right Icon">
          <div className="flex items-center gap-5">
            <Button size="sm" variant="primary" endIcon={<RenderBoxIcon className="w-4 h-4" />}>
              Button Text
            </Button>
            <Button size="md" variant="primary" endIcon={<RenderBoxIcon className="w-4 h-4" />}>
              Button Text
            </Button>
          </div>
        </ComponentCard>
        {/* Outline Button */}
        <ComponentCard title="Secondary Button">
          <div className="flex items-center gap-5">
            {/* Outline Button */}
            <Button size="sm" variant="outline">
              Button Text
            </Button>
            <Button size="md" variant="outline">
              Button Text
            </Button>
          </div>
        </ComponentCard>
        {/* Outline Button with Start Icon */}
        <ComponentCard title="Outline Button with Left Icon">
          <div className="flex items-center gap-5">
            <Button size="sm" variant="outline" startIcon={<RenderBoxIcon className="w-4 h-4" />}>
              Button Text
            </Button>
            <Button size="md" variant="outline" startIcon={<RenderBoxIcon className="w-4 h-4" />}>
              Button Text
            </Button>
          </div>
        </ComponentCard>{" "}
        {/* Outline Button with Start Icon */}
        <ComponentCard title="Outline Button with Right Icon">
          <div className="flex items-center gap-5">
            <Button size="sm" variant="outline" endIcon={<RenderBoxIcon className="w-4 h-4" />}>
              Button Text
            </Button>
            <Button size="md" variant="outline" endIcon={<RenderBoxIcon className="w-4 h-4" />}>
              Button Text
            </Button>
          </div>
        </ComponentCard>
      </div>
    </div>
  );
}
