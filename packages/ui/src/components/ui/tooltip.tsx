import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { cn } from "@repo/ui/lib/utils"

const Tooltip = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content> & {
    content: string;
  }
>(({ children, content, className, ...props }, ref) => (
  <TooltipPrimitive.Provider>
    <TooltipPrimitive.Root>
      <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
      <TooltipPrimitive.Content
        ref={ref}
        className={cn(
          "z-50 rounded-md bg-gray-900 px-3 py-2 text-xs text-white shadow-md overflow-hidden animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
          className
        )}
        sideOffset={4}
        {...props}
      >
        {content}
        <TooltipPrimitive.Arrow className="fill-gray-900" />
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Root>
  </TooltipPrimitive.Provider>
));

Tooltip.displayName = "Tooltip";

export { Tooltip };
