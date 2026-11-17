import React from "react";
import { Link } from "react-router";
import { EyeIcon, VideoIcon, AlertIcon } from "@/icons";

export const QuickAccessToolbar: React.FC = () => {
  const actions = [
    {
      title: "Monitoreo en Vivo",
      description: "Ver transmisiones en tiempo real",
      to: "/monitoring",
      icon: <EyeIcon className="size-5" />,
      color: "brand",
    },
    {
      title: "Videos Grabados",
      description: "Explorar y analizar grabaciones",
      to: "/videos",
      icon: <VideoIcon className="size-5" />,
      color: "success",
    },
    {
      title: "Detecciones y Alertas",
      description: "Revisar eventos y objetos clasificados",
      to: "/detections",
      icon: <AlertIcon className="size-5" />,
      color: "warning",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {actions.map((action) => (
        <Link
          key={action.title}
          to={action.to}
          className="group flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 transition-all duration-200 hover:border-brand-500/30 hover:shadow-theme-xs dark:border-gray-800 dark:bg-white/[0.03] dark:hover:border-brand-500/30"
        >
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-colors ${
              action.color === "brand"
                ? "bg-brand-50 text-brand-500 group-hover:bg-brand-500 group-hover:text-white dark:bg-brand-500/10 dark:group-hover:bg-brand-500 dark:group-hover:text-white"
                : action.color === "success"
                ? "bg-success-50 text-success-500 group-hover:bg-success-500 group-hover:text-white dark:bg-success-500/10 dark:group-hover:bg-success-500 dark:group-hover:text-white"
                : "bg-warning-50 text-warning-500 group-hover:bg-warning-500 group-hover:text-white dark:bg-warning-500/10 dark:group-hover:bg-warning-500 dark:group-hover:text-white"
            }`}
          >
            {action.icon}
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-800 transition-colors group-hover:text-brand-500 dark:text-white/90 dark:group-hover:text-brand-400">
              {action.title}
            </h4>
            <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
              {action.description}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
};

