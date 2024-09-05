import "@/styles/global.css";
import {
  ScatterChart,
  XAxis,
  YAxis,
  Scatter,
  CartesianGrid,
  Legend,
  ReferenceLine,
  Label,
} from "recharts";
import {
  ChartTooltipContent,
  ChartTooltip,
  ChartLegend,
  ChartLegendContent,
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

  console.log(x, y);
  return [{ x, y }];
};

const renderText = (value: string, entry: any) => {
  const { color } = entry;
  return (
    <span style={{ color }} className="text-lg text-purple">
      {value}
    </span>
  );
};

const getDomain = (data: Array<{ x: number; y: number }>) => {
  const xValues = data.map((d) => d.x);
  const yValues = data.map((d) => d.y);

  const xMin = Math.min(...xValues);
  const xMax = Math.max(...xValues);
  const yMin = Math.min(...yValues);
  const yMax = Math.max(...yValues);

  const domain = [Math.min(xMin, yMin) - 5, Math.max(xMax, yMax) + 5];

  return domain;
};

const SurveyResultsChart = () => {
  const data = getData();
  const domain = getDomain(data);
  return (
    <div className="container mx-auto p-8">
      <ChartContainer config={chartConfig} className="min-h-[200]px">
        <ScatterChart>
          <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
          <XAxis
            tickLine={false}
            axisLine={false}
            type="number"
            tickMargin={8}
            dataKey="x"
            name="Civilian"
            domain={domain}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            type="number"
            tickMargin={8}
            dataKey="y"
            name="Military"
            domain={domain}
          />
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent hideLabel />}
          />
          <Scatter name="You're Result" data={data} fill="#7e22ce" />
          <ReferenceLine x={0} stroke="#64748b" strokeWidth="2" />
          <ReferenceLine y={0} stroke="#64748b" strokeWidth="2" />
        </ScatterChart>
      </ChartContainer>
    </div>
  );
};

export default SurveyResultsChart;
