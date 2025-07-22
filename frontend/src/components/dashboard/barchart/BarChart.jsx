import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function BarChart({title,labels,values,label}) {
  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: title
      },
    },
  };
  const data = {
    labels,
    datasets: [
      {
        label: label,
        data: values,
        backgroundColor: '#4cceac',
      }
    ]
  };
  if(data){
    return <Bar options={options} data={data} />;
  }else{
    return <div>Graph...</div>
  }
  
}

export default BarChart;
