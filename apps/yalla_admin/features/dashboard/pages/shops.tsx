"use client";

import { useEffect, useState } from "react";
import { Plus, Store, Trash2 } from "lucide-react";

import { Button, Card, Input, PageTitle } from "../primitives";
import { useSnackbar } from "../snackbar";
import { dashboardFetch } from "@/lib/client-api";

type Market = {
  id: string;
  name: string;
  branch: string;
  status: "active" | "inactive";
  city_id: string;
  city_name: string;
  classification_id: number;
  classification_name: string;
};
type Option = { id: string | number; name: string };

export function ShopsPage() {
  const { showSnackbar } = useSnackbar();
  const [markets, setMarkets] = useState<Market[]>([]);
  const [cities, setCities] = useState<Option[]>([]);
  const [classifications, setClassifications] = useState<Option[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState({
    name: "",
    branch: "",
    city_id: "",
    classification_id: "",
    status: "active",
  });

  async function load() {
    const [marketsResponse, citiesResponse, classificationsResponse] =
      await Promise.all([
        dashboardFetch("markets", { cache: "no-store" }),
        dashboardFetch("cities", { cache: "no-store" }),
        dashboardFetch("market-classifications", { cache: "no-store" }),
      ]);
    const [marketsData, citiesData, classificationsData] = await Promise.all([
      marketsResponse.json().catch(() => null),
      citiesResponse.json().catch(() => null),
      classificationsResponse.json().catch(() => null),
    ]);
    if (marketsResponse.ok) setMarkets(marketsData?.markets ?? []);
    if (citiesResponse.ok) setCities(citiesData?.cities ?? []);
    if (classificationsResponse.ok) {
      setClassifications(classificationsData?.classifications ?? []);
    }
  }

  useEffect(() => {
    let active = true;
    Promise.all([
      dashboardFetch("markets", { cache: "no-store" }),
      dashboardFetch("cities", { cache: "no-store" }),
      dashboardFetch("market-classifications", { cache: "no-store" }),
    ]).then(async ([marketsResponse, citiesResponse, classificationsResponse]) => {
      const [marketsData, citiesData, classificationsData] = await Promise.all([
        marketsResponse.json().catch(() => null),
        citiesResponse.json().catch(() => null),
        classificationsResponse.json().catch(() => null),
      ]);
      if (!active) return;
      if (marketsResponse.ok) setMarkets(marketsData?.markets ?? []);
      if (citiesResponse.ok) setCities(citiesData?.cities ?? []);
      if (classificationsResponse.ok) {
        setClassifications(classificationsData?.classifications ?? []);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  async function create(event: React.FormEvent) {
    event.preventDefault();
    const response = await dashboardFetch(
      editingId ? `markets/${editingId}` : "markets",
      {
      method: editingId ? "PATCH" : "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        ...draft,
        classification_id: Number(draft.classification_id),
      }),
      },
    );
    const data = await response.json().catch(() => null);
    if (!response.ok) {
      showSnackbar({
        message: data?.message || "يجب اختيار مدينة وتصنيف صالحين.",
        tone: "danger",
      });
      return;
    }
    setDraft({
      name: "",
      branch: "",
      city_id: "",
      classification_id: "",
      status: "active",
    });
    setEditingId(null);
    await load();
  }

  function edit(market: Market) {
    setEditingId(market.id);
    setDraft({
      name: market.name,
      branch: market.branch,
      city_id: market.city_id,
      classification_id: String(market.classification_id),
      status: market.status,
    });
  }

  async function remove(id: string) {
    const response = await dashboardFetch(`markets/${id}`, {
      method: "DELETE",
    });
    const data = await response.json().catch(() => null);
    if (!response.ok) {
      showSnackbar({ message: data?.message || "تعذر حذف السوق.", tone: "danger" });
      return;
    }
    await load();
  }

  return (
    <div className="px-6 py-6">
      <PageTitle
        title="الأسواق"
        description="كل سوق يجب أن يرتبط بمدينة موجودة في الباك اند."
      />
      <Card className="mt-6 p-5">
        <form className="grid gap-4 md:grid-cols-2 xl:grid-cols-5" onSubmit={create}>
          <Input
            required
            placeholder="اسم السوق"
            value={draft.name}
            onChange={(e) => setDraft((value) => ({ ...value, name: e.target.value }))}
          />
          <Input
            placeholder="الفرع"
            value={draft.branch}
            onChange={(e) => setDraft((value) => ({ ...value, branch: e.target.value }))}
          />
          <select
            required
            className="h-10 rounded-md border bg-background px-3 text-sm"
            value={draft.city_id}
            onChange={(e) => setDraft((value) => ({ ...value, city_id: e.target.value }))}
          >
            <option value="">اختر المدينة</option>
            {cities.map((city) => (
              <option key={city.id} value={city.id}>{city.name}</option>
            ))}
          </select>
          <select
            required
            className="h-10 rounded-md border bg-background px-3 text-sm"
            value={draft.classification_id}
            onChange={(e) =>
              setDraft((value) => ({ ...value, classification_id: e.target.value }))
            }
          >
            <option value="">اختر التصنيف</option>
            {classifications.map((item) => (
              <option key={item.id} value={item.id}>{item.name}</option>
            ))}
          </select>
          <Button type="submit">
            <Plus className="size-4" />
            {editingId ? "حفظ السوق" : "إضافة سوق"}
          </Button>
        </form>
      </Card>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {markets.map((market) => (
          <Card key={market.id} className="p-5">
            <div className="flex justify-between gap-3">
              <div>
                <h2 className="flex items-center gap-2 font-bold">
                  <Store className="size-4 text-primary" /> {market.name}
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  {market.city_name} • {market.classification_name}
                </p>
                <p className="text-sm text-muted-foreground">{market.branch}</p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => edit(market)}>
                  تعديل
                </Button>
                <Button size="sm" variant="outline" onClick={() => void remove(market.id)}>
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
