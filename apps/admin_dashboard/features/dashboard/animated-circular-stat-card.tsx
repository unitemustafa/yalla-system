"use client";

import type { ReactNode } from "react";

import {
  AnimatedCircularProgress,
  AnimatedNumber,
  useInViewOnce,
} from "./animations";
import { Card, CardHeader } from "./primitives";
import { cn } from "@/lib/utils";

function getPercentage({
  percentage,
  value,
  maxValue,
}: {
  percentage?: number;
  value: number;
  maxValue?: number;
}) {
  if (typeof percentage === "number" && Number.isFinite(percentage)) {
    return percentage;
  }

  if (typeof maxValue === "number" && Number.isFinite(maxValue) && maxValue > 0) {
    return (value / maxValue) * 100;
  }

  return value;
}

export function AnimatedCircularStatCard({
  value,
  maxValue,
  percentage,
  label,
  subLabel,
  color,
  duration = 1800,
  title,
  subtitle,
  footer,
  locale = "en-US",
  prefix = "",
  suffix = "",
  decimals,
  delay = 0,
  height = "h-[388px]",
  radius = 80,
  strokeWidth = 12,
  trackRadius = 95,
  trackStrokeWidth = 12,
  className,
  bodyClassName,
  footerClassName,
}: {
  value: number;
  maxValue?: number;
  percentage?: number;
  label: ReactNode;
  subLabel?: ReactNode;
  color: string;
  duration?: number;
  title?: string;
  subtitle?: string;
  footer?: ReactNode;
  locale?: string;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  delay?: number;
  height?: string;
  radius?: number;
  strokeWidth?: number;
  trackRadius?: number;
  trackStrokeWidth?: number;
  className?: string;
  bodyClassName?: string;
  footerClassName?: string;
}) {
  const { ref, isInView } = useInViewOnce<HTMLDivElement>();
  const progressValue = getPercentage({ percentage, value, maxValue });

  return (
    <div ref={ref} className={height}>
      <Card className={cn("flex h-full flex-col shadow", className)}>
        {title ? <CardHeader title={title} description={subtitle ?? ""} /> : null}
        <div className={cn("flex-1 p-6 py-4 pb-0", bodyClassName)}>
          <div className="relative mx-auto aspect-square size-[250px] max-h-[250px]">
            <AnimatedCircularProgress
              value={progressValue}
              color={color}
              amount={
                <AnimatedNumber
                  value={value}
                  decimals={decimals}
                  locale={locale}
                  prefix={prefix}
                  suffix={suffix}
                  duration={duration}
                  delay={delay}
                  enabled={isInView}
                />
              }
              label={subLabel ?? label}
              className="block size-[250px]"
              duration={duration}
              delay={delay}
              inView={isInView}
              radius={radius}
              strokeWidth={strokeWidth}
              track
              trackRadius={trackRadius}
              trackStrokeWidth={trackStrokeWidth}
            />
          </div>
        </div>
        {footer ? (
          <div
            className={cn(
              "flex flex-col items-center justify-center gap-1 p-6 pt-0 text-center text-sm",
              footerClassName,
            )}
          >
            {footer}
          </div>
        ) : null}
      </Card>
    </div>
  );
}
