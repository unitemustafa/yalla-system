"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";
import { ImageIcon } from "lucide-react";

import { cn } from "@/lib/utils";

type DashboardImageProps = Omit<ImageProps, "className" | "onError" | "onLoad"> & {
  className?: string;
  imageClassName?: string;
};

export function DashboardImage({
  alt,
  src,
  width,
  height,
  sizes,
  className,
  imageClassName,
  unoptimized,
  ...props
}: DashboardImageProps) {
  const sourceKey = typeof src === "string" ? src : "static";
  const [imageState, setImageState] = useState({
    failed: false,
    loaded: false,
    sourceKey,
  });
  const loaded = imageState.sourceKey === sourceKey && imageState.loaded;
  const failed = imageState.sourceKey === sourceKey && imageState.failed;
  const canRender = Boolean(src) && !failed;

  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden bg-muted/40 text-muted-foreground",
        className,
      )}
    >
      {canRender && !loaded ? (
        <span className="absolute inset-0 animate-pulse bg-muted" />
      ) : null}
      {canRender ? (
        <Image
          {...props}
          alt={alt}
          height={height}
          onError={() =>
            setImageState({ failed: true, loaded: false, sourceKey })
          }
          onLoad={() =>
            setImageState({ failed: false, loaded: true, sourceKey })
          }
          sizes={sizes}
          src={src}
          unoptimized={unoptimized ?? (typeof src === "string" && src.startsWith("data:"))}
          width={width}
          className={cn(
            "relative z-10 size-full object-cover transition-opacity duration-150",
            loaded ? "opacity-100" : "opacity-0",
            imageClassName,
          )}
        />
      ) : (
        <ImageIcon aria-hidden="true" className="size-1/2 max-h-5 max-w-5 opacity-60" />
      )}
    </span>
  );
}
