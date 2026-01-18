import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrendingUp, TrendingDown, Activity } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function DemandForecast({ data, title = "Demand Forecast" }) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-center py-8">No forecast data available</p>
        </CardContent>
      </Card>
    );
  }

  const calculateTrend = () => {
    if (data.length < 2) return null;
    const recent = data.slice(-3);
    const avgRecent = recent.reduce((sum, d) => sum + (d.predicted_value || d.value), 0) / recent.length;
    const avgPrevious = data.slice(0, 3).reduce((sum, d) => sum + d.value, 0) / 3;
    const change = ((avgRecent - avgPrevious) / avgPrevious) * 100;
    return {
      percentage: Math.abs(change).toFixed(1),
      direction: change > 0 ? 'up' : 'down',
      isPositive: change > 0
    };
  };

  const trend = calculateTrend();

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            {title}
          </CardTitle>
          {trend && (
            <Badge className={trend.isPositive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
              {trend.direction === 'up' ? (
                <TrendingUp className="w-3 h-3 mr-1" />
              ) : (
                <TrendingDown className="w-3 h-3 mr-1" />
              )}
              {trend.percentage}%
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12 }}
            />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px'
              }}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="value"
              name="Actual"
              stroke="#4f46e5"
              fill="#4f46e5"
              fillOpacity={0.6}
            />
            {data.some(d => d.predicted_value) && (
              <Area
                type="monotone"
                dataKey="predicted_value"
                name="Predicted"
                stroke="#f59e0b"
                fill="#f59e0b"
                fillOpacity={0.3}
                strokeDasharray="5 5"
              />
            )}
          </AreaChart>
        </ResponsiveContainer>

        {data[0]?.insights && (
          <div className="mt-4 p-3 bg-indigo-50 rounded-lg">
            <p className="text-sm font-medium text-indigo-900 mb-1">AI Insights</p>
            <p className="text-sm text-indigo-700">{data[0].insights}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}