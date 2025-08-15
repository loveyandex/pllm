import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { clsx } from "clsx";

const buttonVariants = cva(
	"inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50",
	{
		variants: {
			variant: {
				default: "bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90",
				secondary: "bg-[var(--muted)] text-[var(--foreground)] hover:bg-[var(--muted)]/80",
				ghost: "hover:bg-[var(--muted)]/60"
			},
			size: {
				sm: "h-8 px-3 text-sm",
				md: "h-10 px-4",
				lg: "h-11 px-5 text-lg"
			}
		},
		defaultVariants: {
			variant: "default",
			size: "md"
		}
	}
);

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant, size, ...props }, ref) => {
	return (
		<button ref={ref} className={clsx(buttonVariants({ variant, size }), className)} {...props} />
	);
});
Button.displayName = "Button";