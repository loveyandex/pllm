import * as React from "react";
import { clsx } from "clsx";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, ...props }, ref) => {
	return (
		<input
			ref={ref}
			className={clsx(
				"flex h-10 w-full rounded-md border border-[var(--border)] bg-[var(--muted)] px-3 py-2 text-base placeholder:text-[var(--muted-foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]",
				className
			)}
			{...props}
		/>
	);
});
Input.displayName = "Input";