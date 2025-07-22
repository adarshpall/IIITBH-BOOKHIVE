import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

function PieChart({title,labels,values,label}) {
  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "bottom",
      },
      title: {
        display: true,
        text: title,
      },
    },
  };
  const data = {
    labels: labels,
    datasets: [
      {
        label: label,
        data: values,
        backgroundColor: [
            '#4cceac',
            '#6870fa',
            '#3e4396',
            ' #FF5A5F'
        ],
        borderColor: [
          'white'
        ],
        borderWidth: 2,
      },
    ],
  };
  return <Pie data={data} options={options} />
}

export default PieChart