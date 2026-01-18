import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Filter, RefreshCw, Sparkles, Package } from "lucide-react";
import OrderCard from "../components/orders/OrderCard";
import AIStatusUpdater from "../components/orders/AIStatusUpdater";
import StockAlert from "../components/inventory/StockAlert";

export default function OrderManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showStatusUpdater, setShowStatusUpdater] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const queryClient = useQueryClient();

  const { data: orders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: () => base44.entities.Order.list('-created_date'),
  });

  const { data: alerts = [] } = useQuery({
    queryKey: ['alerts'],
    queryFn: () => base44.entities.Alert.filter({ status: 'active' }, '-created_date'),
  });

  const updateAlertMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Alert.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
    },
  });

  const analyzeOrdersMutation = useMutation({
    mutationFn: async () => {
      setIsAnalyzing(true);
      
      for (const order of orders.slice(0, 10)) {
        if (order.status === 'delivered' || order.status === 'cancelled') continue;

        const prompt = `Analyze this order for potential fulfillment risks:

Order: #${order.order_number}
Status: ${order.status}
Items: ${order.items?.length || 0}
Total: $${order.total_amount}
${order.estimated_delivery ? `Estimated Delivery: ${order.estimated_delivery}` : ''}
Priority: ${order.priority}

Assess the risk score (0-100) and provide insights on:
- Likelihood of delays
- Stock availability concerns
- Shipping complications
- Customer satisfaction risks

Return a risk score and brief notes.`;

        const response = await base44.integrations.Core.InvokeLLM({
          prompt,
          response_json_schema: {
            type: "object",
            properties: {
              risk_score: { type: "number" },
              notes: { type: "string" }
            }
          }
        });

        await base44.entities.Order.update(order.id, {
          ai_risk_score: response.risk_score,
          ai_notes: response.notes
        });
      }

      setIsAnalyzing(false);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });

  const filteredOrders = orders.filter(order => {
    const matchesSearch = !searchQuery || 
      order.order_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer_email?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleStatusUpdate = (order) => {
    setSelectedOrder(order);
    setShowStatusUpdater(true);
  };

  const handleAcknowledgeAlert = async (alert) => {
    const user = await base44.auth.me();
    updateAlertMutation.mutate({
      id: alert.id,
      data: { status: 'acknowledged', acknowledged_by: user.email }
    });
  };

  const handleResolveAlert = async (alert) => {
    updateAlertMutation.mutate({
      id: alert.id,
      data: { status: 'resolved', resolved_at: new Date().toISOString() }
    });
  };

  const criticalAlerts = alerts.filter(a => a.severity === 'critical');
  const warningAlerts = alerts.filter(a => a.severity === 'warning');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Package className="w-8 h-8 text-indigo-600" />
              Order Management
            </h1>
            <p className="text-gray-600 mt-1">AI-powered order tracking and fulfillment</p>
          </div>
          <Button
            onClick={() => analyzeOrdersMutation.mutate()}
            disabled={isAnalyzing}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            {isAnalyzing ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                AI Risk Analysis
              </>
            )}
          </Button>
        </div>

        <Tabs defaultValue="orders" className="space-y-6">
          <TabsList>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="alerts">
              Alerts
              {alerts.length > 0 && (
                <span className="ml-2 bg-red-600 text-white text-xs rounded-full px-2 py-0.5">
                  {alerts.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="space-y-6">
            <div className="flex gap-4 flex-wrap">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search orders..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="delayed">Delayed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {ordersLoading ? (
              <div className="text-center py-12">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto text-indigo-600" />
                <p className="text-gray-600 mt-4">Loading orders...</p>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-12 h-12 mx-auto text-gray-400" />
                <p className="text-gray-600 mt-4">No orders found</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredOrders.map(order => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    onStatusUpdate={handleStatusUpdate}
                    onViewDetails={(o) => setSelectedOrder(o)}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="alerts" className="space-y-6">
            {criticalAlerts.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-4 text-red-700">Critical Alerts</h2>
                <div className="space-y-4">
                  {criticalAlerts.map(alert => (
                    <StockAlert
                      key={alert.id}
                      alert={alert}
                      onAcknowledge={handleAcknowledgeAlert}
                      onResolve={handleResolveAlert}
                    />
                  ))}
                </div>
              </div>
            )}

            {warningAlerts.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-4 text-orange-700">Warnings</h2>
                <div className="space-y-4">
                  {warningAlerts.map(alert => (
                    <StockAlert
                      key={alert.id}
                      alert={alert}
                      onAcknowledge={handleAcknowledgeAlert}
                      onResolve={handleResolveAlert}
                    />
                  ))}
                </div>
              </div>
            )}

            {alerts.length === 0 && (
              <div className="text-center py-12">
                <Sparkles className="w-12 h-12 mx-auto text-gray-400" />
                <p className="text-gray-600 mt-4">No active alerts</p>
                <p className="text-sm text-gray-500 mt-2">All systems running smoothly!</p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {selectedOrder && (
          <AIStatusUpdater
            order={selectedOrder}
            open={showStatusUpdater}
            onClose={() => {
              setShowStatusUpdater(false);
              setSelectedOrder(null);
            }}
            onUpdate={() => {
              queryClient.invalidateQueries({ queryKey: ['orders'] });
            }}
          />
        )}
      </div>
    </div>
  );
}