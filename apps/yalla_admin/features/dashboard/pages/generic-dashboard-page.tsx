import { pageTitles } from "../data";
import type { PageKey } from "../types";
import { GenericTablePage } from "./secondary";

const pageDescriptions: Partial<Record<PageKey, string>> = {};

export function GenericDashboardPage({ page }: { page: PageKey }) {
  const title = pageTitles[page];

  return (
    <GenericTablePage
      title={title}
      description={pageDescriptions[page] ?? `إدارة سجلات ${title}`}
    />
  );
}
