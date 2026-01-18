import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Brain, Target, Zap } from "lucide-react";

export default function PredictiveMetrics({ metrics }) {
  const metricIcons = {
    order_volume: Target,
    demand_forecast: Brain,
    fulfillment_rate: Zap
  };

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {metrics.map((metric, index) => {
        const Icon = metricIcons[metric.type] || Brain;
        const accuracy = metric.confidence_score || 0;

        return (
          <Card key={index}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Icon className="w-4 h-4 text-indigo-600" />
                {metric.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-baseline">
                  <span className="text-2xl font-bold">{metric.current}</span>
                  <span className="text-sm text-gray-600">
                    Predicted: {metric.predicted}
                  </span>
                </div>
                
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">Confidence</span>
                    <span className="font-medium">{accuracy}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-indigo-600 h-2 rounded-full"
                      style={{ width: `${accuracy}%` }}
                    />
                  </div>
                </div>

                {metric.trend && (
                  <div className={`text-xs ${
                    metric.trend > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {metric.trend > 0 ? '↑' : '↓'} {Math.abs(metric.trend)}% vs last period
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}