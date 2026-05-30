"use client";

import type { CSSProperties, PointerEvent, ReactNode } from "react";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

const defaultDuration = 2200;
const reducedMotionQuery = "(prefers-reduced-motion: reduce)";

function easeOutCubic(progress: number) {
  return Math.sin((progress * Math.PI) / 2);
}

function clampPercentage(value: number) {
  return Math.min(Math.max(value, 0), 100);
}

export function useInViewOnce<TElement extends Element>({
  rootMargin = "0px 0px -10% 0px",
  threshold = 0.2,
}: {
  rootMargin?: string;
  threshold?: number;
} = {}) {
  const ref = useRef<TElement | null>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const element = ref.current;

    if (!element || isInView) {
      return;
    }

    if (!("IntersectionObserver" in window)) {
      const frame = requestAnimationFrame(() => setIsInView(true));

      return () => cancelAnimationFrame(frame);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin, threshold },
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [isInView, rootMargin, threshold]);

  return { ref, isInView };
}

export function usePrefersReducedMotion() {
  return useSyncExternalStore(
    (onStoreChange) => {
      const mediaQuery = window.matchMedia(reducedMotionQuery);

      mediaQuery.addEventListener("change", onStoreChange);

      return () => mediaQuery.removeEventListener("change", onStoreChange);
    },
    () => window.matchMedia(reducedMotionQuery).matches,
    () => false,
  );
}

export function useAnimatedValue(
  target: number,
  {
    duration = defaultDuration,
    delay = 0,
    enabled = true,
  }: {
    duration?: number;
    delay?: number;
    enabled?: boolean;
  } = {},
) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [value, setValue] = useState(0);
  const frameRef = useRef<number | null>(null);
  const delayRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const finalValue = Number.isFinite(target) ? target : 0;

    if (frameRef.current !== null) {
      cancelAnimationFrame(frameRef.current);
    }

    if (delayRef.current !== null) {
      clearTimeout(delayRef.current);
    }

    if (!enabled) {
      frameRef.current = requestAnimationFrame(() => setValue(0));

      return () => {
        if (frameRef.current !== null) {
          cancelAnimationFrame(frameRef.current);
        }
      };
    }

    if (prefersReducedMotion || duration <= 0) {
      frameRef.current = requestAnimationFrame(() => setValue(finalValue));

      return () => {
        if (frameRef.current !== null) {
          cancelAnimationFrame(frameRef.current);
        }
      };
    }

    function startAnimation() {
      setValue(0);

      const start = performance.now();

      function update(now: number) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = easeOutCubic(progress);

        setValue(finalValue * eased);

        if (progress < 1) {
          frameRef.current = requestAnimationFrame(update);
        }
      }

      frameRef.current = requestAnimationFrame(update);
    }

    delayRef.current = setTimeout(startAnimation, delay);

    return () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
      }

      if (delayRef.current !== null) {
        clearTimeout(delayRef.current);
      }
    };
  }, [delay, duration, enabled, prefersReducedMotion, target]);

  return value;
}

export function AnimatedNumber({
  value,
  decimals,
  locale = "en-US",
  prefix = "",
  suffix = "",
  duration = defaultDuration,
  delay = 0,
  enabled = true,
  className,
}: {
  value: number;
  decimals?: number;
  locale?: string;
  prefix?: string;
  suffix?: string;
  duration?: number;
  delay?: number;
  enabled?: boolean;
  className?: string;
}) {
  const animatedValue = useAnimatedValue(value, { duration, delay, enabled });
  const fractionDigits = decimals ?? (Number.isInteger(value) ? 0 : 2);
  const formatter = useMemo(
    () =>
      new Intl.NumberFormat(locale, {
        minimumFractionDigits: fractionDigits,
        maximumFractionDigits: fractionDigits,
      }),
    [fractionDigits, locale],
  );
  const finalText = `${prefix}${formatter.format(value)}${suffix}`;

  return (
    <span aria-label={finalText} aria-live="off" className={className}>
      {prefix}
      {formatter.format(animatedValue)}
      {suffix}
    </span>
  );
}

export function AnimatedProgressBar({
  value,
  className,
  style,
  duration = defaultDuration,
  delay = 0,
}: {
  value: number;
  className?: string;
  style?: CSSProperties;
  duration?: number;
  delay?: number;
}) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [isVisible, setIsVisible] = useState(false);
  const clampedValue = clampPercentage(value);

  useEffect(() => {
    let frame: number | null = null;
    const timer = setTimeout(
      () => {
        frame = requestAnimationFrame(() => setIsVisible(true));
      },
      prefersReducedMotion ? 0 : delay,
    );

    return () => {
      clearTimeout(timer);
      if (frame !== null) {
        cancelAnimationFrame(frame);
      }
    };
  }, [delay, prefersReducedMotion]);

  return (
    <div
      className={className}
      style={{
        ...style,
        width: `${isVisible ? clampedValue : 0}%`,
        transition: prefersReducedMotion
          ? undefined
          : `width ${duration}ms cubic-bezier(0.16, 1, 0.3, 1)`,
      }}
    />
  );
}

