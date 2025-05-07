import React from 'react';

const AnalysisForm = ({
  headers,
  onXAxisChange,
  onYAxisChange,
  onChartTypeChange,
  onAnalyze,
  loading,
  selectedXAxis,
  selectedYAxis,
  selectedChartType,
}) => {
  return (
    <form onSubmit={(e) => { e.preventDefault(); onAnalyze(); }} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
      <div>
        <label htmlFor="xAxis" className="block text-sm font-medium text-gray-700">X-axis</label>
        <select
          id="xAxis"
          className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus-ring-indigo-500 focus-border-indigo-500 sm:text-sm"
          value={selectedXAxis}
          onChange={onXAxisChange}
        >
          <option value="">Select column...</option>
          {headers.map((header) => (
            <option key={header} value={header}>{header}</option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="yAxis" className="block text-sm font-medium text-gray-700">Y-axis</label>
        <select
          id="yAxis"
          className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus-ring-indigo-500 focus-border-indigo-500 sm:text-sm"
          value={selectedYAxis}
          onChange={onYAxisChange}
        >
          <option value="">Select column...</option>
          {headers.map((header) => (
            <option key={header} value={header}>{header}</option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="chartType" className="block text-sm font-medium text-gray-700">Chart type</label>
        <select
          id="chartType"
          className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus-ring-indigo-500 focus-border-indigo-500 sm:text-sm"
          value={selectedChartType}
          onChange={onChartTypeChange}
        >
          <option value="bar">Bar</option>
          <option value="line">Line</option>
          <option value="pie">Pie</option>
          {/* Add more chart types */}
        </select>
      </div>
      <div className="md:col-span-3 mt-4">
        <button
          type="submit"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus-ring-2 focus-ring-offset-2 focus-ring-indigo-500"
          disabled={loading || !headers.length}
        >
          {loading ? 'Analyzing...' : 'Generate Chart'}
        </button>
      </div>
    </form>
  );
};

export default AnalysisForm;