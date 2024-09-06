import "@/styles/global.css";
import {
  ScatterChart,
  XAxis,
  YAxis,
  ZAxis,
  Scatter,
  CartesianGrid,
  ReferenceLine,
  ReferenceArea,
} from "recharts";
import {
  ChartTooltipContent,
  ChartTooltip,
  type ChartConfig,
} from "@/components/ui/chart";
import { ChartContainer } from "@/components/ui/chart";

import { answersStore } from "../stores/answersStore.ts";

const chartConfig = {} satisfies ChartConfig;

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
  return [{ x, y }];
};

const getDomain = (data: Array<{ x: number; y: number }>) => {
  const xValues = data.map((d) => d.x);
  const yValues = data.map((d) => d.y);

  const xMin = Math.min(...xValues);
  const xMax = Math.max(...xValues);
  const yMin = Math.min(...yValues);
  const yMax = Math.max(...yValues);

  const domain = [
    Math.min(-10, Math.min(xMin, yMin) - 5),
    Math.max(10, Math.max(xMax, yMax) + 5),
  ];

  return domain;
};

const SurveyResultsChart = () => {
  const data = getData();
  const domain = getDomain(data);
  return (
    <div className="container mx-auto p-8">
      <ChartContainer config={chartConfig} className="min-h-[200]px p-8">
        <ScatterChart margin={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
          <ZAxis type="number" dataKey="z" range={[500, 600]} />
          <XAxis
            tickLine={false}
            axisLine={false}
            type="number"
            dataKey="x"
            name="Civilian"
            domain={domain}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            type="number"
            dataKey="y"
            name="Military"
            domain={domain}
          />
          <ReferenceLine x={0} stroke="#64748b" strokeWidth="2" />
          <ReferenceLine y={0} stroke="#64748b" strokeWidth="2" />
          <ReferenceArea
            fill="#fde047"
            fillOpacity={0.1}
            x1={domain[0]}
            x2={0}
            y1={0}
            y2={domain[1]}
            label="Separation"
          />
          <ReferenceArea
            fill="#a5b4fc"
            fillOpacity={0.1}
            x1={0}
            x2={domain[1]}
            y1={0}
            y2={domain[1]}
            label="Integration"
            isFront={false}
          />
          <ReferenceArea
            fill="#fca5a5"
            fillOpacity={0.1}
            x1={0}
            x2={domain[1]}
            y1={domain[0]}
            y2={0}
            label="Assimilation"
            style={{ fontSize: "20rem" }}
          />
          <ReferenceArea
            fill="#67e8f9"
            fillOpacity={0.1}
            x1={domain[0]}
            x2={0}
            y1={domain[0]}
            y2={0}
            label="Marginalization"
          />
          <ChartTooltip
            cursor={{ strokeDasharray: "3 3" }}
            content={<ChartTooltipContent />}
          />
          <Scatter name="You're Result" data={data} fill="#cbd5e1" />
        </ScatterChart>
      </ChartContainer>
    </div>
  );
};

export default SurveyResultsChart;
