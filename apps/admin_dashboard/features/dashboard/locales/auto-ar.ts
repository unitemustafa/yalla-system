import { autoTextEn } from "./auto-en";

export const autoTextAr: Record<string, string> = {
  ...Object.fromEntries(Object.keys(autoTextEn).map((key) => [key, key])),
  Analytics: "التحليلات",
  "Detailed analytics and performance insights": "تحليلات تفصيلية ومؤشرات أداء",
  Overview: "نظرة عامة",
  Revenue: "الإيرادات",
  Items: "الأصناف",
  Payments: "المدفوعات",
  Zones: "المناطق",
  "No data available": "لا توجد بيانات",
};
