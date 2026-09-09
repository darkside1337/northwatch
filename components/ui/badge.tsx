import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

const badgeVariants = cva(
  "group/badge inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-none border px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest whitespace-nowrap transition-colors select-none focus-visible:ring-2 focus-visible:ring-accent [&>svg]:pointer-events-none [&>svg]:size-3!",
  {
    variants: {
      variant: {
        default:
          "bg-surface-container text-on-surface border-outline",
        secondary:
          "bg-surface-container-low text-on-surface-variant border-outline-variant",
        outline:
          "bg-transparent text-on-surface border-outline",
        olive:
          "bg-surface-container-low text-accent border-accent",
        destructive:
          "bg-error/10 text-error border-error/30",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  render,
  ...props
}: useRender.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      {
        className: cn(badgeVariants({ variant }), className),
      },
      props
    ),
    render,
    state: {
      slot: "badge",
      variant,
    },
  })
}

export { Badge, badgeVariants }
