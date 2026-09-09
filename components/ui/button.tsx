import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-none border border-transparent bg-clip-padding text-xs font-semibold tracking-[0.12em] uppercase whitespace-nowrap transition-[color,background-color,border-color,transform] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] active:scale-[0.97] motion-reduce:active:scale-100 outline-none select-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:pointer-events-none disabled:bg-surface-dim disabled:text-on-surface-variant aria-invalid:border-error aria-invalid:ring-2 aria-invalid:ring-error/20 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 cursor-pointer",
  {
    variants: {
      variant: {
        default: "bg-primary text-on-primary hover:bg-primary-hover active:bg-black",
        outline:
          "border-outline bg-transparent text-on-surface hover:border-on-surface hover:bg-surface-container",
        secondary:
          "bg-surface-container text-on-surface hover:bg-surface-container-high border-outline-variant",
        ghost:
          "hover:bg-surface-container hover:text-on-surface text-on-surface-variant",
        destructive:
          "bg-error text-white hover:bg-error/90 focus-visible:ring-error",
        link: "text-on-surface underline-offset-4 hover:underline normal-case tracking-normal font-normal",
      },
      size: {
        default: "h-11 px-7 py-3.5",
        xs: "h-7 px-3 text-[10px]",
        sm: "h-9 px-4 text-xs",
        lg: "h-12 px-8 text-sm tracking-[0.14em]",
        icon: "size-10",
        "icon-xs": "size-7",
        "icon-sm": "size-8",
        "icon-lg": "size-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