export function AnimatedCircularProgress({
  value,
  amount,
  label,
  color = "var(--chart-1)",
  trackColor = "var(--muted)",
  size = 250,
  radius = 80,
  strokeWidth = 12,
  track = true,
  trackRadius = 95,
  trackStrokeWidth = 12,
  className,
  contentClassName,
  amountClassName,
  labelClassName,
  duration = 1800,
  delay = 0,
  completeGapDegrees = 0,
  inView,
  tooltip,
}: {
  value: number;
  amount?: ReactNode;
  label?: ReactNode;
  color?: string;
  trackColor?: string;
  size?: number;
  radius?: number;
  strokeWidth?: number;
  track?: boolean;
  trackRadius?: number;
  trackStrokeWidth?: number;
  className?: string;
  contentClassName?: string;
  amountClassName?: string;
  labelClassName?: string;
  duration?: number;
  delay?: number;
  completeGapDegrees?: number;
  inView?: boolean;
  tooltip?: ReactNode;
}) {
  const { ref, isInView } = useInViewOnce<HTMLDivElement>();
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const frameRef = useRef<number | null>(null);
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedValue = clampPercentage(value);
  const isComplete = clampedValue >= 99.9;
  const completeGapValue = (completeGapDegrees / 360) * 100;
  const visibleValue =
    isComplete && completeGapDegrees > 0
      ? Math.max(0, 100 - completeGapValue)
      : clampedValue;
  const targetValue = isComplete ? visibleValue : clampedValue;
  const shouldAnimate = inView ?? isInView;
  const animatedValue = useAnimatedValue(targetValue, {
    duration,
    delay,
    enabled: shouldAnimate,
  });
  const strokeDashoffset = circumference * (1 - animatedValue / 100);
  const hasContent = amount !== undefined || label !== undefined;

  function moveTooltip(event: PointerEvent<HTMLDivElement>) {
    if (!tooltipRef.current) {
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    if (frameRef.current !== null) {
      cancelAnimationFrame(frameRef.current);
    }

    frameRef.current = requestAnimationFrame(() => {
      if (!tooltipRef.current) {
        return;
      }

      tooltipRef.current.style.left = `${x}px`;
      tooltipRef.current.style.top = `${y}px`;
    });
  }

  function hideTooltip() {
    setTooltipVisible(false);

    if (frameRef.current !== null) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }
  }

  return (
    <div
      ref={ref}
      className={className ? `relative ${className}` : "relative"}
      dir="rtl"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={clampedValue}
      aria-label={typeof label === "string" ? label : undefined}
      style={{ width: size, height: size }}
      onPointerEnter={(event) => {
        if (tooltip) {
          setTooltipVisible(true);
          moveTooltip(event);
        }
      }}
      onPointerMove={tooltip ? moveTooltip : undefined}
      onPointerLeave={tooltip ? hideTooltip : undefined}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="block h-full w-full"
      >
        {track ? (
          <circle
            cx={center}
            cy={center}
            r={trackRadius}
            fill="none"
            stroke={trackColor}
            strokeWidth={trackStrokeWidth}
          />
        ) : null}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          transform={`rotate(-90 ${center} ${center})`}
        />
      </svg>
      {hasContent ? (
        <div
          className={
            contentClassName ??
            "pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center"
          }
        >
          {amount !== undefined ? (
            <div
              className={
                amountClassName ?? "text-lg font-bold leading-none text-foreground"
              }
            >
              {amount}
            </div>
          ) : null}
          {label !== undefined ? (
            <div
              className={
                labelClassName ?? "mt-1 text-xs leading-none text-muted-foreground"
              }
            >
              {label}
            </div>
          ) : null}
        </div>
      ) : null}
      {tooltip ? (
        <div
          ref={tooltipRef}
          role="tooltip"
          className="pointer-events-none absolute z-30 min-w-[9rem] -translate-x-1/2 -translate-y-[calc(100%+12px)] rounded-lg border border-border/50 bg-background px-3 py-2 text-center text-xs text-foreground opacity-0 shadow-xl transition-opacity duration-100"
          style={{ opacity: tooltipVisible ? 1 : 0 }}
        >
          {tooltip}
        </div>
      ) : null}
    </div>
  );
}

export function AnimatedChartWrapper({
  children,
  className,
}: {
  children: ({ isAnimationActive }: { isAnimationActive: boolean }) => ReactNode;
  className?: string;
  duration?: number;
  delay?: number;
}) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setMounted(true));

    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div className={className}>
      {mounted ? children({ isAnimationActive: !prefersReducedMotion }) : null}
    </div>
  );
}
