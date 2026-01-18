import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Sparkles } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function AIStatusUpdater({ order, open, onClose, onUpdate }) {
  const [status, setStatus] = useState(order?.status || "pending");
  const [sendNotification, setSendNotification] = useState(true);
  const [customMessage, setCustomMessage] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const statusOptions = [
    { value: "pending", label: "Pending" },
    { value: "processing", label: "Processing" },
    { value: "shipped", label: "Shipped" },
    { value: "delivered", label: "Delivered" },
    { value: "delayed", label: "Delayed" },
    { value: "cancelled", label: "Cancelled" }
  ];

  const generatePersonalizedMessage = async () => {
    setIsGenerating(true);
    try {
      const prompt = `Generate a personalized, friendly customer notification message for an order status update.
      
Order Details:
- Order Number: ${order.order_number}
- Customer Name: ${order.customer_name}
- Current Status: ${order.status}
- New Status: ${status}
- Items: ${order.items?.length || 0} items
- Total: $${order.total_amount}
${order.estimated_delivery ? `- Estimated Delivery: ${order.estimated_delivery}` : ''}
${order.tracking_number ? `- Tracking Number: ${order.tracking_number}` : ''}

Requirements:
- Warm and professional tone
- Clear and concise (2-3 sentences)
- Address customer by name
- Include relevant details based on status change
- Add helpful next steps if applicable
- Keep it under 150 words`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            message: { type: "string" }
          }
        }
      });

      setCustomMessage(response.message);
    } catch (error) {
      console.error("Error generating message:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUpdate = async () => {
    setIsUpdating(true);
    try {
      // Update order status
      await base44.entities.Order.update(order.id, { status });

      // Send notification if requested
      if (sendNotification) {
        const subjectMap = {
          processing: `Order ${order.order_number} is being processed`,
          shipped: `Your order ${order.order_number} has shipped!`,
          delivered: `Order ${order.order_number} delivered`,
          delayed: `Update on your order ${order.order_number}`,
          cancelled: `Order ${order.order_number} cancellation notice`
        };

        const notificationMessage = customMessage || `Your order status has been updated to: ${status}`;

        await base44.entities.Notification.create({
          order_id: order.id,
          recipient_email: order.customer_email,
          type: status === "shipped" ? "shipping_update" : 
                status === "delayed" ? "delay_notice" : 
                status === "delivered" ? "delivery_confirmation" :
                status === "cancelled" ? "cancellation" : "order_confirmation",
          subject: subjectMap[status] || `Order ${order.order_number} update`,
          message: notificationMessage,
          ai_personalization: {
            tone: "friendly-professional",
            custom_message: customMessage
          }
        });

        // Send actual email
        if (customMessage) {
          await base44.integrations.Core.SendEmail({
            to: order.customer_email,
            subject: subjectMap[status] || `Order ${order.order_number} update`,
            body: notificationMessage
          });
        }
      }

      onUpdate();
      onClose();
    } catch (error) {
      console.error("Error updating order:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Update Order Status - #{order?.order_number}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">New Status</label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="notification"
              checked={sendNotification}
              onCheckedChange={setSendNotification}
            />
            <label htmlFor="notification" className="text-sm font-medium">
              Send customer notification
            </label>
          </div>

          {sendNotification && (
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium">Custom Message</label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={generatePersonalizedMessage}
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      AI Generate
                    </>
                  )}
                </Button>
              </div>
              <Textarea
                placeholder="Enter a custom message for the customer (optional)"
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                rows={4}
              />
              <p className="text-xs text-gray-500 mt-1">
                AI can generate a personalized message based on order details
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isUpdating}>
            Cancel
          </Button>
          <Button
            onClick={handleUpdate}
            disabled={isUpdating}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            {isUpdating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Updating...
              </>
            ) : (
              "Update Order"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}