import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, Truck, AlertTriangle, CheckCircle2, Clock, XCircle } from "lucide-react";
import { format } from "date-fns";

export default function OrderCard({ order, onStatusUpdate, onViewDetails }) {
  const statusConfig = {
    pending: { icon: Clock, color: "bg-yellow-100 text-yellow-800", label: "Pending" },
    processing: { icon: Package, color: "bg-blue-100 text-blue-800", label: "Processing" },
    shipped: { icon: Truck, color: "bg-purple-100 text-purple-800", label: "Shipped" },
    delivered: { icon: CheckCircle2, color: "bg-green-100 text-green-800", label: "Delivered" },
    delayed: { icon: AlertTriangle, color: "bg-orange-100 text-orange-800", label: "Delayed" },
    cancelled: { icon: XCircle, color: "bg-red-100 text-red-800", label: "Cancelled" }
  };

  const priorityConfig = {
    low: "bg-gray-100 text-gray-800",
    normal: "bg-blue-100 text-blue-800",
    high: "bg-orange-100 text-orange-800",
    urgent: "bg-red-100 text-red-800"
  };

  const config = statusConfig[order.status] || statusConfig.pending;
  const StatusIcon = config.icon;

  const getRiskLevel = (score) => {
    if (score >= 70) return { label: "High Risk", color: "text-red-600" };
    if (score >= 40) return { label: "Medium Risk", color: "text-orange-600" };
    return { label: "Low Risk", color: "text-green-600" };
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <StatusIcon className="w-5 h-5" />
              Order #{order.order_number}
            </CardTitle>
            <p className="text-sm text-gray-600 mt-1">{order.customer_name}</p>
          </div>
          <div className="flex flex-col gap-2 items-end">
            <Badge className={config.color}>
              {config.label}
            </Badge>
            {order.priority !== "normal" && (
              <Badge className={priorityConfig[order.priority]}>
                {order.priority} priority
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Total:</span>
            <span className="font-semibold ml-2">${order.total_amount?.toFixed(2)}</span>
          </div>
          <div>
            <span className="text-gray-600">Items:</span>
            <span className="font-semibold ml-2">{order.items?.length || 0}</span>
          </div>
          {order.estimated_delivery && (
            <div className="col-span-2">
              <span className="text-gray-600">Est. Delivery:</span>
              <span className="font-semibold ml-2">
                {format(new Date(order.estimated_delivery), 'MMM d, yyyy')}
              </span>
            </div>
          )}
        </div>

        {order.ai_risk_score !== undefined && (
          <div className="border-t pt-3">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">AI Risk Assessment</span>
              <span className={`text-sm font-semibold ${getRiskLevel(order.ai_risk_score).color}`}>
                {getRiskLevel(order.ai_risk_score).label}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${
                  order.ai_risk_score >= 70 ? 'bg-red-500' :
                  order.ai_risk_score >= 40 ? 'bg-orange-500' : 'bg-green-500'
                }`}
                style={{ width: `${order.ai_risk_score}%` }}
              />
            </div>
            {order.ai_notes && (
              <p className="text-xs text-gray-600 mt-2 italic">{order.ai_notes}</p>
            )}
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewDetails(order)}
            className="flex-1"
          >
            View Details
          </Button>
          {order.status !== "delivered" && order.status !== "cancelled" && (
            <Button
              size="sm"
              onClick={() => onStatusUpdate(order)}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700"
            >
              Update Status
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}