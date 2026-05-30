import {
  getActiveTheme,
  getActiveThemeMap,
  themeTargets,
  type ThemeTargetKey,
} from "@/lib/theme-store";

function parseTarget(value: string | null): ThemeTargetKey | null {
  return themeTargets.find((target) => target === value) ?? null;
}

export async function GET(request: Request) {
  const targetParam = new URL(request.url).searchParams.get("target");

  if (!targetParam || targetParam === "all") {
    return Response.json({ activeThemes: await getActiveThemeMap() });
  }

  const target = parseTarget(targetParam);

  if (!target) {
    return Response.json(
      { message: "target must be one of: delivery, market, dashboard, all" },
      { status: 400 },
    );
  }

  return Response.json(await getActiveTheme(target));
}
