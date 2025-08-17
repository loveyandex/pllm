import * as React from "react";
import { clsx } from "clsx";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, ...props }, ref) => {
	return (
		<textarea
			ref={ref}
			className={clsx(
				"flex w-full rounded-md border border-[var(--border)] bg-[var(--muted)] px-3 py-2 text-base placeholder:text-[var(--muted-foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]",
				className
			)}
			{...props}
		/>
	);
});
Textarea.displayName = "Textarea";