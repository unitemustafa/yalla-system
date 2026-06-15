export type DeliveryPricingType = "fixed" | "distance_based" | "mixed";

export type DeliveryZoneStatus = "active" | "paused" | "unavailable";

export type DeliveryZone = {
  id: string;
  name: string;
  pricingType: DeliveryPricingType;
  fixedDeliveryPrice: number;
  basePrice: number;
  includedKm: number;
  pricePerExtraKm: number;
  minOrderAmount: number;
  maxDistanceKm: number;
  estimatedDeliveryMinutes: number;
  status: DeliveryZoneStatus;
  notes: string;
  createdAt: string;
  updatedAt: string;
};

export type DeliverySettings = {
  id: string;
  enableOutsideZonesDelivery: boolean;
  basePrice: number;
  includedKm: number;
  pricePerExtraKm: number;
  maxDistanceKm: number;
  outsideZoneUnavailableMessage: string;
  createdAt: string;
  updatedAt: string;
};

export type DeliveryFeeResult = {
  available: boolean;
  zoneName: string;
  pricingType: DeliveryPricingType | "outside_zone";
  distanceKm: number;
  deliveryFee: number;
  unavailableReason?: string;
};

export const initialDeliverySettings: DeliverySettings = {
  id: "outside-zones-default",
  enableOutsideZonesDelivery: true,
  basePrice: 20,
  includedKm: 3,
  pricePerExtraKm: 5,
  maxDistanceKm: 15,
  outsideZoneUnavailableMessage: "عذرًا، عنوانك خارج نطاق التوصيل الحالي.",
  createdAt: "2026-05-29",
  updatedAt: "2026-05-29",
};

export const initialManagedDeliveryZones: DeliveryZone[] = [
  {
    id: "sharm-el-sheikh",
    name: "شرم الشيخ",
    pricingType: "fixed",
    fixedDeliveryPrice: 80,
    basePrice: 0,
    includedKm: 0,
    pricePerExtraKm: 0,
    minOrderAmount: 250,
    maxDistanceKm: 20,
    estimatedDeliveryMinutes: 55,
    status: "active",
    notes: "توصيل داخل نطاق المدينة.",
    createdAt: "2026-05-29",
    updatedAt: "2026-05-29",
  },
  {
    id: "cairo",
    name: "القاهرة",
    pricingType: "mixed",
    fixedDeliveryPrice: 45,
    basePrice: 0,
    includedKm: 5,
    pricePerExtraKm: 7,
    minOrderAmount: 150,
    maxDistanceKm: 30,
    estimatedDeliveryMinutes: 45,
    status: "active",
    notes: "السعر الثابت يغطي أول 5 كم.",
    createdAt: "2026-05-29",
    updatedAt: "2026-05-29",
  },
  {
    id: "mansoura",
    name: "المنصورة",
    pricingType: "distance_based",
    fixedDeliveryPrice: 0,
    basePrice: 35,
    includedKm: 4,
    pricePerExtraKm: 6,
    minOrderAmount: 120,
    maxDistanceKm: 18,
    estimatedDeliveryMinutes: 35,
    status: "active",
    notes: "",
    createdAt: "2026-05-29",
    updatedAt: "2026-05-29",
  },
  {
    id: "tanta",
    name: "طنطا",
    pricingType: "fixed",
    fixedDeliveryPrice: 35,
    basePrice: 0,
    includedKm: 0,
    pricePerExtraKm: 0,
    minOrderAmount: 100,
    maxDistanceKm: 16,
    estimatedDeliveryMinutes: 30,
    status: "paused",
    notes: "متوقفة مؤقتًا بسبب ضغط الطلبات.",
    createdAt: "2026-05-29",
    updatedAt: "2026-05-29",
  },
  {
    id: "eltall-elkabir",
    name: "التل الكبير",
    pricingType: "fixed",
    fixedDeliveryPrice: 25,
    basePrice: 0,
    includedKm: 0,
    pricePerExtraKm: 0,
    minOrderAmount: 80,
    maxDistanceKm: 12,
    estimatedDeliveryMinutes: 25,
    status: "active",
    notes: "",
    createdAt: "2026-05-29",
    updatedAt: "2026-05-29",
  },
];

export function calculateDeliveryFee({
  zone,
  settings,
  distanceKm,
}: {
  zone?: DeliveryZone | null;
  settings: DeliverySettings;
  distanceKm: number;
}): DeliveryFeeResult {
  const safeDistanceKm = Math.max(0, distanceKm);

  if (zone) {
    if (zone.status !== "active") {
      return {
        available: false,
        zoneName: zone.name,
        pricingType: zone.pricingType,
        distanceKm: safeDistanceKm,
        deliveryFee: 0,
        unavailableReason:
          zone.status === "paused"
            ? "المنطقة متوقفة مؤقتًا."
            : "التوصيل غير متاح في هذه المنطقة.",
      };
    }

    if (
      (zone.pricingType === "distance_based" || zone.pricingType === "mixed") &&
      safeDistanceKm > zone.maxDistanceKm
    ) {
      return {
        available: false,
        zoneName: zone.name,
        pricingType: zone.pricingType,
        distanceKm: safeDistanceKm,
        deliveryFee: 0,
        unavailableReason: "المسافة أكبر من أقصى مسافة توصيل للمنطقة.",
      };
    }

    if (zone.pricingType === "fixed") {
      return {
        available: true,
        zoneName: zone.name,
        pricingType: zone.pricingType,
        distanceKm: safeDistanceKm,
        deliveryFee: zone.fixedDeliveryPrice,
      };
    }

    if (zone.pricingType === "distance_based") {
      return {
        available: true,
        zoneName: zone.name,
        pricingType: zone.pricingType,
        distanceKm: safeDistanceKm,
        deliveryFee:
          zone.basePrice +
          Math.max(0, safeDistanceKm - zone.includedKm) * zone.pricePerExtraKm,
      };
    }

    return {
      available: true,
      zoneName: zone.name,
      pricingType: zone.pricingType,
      distanceKm: safeDistanceKm,
      deliveryFee:
        zone.fixedDeliveryPrice +
        Math.max(0, safeDistanceKm - zone.includedKm) * zone.pricePerExtraKm,
    };
  }

  if (!settings.enableOutsideZonesDelivery) {
    return {
      available: false,
      zoneName: "خارج المناطق المحددة",
      pricingType: "outside_zone",
      distanceKm: safeDistanceKm,
      deliveryFee: 0,
      unavailableReason: settings.outsideZoneUnavailableMessage,
    };
  }

  if (safeDistanceKm > settings.maxDistanceKm) {
    return {
      available: false,
      zoneName: "خارج المناطق المحددة",
      pricingType: "outside_zone",
      distanceKm: safeDistanceKm,
      deliveryFee: 0,
      unavailableReason: settings.outsideZoneUnavailableMessage,
    };
  }

  return {
    available: true,
    zoneName: "خارج المناطق المحددة",
    pricingType: "outside_zone",
    distanceKm: safeDistanceKm,
    deliveryFee:
      settings.basePrice +
      Math.max(0, safeDistanceKm - settings.includedKm) *
        settings.pricePerExtraKm,
  };
}
