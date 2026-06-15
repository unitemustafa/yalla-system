"use client";

import { useEffect, useState } from "react";
import { Bell, CheckCheck, Circle, Inbox, Trash2 } from "lucide-react";

import { useDashboardI18n } from "@/features/dashboard/i18n";
import { notifications as initialNotifications } from "@/features/dashboard/profile-data";
import {
  Badge,
  Button,
  Card,
  PageTitle,
  Pagination,
} from "@/features/dashboard/primitives";
import { useSnackbar } from "@/features/dashboard/snackbar";
import { cn } from "@/lib/utils";

const notificationsStorageKey = "yalla-notifications-state";
const notificationsPageSize = 10;

type DashboardNotification = (typeof initialNotifications)[number];
type NotificationFilter = "all" | "unread" | "read";

type PersistedNotificationsState = {
  deletedIds?: string[];
  readIds?: string[];
};

function readStoredNotifications(): DashboardNotification[] {
  if (typeof window === "undefined") {
    return initialNotifications;
  }

  try {
    const stored = JSON.parse(
      localStorage.getItem(notificationsStorageKey) ?? "{}",
    ) as PersistedNotificationsState;
    const deletedIds = new Set(stored.deletedIds ?? []);
    const readIds = new Set(stored.readIds ?? []);

    return initialNotifications
      .filter((notification) => !deletedIds.has(notification.id))
      .map((notification) => ({
        ...notification,
        read: notification.read || readIds.has(notification.id),
      }));
  } catch {
    return initialNotifications;
  }
}

function notificationCopyKey(id: string) {
  if (id.includes("order")) return "order";
  if (id.includes("stock")) return "stock";
  if (id.includes("courier")) return "courier";
  if (id.includes("branch")) return "branch";
  if (id.includes("security")) return "security";
  if (id.includes("summary")) return "summary";
  return "shift";
}

function notificationTimeKey(id: string) {
  if (id.includes("order")) return "fiveMinutes";
  if (id.includes("stock")) return "twentyFourMinutes";
  if (id.includes("courier")) return "oneHour";
  if (id.includes("branch")) return "yesterdayNine";
  if (id.includes("security")) return "yesterdayThree";
  if (id.includes("summary")) return "mondaySix";
  return "mondayFourThirty";
}

function notificationCategoryKey(category: string) {
  return category.toLowerCase();
}

