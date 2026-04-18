"use client";

import * as React from "react";

function ResizablePanelGroup({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div className={className} {...props}>
      {children}
    </div>
  );
}

function ResizablePanel({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div className={className} {...props}>
      {children}
    </div>
  );
}

function ResizableHandle({
  className,
  ...props
}: React.ComponentProps<"div"> & {
  withHandle?: boolean;
}) {
  return <div className={className} {...props} />;
}

export { ResizablePanelGroup, ResizablePanel, ResizableHandle };
