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
  const data = Object.values(answersStore.get());

  const { x, y } = data.reduce(
    (acc, d) => {
      if (d.axis === "X") acc.x += d.offset;
      if (d.axis === "Y") acc.y += d.offset;
      return acc;
    },
    { x: 0, y: 0 }
  );

  console.log(x, y);
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
                backgroundColor: "#f8fafc",
                pointRadius: 10,
                label: "Your Result",
              },
            ],
          },
          options: {
            maintainAspectRatio: true,
            aspectRatio: 1,
            scales: {
              x: {
                type: "linear",
                position: "bottom",
                title: {
                  display: true,
                  text: "Negative Feelings Towards Military Experience",
                  color: "#f1f5f9",
                },
                min: -40,
                max: 40,
                ticks: {
                  color: "#94a3b8",
                },
              },
              top: {
                type: "linear",
                position: "top",
                title: {
                  display: true,
                  text: "Positive Feelings Towards Military Experience",
                  color: "#f1f5f9",
                },
                min: -40,
                max: 40,
                ticks: {
                  color: "#94a3b8",
                },
              },
              y: {
                type: "linear",
                position: "left",
                title: {
                  display: true,
                  text: "Negative Feelings Towards Civilian Life",
                  color: "#f1f5f9",
                },
                min: -40,
                max: 40,
                ticks: {
                  color: "#94a3b8",
                },
              },
              right: {
                type: "linear",
                position: "right",
                title: {
                  display: true,
                  text: "Positive Feelings Towards Civilian Life",
                  color: "#f1f5f9",
                },
                min: -40,
                max: 40,
                ticks: {
                  color: "#94a3b8",
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
                    borderColor: "#a78bfa",
                    borderWidth: 3,
                  },
                  line2: {
                    type: "line",
                    yMin: 0,
                    yMax: 0,
                    borderColor: "#a78bfa",
                    borderWidth: 3,
                  },
                  label1: {
                    type: "label",
                    xValue: -5,
                    yValue: 5,
                    content: "Separation",
                    color: "#94a3b8",
                  },
                  label2: {
                    type: "label",
                    xValue: 5,
                    yValue: 5,
                    content: "Integration",
                    color: "#94a3b8",
                  },
                  label3: {
                    type: "label",
                    xValue: -5,
                    yValue: -5,
                    content: "Marginalization",
                    color: "#94a3b8",
                  },
                  label4: {
                    type: "label",
                    xValue: 5,
                    yValue: -5,
                    content: "Assimilation",
                    color: "#94a3b8",
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
    <div class="container mx-auto max-h-screen pt-4 pb-36">
      <h2>Survey Results Chart</h2>
      <canvas class="mx-auto" ref={chartRef}></canvas>
    </div>
  );
};

export default SurveyResultsChart;
