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

const plugin = {
  id: "customCanvasBackgroundColor",
  beforeDraw: (chart: any, args: any, options: any) => {
    const { ctx } = chart;
    ctx.save();
    ctx.globalCompositeOperation = "destination-over";
    ctx.fillStyle = options.color || "#99ffff";
    ctx.fillRect(0, 0, chart.width, chart.height);
    ctx.restore();
  },
};

const SurveyResultsChart = () => {
  const chartRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (chartRef.current) {
      const ctx = chartRef.current.getContext("2d");
      if (ctx) {
        const data = getData();
        new Chart(ctx, {
          plugins: [plugin],
          type: "scatter",
          data: {
            datasets: [
              {
                data,
                backgroundColor: "#7e22ce",
                pointRadius: 10,
                label: "Your Result",
              },
            ],
          },
          options: {
            // maintainAspectRatio: true,
            // aspectRatio: 1,
            scales: {
              x: {
                type: "linear",
                position: "bottom",
                title: {
                  display: true,
                  text: "Negative Feelings Towards Military Experience",
                  color: "#334155",
                },
                min: -40,
                max: 40,
                ticks: {
                  color: "#64748b",
                },
              },
              top: {
                type: "linear",
                position: "top",
                title: {
                  display: true,
                  text: "Positive Feelings Towards Military Experience",
                  color: "#334155",
                },
                min: -40,
                max: 40,
                ticks: {
                  color: "#64748b",
                },
              },
              y: {
                type: "linear",
                position: "left",
                title: {
                  display: true,
                  text: "Negative Feelings Towards Civilian Life",
                  color: "#334155",
                },
                min: -40,
                max: 40,
                ticks: {
                  color: "#64748b",
                },
              },
              right: {
                type: "linear",
                position: "right",
                title: {
                  display: true,
                  text: "Positive Feelings Towards Civilian Life",
                  color: "#334155",
                },
                min: -40,
                max: 40,
                ticks: {
                  color: "#64748b",
                },
              },
            },
            plugins: {
              legend: {
                display: false,
              },
              // @ts-ignore
              customCanvasBackgroundColor: { color: "#e2e8f0" },
              annotation: {
                annotations: {
                  line1: {
                    type: "line",
                    xMin: 0,
                    xMax: 0,
                    borderColor: "#475569",
                    borderWidth: 3,
                  },
                  line2: {
                    type: "line",
                    yMin: 0,
                    yMax: 0,
                    borderColor: "#475569",
                    borderWidth: 3,
                  },
                  label1: {
                    type: "label",
                    xValue: -20,
                    yValue: 20,
                    content: "Separation",
                    color: "#334155",
                  },
                  label2: {
                    type: "label",
                    xValue: 20,
                    yValue: 20,
                    content: "Integration",
                    color: "#334155",
                  },
                  label3: {
                    type: "label",
                    xValue: -20,
                    yValue: -20,
                    content: "Marginalization",
                    color: "#334155",
                  },
                  label4: {
                    type: "label",
                    xValue: 20,
                    yValue: -20,
                    content: "Assimilation",
                    color: "#334155",
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
    <div class="container flex flex-col items-center content-center mx-auto max-h-screen mb-96 min-w-[700px] overflow-scroll">
      <h2 class="flex text-2xl text-slate-50 p-8 font-bold">Survey Results</h2>
      <canvas ref={chartRef}></canvas>
    </div>
  );
};

export default SurveyResultsChart;
