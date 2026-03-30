"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

interface SheetProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

interface SheetContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const Sheet = ({ open, onOpenChange, children }: SheetProps) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => onOpenChange?.(false)}
        aria-hidden
      />
      <div onClick={(e) => e.stopPropagation()}>{children}</div>
    </div>
  );
};

const SheetContent = React.forwardRef<HTMLDivElement, SheetContentProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "fixed right-0 top-0 z-50 h-full w-full max-w-sm border-l bg-background/95 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-background/80",
        "transition-transform duration-300 ease-out",
        "flex flex-col",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
);
SheetContent.displayName = "SheetContent";

const SheetHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-1.5 border-b px-6 py-4",
      className
    )}
    {...props}
  />
);

const SheetTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h2
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
));
SheetTitle.displayName = "SheetTitle";

const SheetClose = ({
  onClose,
}: {
  onClose: () => void;
}) => (
  <Button
    variant="ghost"
    size="icon"
    className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
    onClick={onClose}
  >
    <X className="h-4 w-4" />
    <span className="sr-only">Kapat</span>
  </Button>
);

export { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose };
