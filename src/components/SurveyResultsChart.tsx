import { useEffect, useRef } from "preact/hooks";
import Chart from "chart.js/auto";

import { answersStore } from "../stores/answersStore.ts";

const getData = () => {
  const x = 0;
  const y = 0;
  return [{ x, y }];
};

const SurveyResultsChart = () => {
  const chartRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (chartRef.current) {
      const ctx = chartRef.current.getContext("2d");
      if (ctx) {
        const data = getData();
        new Chart(ctx, {
          type: "scatter",
          data: {
            datasets: [
              {
                data,
                backgroundColor: "rgba(75, 192, 192, 0.6)",
                pointRadius: 10,
                label: "Your Result",
              },
            ],
          },
          options: {
            scales: {
              x: {
                type: "linear",
                position: "bottom",
                title: {
                  display: true,
                  text: "X",
                },
              },
            },
            plugins: {
              legend: {
                display: false,
              },
            },
          },
        });
      }
    }
  }, []);

  return (
    <div>
      <h2>Survey Results Chart</h2>
      <canvas ref={chartRef}></canvas>
    </div>
  );
};

export default SurveyResultsChart;
