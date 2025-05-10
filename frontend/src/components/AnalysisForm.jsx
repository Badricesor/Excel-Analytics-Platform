// frontend/src/components/AnalysisForm.jsx
import React from 'react';

const AnalysisForm = ({
  headers,
  xAxisChange,
  yAxisChange,
  chartTypeChange,
  selectedXAxis,
  selectedYAxis,
  selectedChartType,
  chartTypeOptions,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
      <div className="md:col-span-1">
        <label htmlFor="xAxis" className="block text-sm font-medium text-gray-700 dark:text-gray-300">X-axis</label>
        <select
          id="xAxis"
          className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300"
          value={selectedXAxis}
          onChange={(e) => xAxisChange(e.target.value)}
        >
          <option value="">Select column...</option>
          {headers.map((header) => (
            <option key={header} value={header}>{header}</option>
          ))}
        </select>
      </div>

      <div className="md:col-span-1">
        <label htmlFor="yAxis" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Y-axis</label>
        <select
          id="yAxis"
          className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300"
          value={selectedYAxis}
          onChange={(e) => yAxisChange(e.target.value)}
        >
          <option value="">Select column...</option>
          {headers.map((header) => (
            <option key={header} value={header}>{header}</option>
          ))}
        </select>
      </div>

      <div className="md:col-span-1">
        <label htmlFor="chartType" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Chart type</label>
        <select
          id="chartType"
          className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300"
          value={selectedChartType}
          onChange={(e) => chartTypeChange(e.target.value)}
        >
          {chartTypeOptions.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default AnalysisForm;