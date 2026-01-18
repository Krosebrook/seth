import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, PackageX, TrendingUp, Truck, AlertCircle, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";

export default function StockAlert({ alert, onAcknowledge, onResolve }) {
  const severityConfig = {
    info: { icon: AlertCircle, color: "bg-blue-100 text-blue-800 border-blue-200", iconColor: "text-blue-600" },
    warning: { icon: AlertTriangle, color: "bg-orange-100 text-orange-800 border-orange-200", iconColor: "text-orange-600" },
    critical: { icon: PackageX, color: "bg-red-100 text-red-800 border-red-200", iconColor: "text-red-600" }
  };

  const typeIcons = {
    low_stock: AlertTriangle,
    out_of_stock: PackageX,
    fulfillment_risk: AlertCircle,
    demand_surge: TrendingUp,
    supplier_delay: Truck,
    quality_issue: AlertCircle
  };

  const config = severityConfig[alert.severity] || severityConfig.info;
  const SeverityIcon = config.icon;
  const TypeIcon = typeIcons[alert.alert_type] || AlertCircle;

  return (
    <Card className={`border-l-4 ${config.color}`}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex items-start gap-3">
            <SeverityIcon className={`w-6 h-6 ${config.iconColor} mt-1`} />
            <div>
              <CardTitle className="text-lg">{alert.title}</CardTitle>
              <div className="flex gap-2 mt-2">
                <Badge className={config.color}>
                  {alert.severity}
                </Badge>
                <Badge variant="outline" className="flex items-center gap-1">
                  <TypeIcon className="w-3 h-3" />
                  {alert.alert_type.replace(/_/g, ' ')}
                </Badge>
              </div>
            </div>
          </div>
          {alert.status === "active" && (
            <Badge variant="outline" className="bg-yellow-50">
              Active
            </Badge>
          )}
          {alert.status === "acknowledged" && (
            <Badge variant="outline" className="bg-blue-50">
              Acknowledged
            </Badge>
          )}
          {alert.status === "resolved" && (
            <Badge className="bg-green-100 text-green-800">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Resolved
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-gray-700">{alert.description}</p>

        {alert.ai_recommendation && (
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3">
            <p className="text-sm font-medium text-indigo-900 mb-1">AI Recommendation</p>
            <p className="text-sm text-indigo-700">{alert.ai_recommendation}</p>
          </div>
        )}

        {alert.related_entity_type && alert.related_entity_id && (
          <div className="text-sm text-gray-600">
            <span className="font-medium">Related {alert.related_entity_type}:</span>
            <span className="ml-2">{alert.related_entity_id}</span>
          </div>
        )}

        {alert.acknowledged_by && (
          <div className="text-sm text-gray-600">
            <span className="font-medium">Acknowledged by:</span>
            <span className="ml-2">{alert.acknowledged_by}</span>
          </div>
        )}

        {alert.resolved_at && (
          <div className="text-sm text-gray-600">
            <span className="font-medium">Resolved:</span>
            <span className="ml-2">{format(new Date(alert.resolved_at), 'MMM d, yyyy h:mm a')}</span>
          </div>
        )}

        {alert.status !== "resolved" && (
          <div className="flex gap-2 pt-2">
            {alert.status === "active" && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onAcknowledge(alert)}
              >
                Acknowledge
              </Button>
            )}
            <Button
              size="sm"
              onClick={() => onResolve(alert)}
              className="bg-green-600 hover:bg-green-700"
            >
              Mark Resolved
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}