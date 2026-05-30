export const branchOptions = [
  { id: "eltall-elkabir", labelKey: "branch.default" },
] as const;

export const deliveryZones = [
  {
    id: "sharm-el-sheikh",
    name: "شرم الشيخ",
    fixedDeliveryFee: 80,
    createdAt: "29 مايو 2026",
  },
  {
    id: "cairo",
    name: "القاهرة",
    fixedDeliveryFee: 45,
    createdAt: "29 مايو 2026",
  },
  {
    id: "mansoura",
    name: "المنصورة",
    fixedDeliveryFee: 40,
    createdAt: "29 مايو 2026",
  },
  {
    id: "tanta",
    name: "طنطا",
    fixedDeliveryFee: 35,
    createdAt: "29 مايو 2026",
  },
  {
    id: "eltall-elkabir",
    name: "التل الكبير",
    fixedDeliveryFee: 25,
    createdAt: "29 مايو 2026",
  },
] as const;

export const deliveryCityOptions = deliveryZones.map((zone) => zone.name);
