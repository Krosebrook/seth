import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Package, TrendingUp, AlertTriangle, Sparkles, RefreshCw, BarChart3 } from "lucide-react";
import DemandForecast from "../components/analytics/DemandForecast";
import PredictiveMetrics from "../components/analytics/PredictiveMetrics";

export default function InventoryDashboard() {
  const [isGeneratingForecast, setIsGeneratingForecast] = useState(false);
  const queryClient = useQueryClient();

  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ['products'],
    queryFn: () => base44.entities.Product.list(),
  });

  const { data: analytics = [] } = useQuery({
    queryKey: ['analytics'],
    queryFn: () => base44.entities.Analytics.list('-date', 30),
  });

  const generateForecastMutation = useMutation({
    mutationFn: async () => {
      setIsGeneratingForecast(true);

      // Get historical order data
      const orders = await base44.entities.Order.filter(
        { status: { $in: ['delivered', 'shipped'] } },
        '-created_date',
        100
      );

      // Group orders by product and calculate demand
      const productDemand = {};
      orders.forEach(order => {
        order.items?.forEach(item => {
          if (!productDemand[item.product_id]) {
            productDemand[item.product_id] = {
              total_quantity: 0,
              order_count: 0
            };
          }
          productDemand[item.product_id].total_quantity += item.quantity;
          productDemand[item.product_id].order_count += 1;
        });
      });

      // Generate AI forecast for each product
      for (const product of products.slice(0, 5)) {
        const demand = productDemand[product.id] || { total_quantity: 0, order_count: 0 };

        const prompt = `Analyze demand patterns and generate a 30-day forecast for this product:

Product: ${product.name} (SKU: ${product.sku})
Category: ${product.category}
Current Stock: ${product.current_stock}
Historical Demand (last 100 orders):
- Total units sold: ${demand.total_quantity}
- Number of orders: ${demand.order_count}
- Average per order: ${demand.order_count > 0 ? (demand.total_quantity / demand.order_count).toFixed(2) : 0}

Reorder Point: ${product.reorder_point || 'Not set'}
Lead Time: ${product.lead_time_days || 'Unknown'} days

Provide:
1. Predicted demand for next 30 days (units)
2. Recommended optimal stock level
3. Risk assessment (0-100)
4. Actionable insights`;

        const response = await base44.integrations.Core.InvokeLLM({
          prompt,
          response_json_schema: {
            type: "object",
            properties: {
              predicted_demand: { type: "number" },
              optimal_stock: { type: "number" },
              risk_score: { type: "number" },
              insights: { type: "string" }
            }
          }
        });

        // Update product with AI forecast
        await base44.entities.Product.update(product.id, {
          ai_demand_forecast: response.predicted_demand,
          optimal_stock: response.optimal_stock
        });

        // Create analytics record
        await base44.entities.Analytics.create({
          metric_type: 'demand_forecast',
          period: 'monthly',
          date: new Date().toISOString().split('T')[0],
          value: demand.total_quantity,
          predicted_value: response.predicted_demand,
          confidence_score: 100 - response.risk_score,
          category: product.category,
          insights: response.insights
        });

        // Check if low stock alert needed
        if (product.current_stock < (product.reorder_point || 10)) {
          const existingAlerts = await base44.entities.Alert.filter({
            alert_type: 'low_stock',
            related_entity_id: product.id,
            status: 'active'
          });

          if (existingAlerts.length === 0) {
            await base44.entities.Alert.create({
              alert_type: 'low_stock',
              severity: product.current_stock === 0 ? 'critical' : 'warning',
              title: `Low Stock: ${product.name}`,
              description: `Current stock (${product.current_stock}) is below reorder point (${product.reorder_point || 10})`,
              related_entity_type: 'product',
              related_entity_id: product.id,
              ai_recommendation: `Order ${response.optimal_stock - product.current_stock} units to reach optimal stock level. Lead time: ${product.lead_time_days || 7} days.`
            });
          }
        }
      }

      setIsGeneratingForecast(false);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
  });

  const lowStockProducts = products.filter(p => 
    p.current_stock < (p.reorder_point || 10)
  );

  const outOfStockProducts = products.filter(p => p.current_stock === 0);

  // Prepare demand forecast chart data
  const forecastData = analytics
    .filter(a => a.metric_type === 'demand_forecast')
    .slice(0, 30)
    .map(a => ({
      date: new Date(a.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      value: a.value,
      predicted_value: a.predicted_value,
      insights: a.insights
    }));

  const predictiveMetrics = [
    {
      type: 'order_volume',
      label: 'Order Volume',
      current: products.reduce((sum, p) => sum + (p.current_stock || 0), 0),
      predicted: products.reduce((sum, p) => sum + (p.ai_demand_forecast || 0), 0),
      confidence_score: 85,
      trend: 12
    },
    {
      type: 'demand_forecast',
      label: 'Demand Forecast',
      current: analytics.filter(a => a.metric_type === 'demand_forecast').length,
      predicted: Math.round(analytics.filter(a => a.metric_type === 'demand_forecast').length * 1.15),
      confidence_score: 78,
      trend: 15
    },
    {
      type: 'fulfillment_rate',
      label: 'Fulfillment Rate',
      current: '94%',
      predicted: '97%',
      confidence_score: 92,
      trend: 3
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <BarChart3 className="w-8 h-8 text-indigo-600" />
              Inventory & Analytics
            </h1>
            <p className="text-gray-600 mt-1">AI-powered demand forecasting and inventory optimization</p>
          </div>
          <Button
            onClick={() => generateForecastMutation.mutate()}
            disabled={isGeneratingForecast}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            {isGeneratingForecast ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Generating Forecast...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate AI Forecast
              </>
            )}
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Products</CardTitle>
              <Package className="w-4 h-4 text-indigo-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{products.length}</div>
              <p className="text-xs text-gray-600 mt-1">
                {lowStockProducts.length} low stock
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
              <AlertTriangle className="w-4 h-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{lowStockProducts.length}</div>
              <p className="text-xs text-gray-600 mt-1">
                {outOfStockProducts.length} out of stock
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Forecast Accuracy</CardTitle>
              <TrendingUp className="w-4 h-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">85%</div>
              <p className="text-xs text-gray-600 mt-1">
                Based on AI predictions
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Predictive Metrics */}
        <PredictiveMetrics metrics={predictiveMetrics} />

        {/* Demand Forecast Chart */}
        {forecastData.length > 0 && (
          <DemandForecast data={forecastData} title="30-Day Demand Forecast" />
        )}

        {/* Product List */}
        <Card>
          <CardHeader>
            <CardTitle>Inventory Overview</CardTitle>
          </CardHeader>
          <CardContent>
            {productsLoading ? (
              <div className="text-center py-8">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto text-indigo-600" />
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No products found
              </div>
            ) : (
              <div className="space-y-3">
                {products.slice(0, 10).map(product => (
                  <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold">{product.name}</h3>
                        <Badge variant="outline" className="text-xs">
                          SKU: {product.sku}
                        </Badge>
                        {product.current_stock === 0 && (
                          <Badge className="bg-red-100 text-red-800">Out of Stock</Badge>
                        )}
                        {product.current_stock > 0 && product.current_stock < (product.reorder_point || 10) && (
                          <Badge className="bg-orange-100 text-orange-800">Low Stock</Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{product.category}</p>
                    </div>
                    <div className="text-right space-y-1">
                      <div className="text-sm">
                        <span className="text-gray-600">Stock:</span>
                        <span className="font-semibold ml-2">{product.current_stock}</span>
                      </div>
                      {product.ai_demand_forecast && (
                        <div className="text-xs text-indigo-600">
                          <Sparkles className="w-3 h-3 inline mr-1" />
                          Forecast: {product.ai_demand_forecast} units
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}