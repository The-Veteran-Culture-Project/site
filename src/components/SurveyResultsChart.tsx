import {
  ScatterChart,
  XAxis,
  YAxis,
  ZAxis,
  Scatter,
  CartesianGrid,
  ReferenceLine,
  ReferenceArea,
  Label,
} from "recharts";
import {
  ChartTooltipContent,
  ChartTooltip,
  type ChartConfig,
} from "@/components/ui/chart";
import { ChartContainer } from "@/components/ui/chart";

import { answersStore } from "../stores/answersStore.ts";
import useTheme from "@/hooks/useTheme";

const chartConfig = {} satisfies ChartConfig;

const chartLightStyles = {
  scatterColor: "#991b1b",
  quadrantColor: "#756943",
  axisColor: "#52525b",
  gridColor: "#52525b",
  labelStyle: {
    fill: "#52525b",
    "font-size": "3vw",
    "font-weight": "bold",
  },
};

const chartDarkStyles = {
  scatterColor: "#f87171",
  quadrantColor: "#c3b997",
  axisColor: "#d4d4d8",
  gridColor: "#d4d4d8",
  labelStyle: {
    fill: "text-primary",
    "font-size": "3vw",
    "font-weight": "bold",
  },
};

const getData = () => {
  const data = Object.values(answersStore.get());

  const { x, y } = data.reduce(
    (acc, d) => {
      if (d.axis === "X") acc.x += d.offset;
      if (d.axis === "Y") acc.y += d.offset;
      return acc;
    },
    { x: 0, y: 0 },
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

const getAreaFillForQuadrant = (
  quadrant: number,
  point: { x: number; y: number },
) => {
  if (quadrant === 1) {
    return point.x <= 0 && point.y >= 0 ? 0.3 : 0.0;
  }
  if (quadrant === 2) {
    return point.x >= 0 && point.y >= 0 ? 0.3 : 0.0;
  }
  if (quadrant === 3) {
    return point.x >= 0 && point.y <= 0 ? 0.3 : 0.0;
  }
  if (quadrant === 4) {
    return point.x <= 0 && point.y <= 0 ? 0.3 : 0.0;
  }
};

const SurveyResultsChart = () => {
  const data = getData();
  const domain = getDomain(data);
  const { isDarkMode } = useTheme();

  const styles = isDarkMode() ? chartDarkStyles : chartLightStyles;

  return (
    <div className="container mx-auto p-8">
      <ChartContainer config={chartConfig} className="min-h-[200]px">
        <ScatterChart>
          <CartesianGrid
            strokeDasharray="3 3"
            opacity={0.4}
            stroke={styles.gridColor}
          />
          <ZAxis type="number" dataKey="z" range={[500, 600]} />
          <XAxis
            hide={true}
            type="number"
            dataKey="x"
            name="Civilian"
            domain={domain}
          />
          <YAxis
            hide={true}
            type="number"
            dataKey="y"
            name="Military"
            domain={domain}
          />
          <ReferenceLine x={0} stroke={styles.axisColor} strokeWidth="2" />
          <ReferenceLine y={0} stroke={styles.axisColor} strokeWidth="2" />
          <ReferenceArea
            fill={styles.quadrantColor}
            fillOpacity={getAreaFillForQuadrant(1, data[0])}
            x1={domain[0]}
            x2={0}
            y1={0}
            y2={domain[1]}
          >
            <Label value="Separation" style={styles.labelStyle} />
          </ReferenceArea>
          <ReferenceArea
            fill={styles.quadrantColor}
            fillOpacity={getAreaFillForQuadrant(2, data[0])}
            x1={0}
            x2={domain[1]}
            y1={0}
            y2={domain[1]}
            isFront={false}
          >
            <Label value="Integration" style={styles.labelStyle} />
          </ReferenceArea>
          <ReferenceArea
            fill={styles.quadrantColor}
            fillOpacity={getAreaFillForQuadrant(3, data[0])}
            x1={0}
            x2={domain[1]}
            y1={domain[0]}
            y2={0}
            style={{ fontSize: "20rem" }}
          >
            <Label value="Assimilation" style={styles.labelStyle} />
          </ReferenceArea>
          <ReferenceArea
            fill={styles.quadrantColor}
            fillOpacity={getAreaFillForQuadrant(4, data[0])}
            x1={domain[0]}
            x2={0}
            y1={domain[0]}
            y2={0}
            style={{ color: "red" }}
          >
            <Label value="Marginalization" style={styles.labelStyle} />
          </ReferenceArea>
          <ChartTooltip
            cursor={{ strokeDasharray: "3 3" }}
            content={<ChartTooltipContent />}
          />
          <Scatter
            name="You're Result"
            data={data}
            fill={styles.scatterColor}
          />
        </ScatterChart>
      </ChartContainer>
    </div>
  );
};

export default SurveyResultsChart;
