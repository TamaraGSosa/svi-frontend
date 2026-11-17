import React from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import PageMeta from "@/components/common/PageMeta";

interface PlaceholderPageProps {
  title: string;
  description: string;
  pageTitle: string;
}

export const PlaceholderPage: React.FC<PlaceholderPageProps> = ({
  title,
  description,
  pageTitle,
}) => {
  return (
    <div>
      <PageMeta title={`${title} | Videovigilancia Inteligente`} description={description} />
      <PageBreadcrumb pageTitle={pageTitle} />
      <div className="rounded-2xl border border-gray-200 bg-white px-5 py-7 xl:px-10 xl:py-12 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="mx-auto w-full max-w-xl text-center">
          <h3 className="mb-3 text-xl font-semibold text-gray-800 sm:text-2xl dark:text-white/90">
            {title}
          </h3>
          <p className="text-sm text-gray-500 sm:text-base dark:text-gray-400">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
};

