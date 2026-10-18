export const CONFIG = {
  scriptUrl:
    "https://script.google.com/macros/s/AKfycbwxvoeuikW6ovZBp6axU4Tmz9GYsTOLsQAMyfjxq_Q14oOlwRkVV92zLoDOgiT4_dpo7Q/exec",
  whatsapp: "2347066637888",
  pricePerSeat: 5000,
  groupPrice: 10000,
  baseSlots: ["4:00 PM", "5:00 PM", "6:00 PM", "7:00 PM", "8:00 PM", "9:00 PM"],
  siteName: "Gobir Digital",
};

export const waLink = (text?: string) =>
  `https://wa.me/${CONFIG.whatsapp}${text ? `?text=${encodeURIComponent(text)}` : ""}`;

export const priceFor = (n: number) => (n > 1 ? CONFIG.groupPrice : CONFIG.pricePerSeat);

export const ngn = (n: number) => "₦" + Number(n).toLocaleString("en-NG");
