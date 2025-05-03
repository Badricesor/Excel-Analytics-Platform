import React, { useState } from 'react';

const AnalysisForm = ({ headers, onAnalyze }) => {
  const [xAxis, setXAxis] = useState('');
  const [yAxis, setYAxis] = useState('');
  const [chartType, setChartType] = useState('bar'); // Default chart type

  const handleSubmit = (e) => {
    e.preventDefault();
    if (xAxis && yAxis) {
      onAnalyze(xAxis, yAxis, chartType);
    } else {
      alert('Please select X and Y axes.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="xAxis" className="block text-gray-700 text-sm font-bold mb-2">
          X-Axis:
        </label>
        <select
          id="xAxis"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          value={xAxis}
          onChange={(e) => setXAxis(e.target.value)}
        >
          <option value="">Select X-Axis</option>
          {headers.map((header) => (
            <option key={header} value={header}>
              {header}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="yAxis" className="block text-gray-700 text-sm font-bold mb-2">
          Y-Axis:
        </label>
        <select
          id="yAxis"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          value={yAxis}
          onChange={(e) => setYAxis(e.target.value)}
        >
          <option value="">Select Y-Axis</option>
          {headers.map((header) => (
            <option key={header} value={header}>
              {header}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="chartType" className="block text-gray-700 text-sm font-bold mb-2">
          Chart Type:
        </label>
        <select
          id="chartType"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          value={chartType}
          onChange={(e) => setChartType(e.target.value)}
        >
          <option value="bar">Bar Chart</option>
          <option value="line">Line Chart</option>
          {/* Add more chart types as needed (e.g., pie, scatter) */}
        </select>
      </div>
      <button
        type="submit"
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
      >
        Analyze
      </button>
    </form>
  );
};

export default AnalysisForm;