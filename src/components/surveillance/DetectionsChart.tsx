import React from "react";
import type { ApexOptions } from "apexcharts";
import Chart from "react-apexcharts";

interface DetectionsChartProps {
  hours: string[];
  counts: number[];
}

export const DetectionsChart: React.FC<DetectionsChartProps> = ({
  hours,
  counts,
}) => {
  const options: ApexOptions = {
    colors: ["#465fff"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "bar",
      height: 200,
      toolbar: {
        show: false,
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "32%",
        borderRadius: 4,
        borderRadiusApplication: "end",
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: true,
      width: 2,
      colors: ["transparent"],
    },
    xaxis: {
      categories: hours,
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
      labels: {
        style: {
          colors: "#64748B",
          fontSize: "11px",
        },
      },
    },
    yaxis: {
      labels: {
        style: {
          colors: "#64748B",
          fontSize: "11px",
        },
      },
    },
    grid: {
      borderColor: "#E2E8F0",
      strokeDashArray: 4,
      yaxis: {
        lines: {
          show: true,
        },
      },
    },
    fill: {
      opacity: 1,
    },
    tooltip: {
      y: {
        formatter: (val: number) => `${val} detecciones`,
      },
    },
  };

  const series = [
    {
      name: "Detecciones",
      data: counts,
    },
  ];

  return (
    <div className="h-full rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-gray-800 dark:text-white/90">
            Frecuencia de Detecciones
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Alertas registradas por franja horaria
          </p>
        </div>
      </div>
      <div className="max-w-full overflow-x-auto">
        <div className="min-w-[420px]">
          <Chart options={options} series={series} type="bar" height={200} />
        </div>
      </div>
    </div>
  );
};