export function NotificationsPage() {
  const { t } = useDashboardI18n();
  const { showSnackbar } = useSnackbar();
  const [notifications, setNotifications] = useState(readStoredNotifications);
  const [activeFilter, setActiveFilter] = useState<NotificationFilter>("all");
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const unreadCount = notifications.filter((notification) => !notification.read).length;
  const hasNotifications = notifications.length > 0;
  const displayedNotifications = notifications.filter((notification) => {
    if (activeFilter === "unread") return !notification.read;
    if (activeFilter === "read") return notification.read;
    return true;
  });
  const hasDisplayedNotifications = displayedNotifications.length > 0;
  const totalPages = Math.max(
    1,
    Math.ceil(displayedNotifications.length / notificationsPageSize),
  );
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const pageStartIndex = (safeCurrentPage - 1) * notificationsPageSize;
  const pagedNotifications = displayedNotifications.slice(
    pageStartIndex,
    pageStartIndex + notificationsPageSize,
  );
  const filters = [
    {
      id: "all" as const,
      label: t("notifications.filter.all"),
      count: notifications.length,
    },
    {
      id: "unread" as const,
      label: t("notifications.filter.unread"),
      count: unreadCount,
    },
    {
      id: "read" as const,
      label: t("notifications.filter.read"),
      count: notifications.filter((notification) => notification.read).length,
    },
  ];

  useEffect(() => {
    const visibleIds = new Set(
      notifications.map((notification) => notification.id),
    );
    const readIds = notifications
      .filter((notification) => notification.read)
      .map((notification) => notification.id);
    const deletedIds = initialNotifications
      .filter((notification) => !visibleIds.has(notification.id))
      .map((notification) => notification.id);

    localStorage.setItem(
      notificationsStorageKey,
      JSON.stringify({ deletedIds, readIds }),
    );
  }, [notifications]);

  function markAllAsRead() {
    setNotifications((currentNotifications) =>
      currentNotifications.map((notification) => ({
        ...notification,
        read: true,
      })),
    );
    setDeleteConfirmOpen(false);
    showSnackbar({ message: "تم تعليم كل الإشعارات كمقروءة." });
  }

  function deleteAllNotifications() {
    setNotifications([]);
    setDeleteConfirmOpen(false);
    showSnackbar({
      message: "تم حذف كل الإشعارات.",
      tone: "danger",
    });
  }


  function deleteNotification(notificationId: string) {
    setNotifications((currentNotifications) =>
      currentNotifications.filter(
        (notification) => notification.id !== notificationId,
      ),
    );
    showSnackbar({
      message: "تم حذف الإشعار.",
      tone: "danger",
    });
  }
  return (
    <div className="px-6 py-6">
      <PageTitle
        title={t("page.notifications")}
        description={t("notifications.description")}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button
              disabled={!hasNotifications || unreadCount === 0}
              onClick={markAllAsRead}
              type="button"
              variant="outline"
            >
              <CheckCheck className="size-4" />
              تعليم الكل كمقروء
            </Button>
            <Button
              disabled={!hasNotifications}
              onClick={() => setDeleteConfirmOpen(true)}
              type="button"
              variant="danger"
            >
              <Trash2 className="size-4" />
              حذف كل الإشعارات
            </Button>
          </div>
        }
      />

      <Card className="mt-6 overflow-hidden">
        <div className="flex flex-col justify-between gap-4 border-b px-5 py-4 md:flex-row md:items-center">
          <div className="flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-md bg-primary/10 text-primary">
              <Bell className="size-4" />
            </span>
            <div className="text-start">
              <div className="text-sm font-semibold">
                {t("notifications.center.title")}
              </div>
              <div className="text-xs text-muted-foreground">
                {t("notifications.center.description")}
              </div>
            </div>
          </div>
          <div className="flex w-full gap-2 md:w-auto">
            {filters.map((filter) => (
              <button
                key={filter.label}
                type="button"
                aria-pressed={activeFilter === filter.id}
                onClick={() => {
                  setActiveFilter(filter.id);
                  setCurrentPage(1);
                }}
                className={cn(
                  "inline-flex h-8 flex-1 items-center justify-center gap-2 rounded-md border px-3 text-xs font-medium transition-colors md:flex-none",
                  activeFilter === filter.id
                    ? "border-primary/30 bg-primary/10 text-primary"
                    : "bg-background text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                )}
              >
                {filter.label}
                <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                  {filter.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {deleteConfirmOpen ? (
          <div className="border-b border-destructive/30 bg-destructive/10 px-5 py-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="text-sm">
                <div className="font-semibold text-destructive">
                  تأكيد حذف كل الإشعارات؟
                </div>
                <div className="mt-1 text-muted-foreground">
                  سيتم مسح كل الإشعارات المعروضة من الصفحة.
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={deleteAllNotifications}
                  type="button"
                  variant="danger"
                >
                  تأكيد الحذف
                </Button>
                <Button
                  onClick={() => setDeleteConfirmOpen(false)}
                  type="button"
                  variant="outline"
                >
                  إلغاء
                </Button>
              </div>
            </div>
          </div>
        ) : null}

        {hasDisplayedNotifications ? (
          <>
            <div className="divide-y">
              {pagedNotifications.map((notification) => {
                const Icon = notification.icon;
                const copyKey = notificationCopyKey(notification.id);
                const timeKey = notificationTimeKey(notification.id);
                const categoryKey = notificationCategoryKey(notification.category);

                return (
                  <article
                    key={notification.id}
                    className={cn(
                      "flex gap-4 px-5 py-4 transition-colors hover:bg-muted/35",
                      !notification.read && "bg-primary/5",
                    )}
                  >
                    <span
                      className={cn(
                        "mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-lg border",
                        notification.read
                          ? "bg-background text-muted-foreground"
                          : "border-primary/25 bg-primary/10 text-primary",
                      )}
                    >
                      <Icon className="size-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0 text-start">
                          <div className="flex items-center gap-2">
                            {!notification.read ? (
                              <Circle className="size-2.5 fill-primary text-primary" />
                            ) : null}
                            <h2 className="truncate text-sm font-semibold">
                              {t(`notifications.${copyKey}.title`)}
                            </h2>
                          </div>
                          <p className="mt-1 text-sm leading-5 text-muted-foreground">
                            {t(`notifications.${copyKey}.message`)}
                          </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-2 text-xs text-muted-foreground">
                          <span>{t(`notifications.time.${timeKey}`)}</span>
                          {notification.read ? (
                            <CheckCheck className="size-3.5 text-emerald-500" />
                          ) : null}
                          <button
                            aria-label="حذف الإشعار"
                            className="inline-flex size-8 items-center justify-center rounded-md border border-border bg-background text-muted-foreground transition hover:border-destructive/40 hover:bg-destructive/10 hover:text-destructive"
                            onClick={() => deleteNotification(notification.id)}
                            type="button"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      </div>
                      <div className="mt-3 flex items-center justify-between gap-3">
                        <Badge tone={notification.read ? "secondary" : "blue"}>
                          {t(`notifications.category.${categoryKey}`)}
                        </Badge>
                        <span
                          className={cn(
                            "text-xs font-medium",
                            notification.read
                              ? "text-muted-foreground"
                              : "text-primary",
                          )}
                        >
                          {notification.read
                            ? t("notifications.state.read")
                            : t("notifications.state.unread")}
                        </span>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
            <div className="px-5">
              <Pagination
                text={`عرض ${pagedNotifications.length} من ${displayedNotifications.length} نتيجة`}
                pages={`${safeCurrentPage} / ${totalPages}`}
                previousDisabled={safeCurrentPage === 1}
                nextDisabled={safeCurrentPage === totalPages}
                onPrevious={() =>
                  setCurrentPage((page) =>
                    Math.max(1, Math.min(page, totalPages) - 1),
                  )
                }
                onNext={() =>
                  setCurrentPage((page) =>
                    Math.min(totalPages, Math.min(page, totalPages) + 1),
                  )
                }
              />
            </div>
          </>
        ) : (
          <div className="flex min-h-[320px] flex-col items-center justify-center px-6 py-12 text-center">
            <span className="flex size-12 items-center justify-center rounded-lg bg-muted text-muted-foreground">
              <Inbox className="size-5" />
            </span>
            <div className="mt-4 text-base font-semibold">
              {t("notifications.empty.title")}
            </div>
            <p className="mt-1 max-w-sm text-sm leading-5 text-muted-foreground">
              {t("notifications.empty.description")}
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}
