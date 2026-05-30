"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";

import { breadcrumbsFromPathname, pageFromPathname } from "./data";

export function useDisclosure(initialOpen = false) {
  const [isOpen, setIsOpen] = useState(initialOpen);

  return {
    isOpen,
    open: useCallback(() => setIsOpen(true), []),
    close: useCallback(() => setIsOpen(false), []),
    toggle: useCallback(() => setIsOpen((value) => !value), []),
  };
}

export function useDashboardFrame() {
  const pathname = usePathname();
  const activePage = useMemo(() => pageFromPathname(pathname), [pathname]);
  const sidebar = useDisclosure(false);
  const [collapsed, setCollapsed] = useState(false);

  return {
    activePage,
    breadcrumbs: breadcrumbsFromPathname(pathname, activePage),
    collapsed,
    mobileNavOpen: sidebar.isOpen,
    closeMobileNav: sidebar.close,
    openMobileNav: sidebar.open,
    toggleCollapsed: useCallback(() => setCollapsed((value) => !value), []),
  };
}

export function useSidebarGroups() {
  const [openGroup, setOpenGroup] = useState<string | null>(null);

  const toggleGroup = useCallback((label: string) => {
    setOpenGroup((currentOpenGroup) =>
      currentOpenGroup === label ? null : label,
    );
  }, []);

  const isGroupOpen = useCallback(
    (label: string) => openGroup === label,
    [openGroup],
  );

  return { isGroupOpen, toggleGroup };
}

export function useItemTableState() {
  const [openRow, setOpenRow] = useState<string | null>(null);
  const deleteDialog = useDisclosure(false);

  return {
    openRow,
    deleteOpen: deleteDialog.isOpen,
    closeDelete: deleteDialog.close,
    openDelete: deleteDialog.open,
    toggleRow: useCallback((rowId: string) => {
      setOpenRow((currentRow) => (currentRow === rowId ? null : rowId));
    }, []),
  };
}

export function useMountedOnFrame() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  return mounted;
}
