"use client";

import { useEffect, useMemo, useRef } from "react";

import { autoTextAr } from "./locales/auto-ar";

const textNodeOriginals = new WeakMap<Text, string>();
const attributeOriginals = new WeakMap<Element, Map<string, string>>();
const translatableAttributes = ["placeholder", "aria-label", "title", "alt"];

function preserveSpacing(source: string, translated: string) {
  const leading = source.match(/^\s*/)?.[0] ?? "";
  const trailing = source.match(/\s*$/)?.[0] ?? "";

  return `${leading}${translated}${trailing}`;
}

function getOriginalAttribute(element: Element, attribute: string, value: string) {
  let originals = attributeOriginals.get(element);

  if (!originals) {
    originals = new Map();
    attributeOriginals.set(element, originals);
  }

  const existing = originals.get(attribute);

  if (existing) {
    return existing;
  }

  originals.set(attribute, value);
  return value;
}

export function DashboardAutoTranslate({
  children,
}: {
  children: React.ReactNode;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const sourceByRenderedText = useMemo(() => {
    const sourceMap = new Map<string, string>();

    Object.keys(autoTextAr).forEach((source) => {
      sourceMap.set(source, source);
      sourceMap.set(autoTextAr[source] ?? source, source);
    });

    return sourceMap;
  }, []);

  useEffect(() => {
    const root = rootRef.current;

    if (!root) {
      return;
    }

    const translateText = (value: string) => {
      const trimmed = value.trim();

      if (!trimmed) {
        return null;
      }

      const source = sourceByRenderedText.get(trimmed);
      const translated = source ? autoTextAr[source] : undefined;

      return translated ? preserveSpacing(value, translated) : null;
    };

    const translateElementAttributes = (element: Element) => {
      translatableAttributes.forEach((attribute) => {
        const value = element.getAttribute(attribute);

        if (!value) {
          return;
        }

        const existingOriginals = attributeOriginals.get(element);
        const original = existingOriginals?.get(attribute) ?? value;
        const translated = translateText(original);

        if (translated && translated !== value) {
          getOriginalAttribute(element, attribute, value);
          element.setAttribute(attribute, translated);
        }
      });
    };

    const translateTree = () => {
      const walker = document.createTreeWalker(
        root,
        NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT,
        {
          acceptNode(node) {
            if (
              node.parentElement?.closest(
                "script, style, textarea, code, pre, [data-no-auto-translate]",
              )
            ) {
              return NodeFilter.FILTER_REJECT;
            }

            return NodeFilter.FILTER_ACCEPT;
          },
        },
      );

      let current = walker.nextNode();

      while (current) {
        if (current.nodeType === Node.TEXT_NODE) {
          const textNode = current as Text;
          const original = textNodeOriginals.get(textNode) ?? textNode.data;
          const translated = translateText(original);

          if (translated && translated !== textNode.data) {
            textNodeOriginals.set(textNode, original);
            textNode.data = translated;
          }
        } else if (current.nodeType === Node.ELEMENT_NODE) {
          translateElementAttributes(current as Element);
        }

        current = walker.nextNode();
      }
    };

    translateTree();

    const observer = new MutationObserver(() => translateTree());
    observer.observe(root, {
      attributes: true,
      childList: true,
      subtree: true,
    });

    return () => observer.disconnect();
  }, [sourceByRenderedText]);

  return <div ref={rootRef}>{children}</div>;
}
