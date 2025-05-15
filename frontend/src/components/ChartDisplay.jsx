import React from 'react';
import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,  CategoryScale,  LinearScale,  BarElement,  LineElement,  PointElement,  Title,  Tooltip,  Legend,} from 'chart.js';

ChartJS.register(  CategoryScale,  LinearScale,  BarElement,  LineElement,  PointElement,  Title,  Tooltip,  Legend);

const ChartDisplay = ({ chartData, chartType }) => {
  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: `Chart`, // Customize title based on selected axes
      },
    },
  };

  if (chartType === 'bar') {
    return <Bar data={chartData} options={options} />;
  } else if (chartType === 'line') {
    return <Line data={chartData} options={options} />;
  } else {
    return <p>Unsupported chart type: {chartType}</p>;
  }
};

export default ChartDisplay;