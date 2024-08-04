import { useEffect, useRef } from "preact/hooks";
import Chart from "chart.js/auto";
import annotationPlugin from "chartjs-plugin-annotation";

import { answersStore } from "../stores/answersStore.ts";

Chart.register(annotationPlugin);
Chart.defaults.font = {
  size: 16,
  weight: "bold",
  family: "Arial",
};

const getData = () => {
  const x = 2;
  const y = 10;
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
                  color: "red",
                },
                min: -20,
                max: 20,
                ticks: {
                  color: "green",
                },
              },
              y: {
                type: "linear",
                title: {
                  display: true,
                  text: "Y",
                },
                min: -20,
                max: 20,
                ticks: {
                  color: "green",
                },
              },
            },
            plugins: {
              legend: {
                display: false,
              },
              annotation: {
                annotations: {
                  line1: {
                    type: "line",
                    xMin: 0,
                    xMax: 0,
                    borderColor: "red",
                    borderWidth: 2,
                    label: {
                      content: "Y-Axis",
                      position: "start",
                      color: "green",
                    },
                  },
                  line2: {
                    type: "line",
                    yMin: 0,
                    yMax: 0,
                    borderColor: "red",
                    borderWidth: 2,
                    label: {
                      content: "X-Axis",
                      position: "start",
                    },
                  },
                  label1: {
                    type: "label",
                    xValue: -5,
                    yValue: 5,
                    backgroundColor: "rgba(0,0,0,0.1)",
                    content: "Quadrant I",
                    color: "yellow",
                  },
                  label2: {
                    type: "label",
                    xValue: 5,
                    yValue: 5,
                    backgroundColor: "rgba(0,0,0,0.1)",
                    color: "yellow",
                    content: "Quadrant II",
                  },
                  label3: {
                    type: "label",
                    xValue: -5,
                    yValue: -5,
                    color: "yellow",
                    backgroundColor: "rgba(0,0,0,0.1)",
                    content: "Quadrant III",
                  },
                  label4: {
                    type: "label",
                    xValue: 5,
                    yValue: -5,
                    backgroundColor: "rgba(0,0,0,0.1)",
                    color: "yellow",
                    content: "Quadrant IV",
                  },
                },
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
