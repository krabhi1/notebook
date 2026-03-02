import { useForm } from "@tanstack/react-form";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { ResetPasswordDialog } from "@/components/auth/reset-password-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";

const forgotPasswordSchema = z.object({
	email: z.string().email("Invalid email address"),
});
export const Route = createFileRoute("/(public)/forgot-password")({
	component: RouteComponent,
});

function RouteComponent() {
	const [otpDialogOpen, setOtpDialogOpen] = useState(false);
	const [formError, setFormError] = useState<string | null>(null);

	const form = useForm({
		defaultValues: { email: "" },
		validators: { onChange: forgotPasswordSchema },
		onSubmit: async ({ value }) => {
			setFormError(null);

			const otpResult = await authClient.emailOtp.sendVerificationOtp({
				email: value.email,
				type: "forget-password",
			});

			if (otpResult.error) {
				setFormError(
					otpResult.error.message ??
						"Failed to send reset code. Please try again.",
				);
				return;
			}

			setOtpDialogOpen(true);
		},
	});

	return (
		<div className="flex items-center justify-center min-h-screen p-4 bg-surface">
			<div className="w-full max-w-sm p-8 border border-border bg-panel">
				<div className="mb-6">
					<h1 className="text-2xl font-bold text-center text-text">
						Reset Password
					</h1>
					<p className="mt-2 text-center text-sm text-text-muted">
						Enter your email address and we'll send you a code to reset your
						password.
					</p>
				</div>

				<form
					onSubmit={(e) => {
						e.preventDefault();
						e.stopPropagation();
						form.handleSubmit();
					}}
					className="space-y-4"
				>
					{formError && (
						<p
							className="text-error text-sm bg-panel p-2 border border-border"
							role="alert"
						>
							{formError}
						</p>
					)}

					<div>
						<label
							htmlFor="email"
							className="block text-sm font-medium mb-1 text-text-muted"
						>
							Email
						</label>
						<form.Field name="email">
							{(field) => (
								<>
									<Input
										id="email"
										type="email"
										value={field.state.value}
										onChange={(e) => field.handleChange(e.target.value)}
										placeholder="name@example.com"
										autoFocus
									/>
									{field.state.meta.errors.length > 0 && (
										<p className="text-error text-xs mt-1">
											{field.state.meta.errors
												.map((err) => err?.message ?? err)
												.join(", ")}
										</p>
									)}
								</>
							)}
						</form.Field>
					</div>

					<form.Subscribe
						selector={(state) => [state.canSubmit, state.isSubmitting]}
					>
						{([canSubmit, isSubmitting]) => (
							<Button
								type="submit"
								disabled={!canSubmit || isSubmitting}
								className="w-full"
							>
								{isSubmitting ? "Sending Code..." : "Send Reset Code"}
							</Button>
						)}
					</form.Subscribe>
				</form>

				<div className="mt-6 text-center text-sm text-text-muted">
					<Link
						to="/login"
						className="text-accent font-medium hover:text-accent-hover inline-flex items-center gap-1"
					>
						<svg
							className="w-4 h-4"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<title>Back to login</title>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M10 19l-7-7m0 0l7-7m-7 7h18"
							/>
						</svg>
						Back to Login
					</Link>
				</div>
			</div>

			<ResetPasswordDialog
				open={otpDialogOpen}
				onOpenChange={setOtpDialogOpen}
				email={form.getFieldValue("email")}
			/>
		</div>
	);
}
