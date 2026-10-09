// Payments through Paystack.
//
// DEMO MODE (default): no real payment, it just succeeds after a short wait so you can test the flow.
// LIVE MODE: set VITE_PAYMENTS_LIVE=true. Then it:
//   1. asks your Netlify Function to start a Paystack transaction,
//   2. opens Paystack's secure window (mobile money, card, bank transfer),
//   3. asks your Netlify Function to verify the payment before the order is saved.
// The secret key only ever lives in the function (PAYSTACK_SECRET_KEY on Netlify).

const LIVE = import.meta.env.VITE_PAYMENTS_LIVE === "true";
const INLINE_SRC = "https://js.paystack.co/v2/inline.js";

function loadPaystack() {
  if (window.PaystackPop) return Promise.resolve(window.PaystackPop);
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = INLINE_SRC;
    script.async = true;
    script.onload = () => resolve(window.PaystackPop);
    script.onerror = () => reject(new Error("Couldn't load the payment window."));
    document.head.appendChild(script);
  });
}

// Paystack needs a currency code. Your prices use "$", so that means USD.
// Your Paystack account must have that currency enabled, or price in GHS instead.
const currencyCode = (symbol) => (symbol === "$" ? "USD" : symbol);

export async function startPayment(order) {
  if (!LIVE) {
    await new Promise((resolve) => setTimeout(resolve, 800));
    return { reference: `DEMO-${Date.now()}` };
  }

  const currency = currencyCode(order.currency);

  const init = await fetch("/.netlify/functions/paystack-init", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: order.customer.email,
      amount: order.total,
      currency,
      items: order.items.map(({ id, name, qty }) => ({ id, name, qty })),
      shippingMethod: order.shippingMethod,
      customer: {
        name: `${order.customer.firstName} ${order.customer.lastName}`.trim(),
        phone: order.customer.phone,
        address: order.customer.address,
        apartment: order.customer.apartment,
        city: order.customer.city,
        postal: order.customer.postal,
        country: order.customer.country,
      },
    }),
  });
  if (!init.ok) throw new Error("Couldn't start the payment.");
  const { access_code: accessCode, reference } = await init.json();

  const PaystackPop = await loadPaystack();
  await new Promise((resolve, reject) => {
    new PaystackPop().resumeTransaction(accessCode, {
      onSuccess: () => resolve(),
      onCancel: () => reject(new Error("Payment cancelled.")),
      onError: (error) => reject(new Error(error?.message ?? "Payment failed.")),
    });
  });

  const verify = await fetch(
    `/.netlify/functions/paystack-verify?reference=${encodeURIComponent(reference)}&amount=${order.total}&currency=${currency}`
  );
  const result = await verify.json().catch(() => ({}));
  if (!verify.ok || !result.paid) throw new Error("We couldn't confirm your payment.");

  return { reference };
}