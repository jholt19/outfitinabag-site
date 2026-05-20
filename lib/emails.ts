import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY;
const emailFrom = process.env.EMAIL_FROM || "onboarding@resend.dev";

export const resend = resendApiKey ? new Resend(resendApiKey) : null;

export async function sendOrderConfirmationEmail({
  to,
  orderNumber,
  total,
}: {
  to: string;
  orderNumber: string;
  total: string;
}) {
  if (!resend || !to) return;

  await resend.emails.send({
    from: emailFrom,
    to,
    subject: `Your OutfitInABag order ${orderNumber} is confirmed`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h1>Order confirmed</h1>
        <p>Thank you for shopping with OutfitInABag.</p>
        <p><strong>Order:</strong> ${orderNumber}</p>
        <p><strong>Total:</strong> ${total}</p>
        <p>You can view your order status from your account.</p>
      </div>
    `,
  });
}

export async function sendShippingUpdateEmail({
  to,
  orderNumber,
  status,
  carrier,
  trackingNumber,
}: {
  to: string;
  orderNumber: string;
  status: string;
  carrier?: string | null;
  trackingNumber?: string | null;
}) {
  if (!resend || !to) return;

  await resend.emails.send({
    from: emailFrom,
    to,
    subject: `Order ${orderNumber} update: ${status}`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h1>Shipping update</h1>
        <p>Your OutfitInABag order has been updated.</p>
        <p><strong>Order:</strong> ${orderNumber}</p>
        <p><strong>Status:</strong> ${status}</p>
        ${
          carrier
            ? `<p><strong>Carrier:</strong> ${carrier}</p>`
            : ""
        }
        ${
          trackingNumber
            ? `<p><strong>Tracking #:</strong> ${trackingNumber}</p>`
            : ""
        }
      </div>
    `,
  });
}