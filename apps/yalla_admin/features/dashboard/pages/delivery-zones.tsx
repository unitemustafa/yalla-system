"use client";

import { useEffect, useState } from "react";
import { MapPin, Plus, Save, Trash2 } from "lucide-react";

import { Button, Card, Input, PageTitle } from "../primitives";
import { useSnackbar } from "../snackbar";
import { dashboardFetch } from "@/lib/client-api";

type City = {
  id: string;
  slug: string;
  name: string;
  name_ar: string;
  center_latitude: string;
  center_longitude: string;
  radius_km: string;
  is_active: boolean;
};

const emptyDraft = {
  slug: "",
  name: "",
  name_ar: "",
  center_latitude: "",
  center_longitude: "",
  radius_km: "",
  is_active: true,
};

export function DeliveryZonesPage() {
  const { showSnackbar } = useSnackbar();
  const [cities, setCities] = useState<City[]>([]);
  const [draft, setDraft] = useState(emptyDraft);
  const [editingId, setEditingId] = useState<string | null>(null);

  async function loadCities() {
    const response = await dashboardFetch("cities", { cache: "no-store" });
    const data = await response.json().catch(() => null);
    if (response.ok) setCities(data?.cities ?? []);
  }

  useEffect(() => {
    let active = true;
    dashboardFetch("cities", { cache: "no-store" })
      .then(async (response) => ({
        response,
        data: await response.json().catch(() => null),
      }))
      .then(({ response, data }) => {
        if (active && response.ok) setCities(data?.cities ?? []);
      });
    return () => {
      active = false;
    };
  }, []);

  async function save(event: React.FormEvent) {
    event.preventDefault();
    const response = await dashboardFetch(
      editingId ? `cities/${encodeURIComponent(editingId)}` : "cities",
      {
        method: editingId ? "PATCH" : "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(draft),
      },
    );
    const data = await response.json().catch(() => null);
    if (!response.ok) {
      showSnackbar({ message: data?.message || "تعذر حفظ المدينة.", tone: "danger" });
      return;
    }
    setDraft(emptyDraft);
    setEditingId(null);
    await loadCities();
    showSnackbar({ message: "تم حفظ المدينة." });
  }

  async function remove(city: City) {
    const response = await fetch(
      `cities/${encodeURIComponent(city.id)}`,
      { method: "DELETE" },
    );
    const data = await response.json().catch(() => null);
    if (!response.ok) {
      showSnackbar({ message: data?.message || "تعذر حذف المدينة.", tone: "danger" });
      return;
    }
    await loadCities();
  }

  function edit(city: City) {
    setEditingId(city.id);
    setDraft({
      slug: city.slug,
      name: city.name,
      name_ar: city.name_ar,
      center_latitude: city.center_latitude,
      center_longitude: city.center_longitude,
      radius_km: city.radius_km,
      is_active: city.is_active,
    });
  }

  return (
    <div className="px-6 py-6">
      <PageTitle
        title="المدن"
        description="المدن المدعومة ومراكزها وأنصاف أقطار التغطية."
      />
      <Card className="mt-6 p-5">
        <form className="grid gap-4 md:grid-cols-3" onSubmit={save}>
          {[
            ["slug", "المعرّف"],
            ["name", "الاسم الإنجليزي"],
            ["name_ar", "الاسم العربي"],
            ["center_latitude", "خط العرض"],
            ["center_longitude", "خط الطول"],
            ["radius_km", "نصف القطر كم"],
          ].map(([key, label]) => (
            <label key={key} className="grid gap-2 text-sm font-medium">
              {label}
              <Input
                required={key !== "name_ar"}
                value={String(draft[key as keyof typeof draft])}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, [key]: event.target.value }))
                }
              />
            </label>
          ))}
          <div className="flex items-end gap-2">
            <Button type="submit">
              {editingId ? <Save className="size-4" /> : <Plus className="size-4" />}
              {editingId ? "حفظ التعديل" : "إضافة مدينة"}
            </Button>
          </div>
        </form>
      </Card>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {cities.map((city) => (
          <Card key={city.id} className="p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="flex items-center gap-2 font-bold">
                  <MapPin className="size-4 text-primary" /> {city.name_ar || city.name}
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  {city.center_latitude}, {city.center_longitude}
                </p>
                <p className="text-sm text-muted-foreground">
                  نصف القطر: {city.radius_km} كم
                </p>
              </div>
              <span className={city.is_active ? "text-emerald-500" : "text-muted-foreground"}>
                {city.is_active ? "نشطة" : "متوقفة"}
              </span>
            </div>
            <div className="mt-4 flex gap-2">
              <Button size="sm" variant="outline" onClick={() => edit(city)}>
                تعديل
              </Button>
              <Button size="sm" variant="outline" onClick={() => void remove(city)}>
                <Trash2 className="size-4" /> حذف
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
