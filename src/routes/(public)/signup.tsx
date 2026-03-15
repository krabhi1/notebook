import { useForm } from "@tanstack/react-form";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useId, useState } from "react";
import { z } from "zod";
import { GoogleButton } from "@/components/public/google-button";
import { OtpDialog } from "@/components/public/otp-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";

const signupSchema = z.object({
	name: z.string().min(2, "Name must be at least 2 characters"),
	email: z.string().email("Invalid email address"),
	password: z
		.string()
		.min(8, "Password must be at least 8 characters")
		.regex(/[A-Z]/, "Must contain at least one uppercase letter"),
});

export const Route = createFileRoute("/(public)/signup")({
	head: () => ({
		meta: [
			{
				title: "Sign Up | Vow",
			},
		],
	}),
	component: RouteComponent,
});

function RouteComponent() {
	const nameId = useId();
	const emailId = useId();
	const passwordId = useId();
	const [otpDialogOpen, setOtpDialogOpen] = useState(false);
	const [formError, setFormError] = useState<string | null>(null);
	const navigate = useNavigate();

	const form = useForm({
		defaultValues: { name: "", email: "", password: "" },
		validators: { onChange: signupSchema },
		onSubmit: async ({ value }) => {
			setFormError(null);

			const signUpResult = await authClient.signUp.email({
				email: value.email,
				password: value.password,
				name: value.name,
			});

			if (!signUpResult.error) {
				const otpResult = await authClient.emailOtp.sendVerificationOtp({
					email: value.email,
					type: "email-verification",
				});

				if (otpResult.error) {
					setFormError(
						otpResult.error.message ??
							"Failed to send verification code. Please try again.",
					);
					return;
				}

				setOtpDialogOpen(true);
				return;
			}

			if (signUpResult.error.code === "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL") {
				setFormError("Account already exists. Redirecting to login...");
				setTimeout(() => {
					navigate({
						to: "/login",
						search: { email: value.email },
					});
				}, 2000);
				return;
			}

			setFormError(
				signUpResult.error.message ?? "Unable to sign up. Please try again.",
			);
		},
	});

	return (
		<div className="flex items-center justify-center min-h-screen p-4 bg-background">
			<div className="w-full max-w-sm rounded-2xl border border-border bg-card p-8 shadow-xl shadow-black/5">
				<h1 className="text-2xl font-bold mb-6 text-center text-foreground">
					Create an Account
				</h1>

				<GoogleButton text="Sign up with Google" onError={setFormError} />

				<div className="relative my-6">
					<div className="absolute inset-0 flex items-center">
						<span className="w-full border-t border-border" />
					</div>
					<div className="relative flex justify-center text-xs uppercase">
						<span className="bg-card px-2 text-muted-foreground">
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
							className="text-destructive text-sm bg-muted p-2 border border-border rounded-md"
							role="alert"
						>
							{formError}
						</p>
					)}

					<div>
						<label
							htmlFor={nameId}
							className="block text-sm font-medium mb-1 text-muted-foreground"
						>
							Name
						</label>
						<form.Field name="name">
							{(field) => (
								<>
									<Input
										id={nameId}
										type="text"
										value={field.state.value}
										onChange={(e) => field.handleChange(e.target.value)}
										placeholder="John Doe"
										className="bg-input text-foreground"
									/>
									{field.state.meta.errors.length > 0 && (
										<p className="text-destructive text-xs mt-1">
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
						<label
							htmlFor={emailId}
							className="block text-sm font-medium mb-1 text-muted-foreground"
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
										className="bg-input text-foreground"
									/>
									{field.state.meta.errors.length > 0 && (
										<p className="text-destructive text-xs mt-1">
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
						<label
							htmlFor={passwordId}
							className="block text-sm font-medium mb-1 text-muted-foreground"
						>
							Password
						</label>
						<form.Field name="password">
							{(field) => (
								<>
									<Input
										id={passwordId}
										type="password"
										value={field.state.value}
										onChange={(e) => field.handleChange(e.target.value)}
										placeholder="••••••••"
										className="bg-input text-foreground"
									/>
									{field.state.meta.errors.length > 0 && (
										<p className="text-destructive text-xs mt-1">
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
								className="w-full bg-primary text-primary-foreground"
							>
								{isSubmitting ? "Creating Account..." : "Sign Up"}
							</Button>
						)}
					</form.Subscribe>
				</form>

				<p className="mt-6 text-center text-sm text-muted-foreground">
					Already have an account?{" "}
					<Link to="/login">
						<Button variant="link" size="sm">
							Log in
						</Button>
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
