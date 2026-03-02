import { useForm } from "@tanstack/react-form";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useId, useState } from "react";
import { z } from "zod";
import { GoogleButton } from "@/components/auth/google-button";
import { OtpDialog } from "@/components/auth/otp-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";

const loginSchema = z.object({
	email: z.string().email("Invalid email address"),
	password: z.string().min(1, "Password is required"),
});

export const Route = createFileRoute("/(public)/login")({
	head: () => ({
		meta: [
			{
				title: "Login | Vow",
			},
		],
	}),
	beforeLoad: () => {
		// if (context.session) {
		// 	throw redirect({ to: "/" });
		// }
	},
	component: LoginComponent,
});

function LoginComponent() {
	const emailId = useId();
	const passwordId = useId();
	const [otpDialogOpen, setOtpDialogOpen] = useState(false);
	const [formError, setFormError] = useState<string | null>(null);
	const navigate = useNavigate();

	const form = useForm({
		defaultValues: { email: "", password: "" },
		validators: { onChange: loginSchema },
		onSubmit: async ({ value }) => {
			setFormError(null);

			const { error } = await authClient.signIn.email({
				email: value.email,
				password: value.password,
			});

			if (error) {
				// Handle unverified email by triggering OTP flow
				if (error.code === "EMAIL_NOT_VERIFIED") {
					const otpResult = await authClient.emailOtp.sendVerificationOtp({
						email: value.email,
						type: "email-verification",
					});

					if (otpResult.error) {
						setFormError(
							otpResult.error.message ?? "Failed to send verification code.",
						);
						return;
					}

					setOtpDialogOpen(true);
					return;
				}

				setFormError(error.message ?? "Invalid email or password.");
				return;
			}

			navigate({ to: "/" });
		},
	});

	return (
		<div className="flex items-center justify-center min-h-screen p-4 bg-surface">
			<div className="w-full max-w-sm p-8 border border-border bg-panel">
				<h1 className="text-2xl font-bold mb-6 text-center text-text">
					Welcome Back
				</h1>

				<GoogleButton text="Login with Google" onError={setFormError} />

				<div className="relative my-6">
					<div className="absolute inset-0 flex items-center">
						<span className="w-full border-t border-border" />
					</div>
					<div className="relative flex justify-center text-xs uppercase">
						<span className="bg-panel px-2 text-text-muted">
							Or continue with email
						</span>
					</div>
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
							htmlFor={emailId}
							className="block text-sm font-medium mb-1 text-text-muted"
						>
							Email
						</label>
						<form.Field name="email">
							{(field) => (
								<>
									<Input
										id={emailId}
										type="email"
										value={field.state.value}
										onChange={(e) => field.handleChange(e.target.value)}
										placeholder="name@example.com"
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

					<div>
						<div className="flex items-center justify-between mb-1">
							<label
								htmlFor={passwordId}
								className="block text-sm font-medium text-text-muted"
							>
								Password
							</label>
							<Link
								to="/forgot-password"
								search={{ email: form.getFieldValue("email") }}
								className="text-xs font-medium text-accent hover:text-accent-hover focus:outline-none"
							>
								Forgot password?
							</Link>
						</div>
						<form.Field name="password">
							{(field) => (
								<>
									<Input
										id={passwordId}
										type="password"
										value={field.state.value}
										onChange={(e) => field.handleChange(e.target.value)}
										placeholder="••••••••"
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
								{isSubmitting ? "Logging in..." : "Login"}
							</Button>
						)}
					</form.Subscribe>
				</form>

				<p className="mt-6 text-center text-sm text-text-muted">
					Don't have an account?{" "}
					<Link
						to="/signup"
						className="text-accent font-medium hover:text-accent-hover"
					>
						Sign up
					</Link>
				</p>
			</div>

			<OtpDialog
				open={otpDialogOpen}
				onOpenChange={setOtpDialogOpen}
				email={form.getFieldValue("email")}
			/>
		</div>
	);
}
