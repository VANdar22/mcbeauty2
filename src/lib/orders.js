export const ORDER_STEPS = [
    ["placed", "Order placed"],
    ["processing", "Processing"],
    ["shipped", "Shipped"],
    ["out_for_delivery", "Out for delivery"],
    ["delivered", "Delivered"],
  ];
  
  const HOUR = 60 * 60 * 1000;
  
  const STEP_NOTES = {
    placed: "We've received your order.",
    processing: "We're packing your order.",
    shipped: "Your package has left our warehouse.",
    out_for_delivery: "Your package is on its way.",
    delivered: "Your package has been delivered.",
  };
  
  // Hours after the order was placed that each step happens.
  const STEP_OFFSET_HOURS = {
    placed: 0,
    processing: 12,
    shipped: 36,
    out_for_delivery: 72,
    delivered: 84,
  };
  
  // Sample orders: one for every status. Look them up with any valid email.
  // Delete this block once you're using your real API.
  const SAMPLE_ORDERS = [
    {
      number: "MC-1001",
      status: "delivered",
      placedHoursAgo: 120,
      shipTo: "Accra, Ghana",
      carrier: "DHL Express",
      trackingNumber: "JD014600003SE",
      items: [
        { name: "Gentle Foaming Cleanser", qty: 1 },
        { name: "Niacinamide 10% Serum", qty: 2 },
      ],
    },
    {
      number: "MC-1002",
      status: "shipped",
      placedHoursAgo: 60,
      shipTo: "Kumasi, Ghana",
      carrier: "DHL Express",
      trackingNumber: "JD014600007GH",
      items: [{ name: "Amber Rose Eau de Parfum", qty: 1 }],
    },
    {
      number: "MC-1003",
      status: "out_for_delivery",
      placedHoursAgo: 80,
      shipTo: "Tema, Ghana",
      carrier: "Yango Delivery",
      trackingNumber: "YD88213045",
      items: [
        { name: "Daily Moisturizing Lotion", qty: 1 },
        { name: "Ultra Sheer Sunscreen SPF 50", qty: 1 },
      ],
    },
    {
      number: "MC-1004",
      status: "processing",
      placedHoursAgo: 20,
      shipTo: "Accra, Ghana",
      items: [{ name: "Deep Conditioning Hair Mask", qty: 2 }],
    },
    {
      number: "MC-1005",
      status: "placed",
      placedHoursAgo: 2,
      shipTo: "Takoradi, Ghana",
      items: [{ name: "Fresh Linen Body Mist", qty: 1 }],
    },
  ];
  
  function buildOrder(spec) {
    const placedAt = Date.now() - spec.placedHoursAgo * HOUR;
    const reachedCount = ORDER_STEPS.findIndex(([key]) => key === spec.status) + 1;
  
    const updates = ORDER_STEPS.slice(0, reachedCount).map(([key]) => ({
      status: key,
      note: STEP_NOTES[key],
      at: placedAt + STEP_OFFSET_HOURS[key] * HOUR,
    }));
  
    const deliveredAt = updates.find((u) => u.status === "delivered")?.at;
    const shipped = reachedCount >= 3;
  
    return {
      number: spec.number,
      status: spec.status,
      placedAt,
      eta: deliveredAt ?? placedAt + 96 * HOUR,
      carrier: shipped ? spec.carrier : null,
      trackingNumber: shipped ? spec.trackingNumber : null,
      shipTo: spec.shipTo,
      items: spec.items,
      updates,
    };
  }
  
  // TODO: replace with your API call. Return null when no order matches.
  // const res = await fetch("/api/orders/track", {
  //   method: "POST",
  //   headers: { "Content-Type": "application/json" },
  //   body: JSON.stringify({ orderNumber, email }),
  // });
  // if (res.status === 404) return null;
  // if (!res.ok) throw new Error("Lookup failed");
  // return res.json();
  //
  // Your API can return `carrier` and `trackingNumber` as null until the order ships.
  export async function trackOrder(orderNumber, email) {
    await new Promise((resolve) => setTimeout(resolve, 600));
  
    if (!/^\S+@\S+\.\S+$/.test(email)) return null;
  
    const spec = SAMPLE_ORDERS.find((o) => o.number === orderNumber.trim().toUpperCase());
    return spec ? buildOrder(spec) : null;
  }