import { useNavigate } from "@tanstack/react-router";
import { useId, useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";

interface ResetPasswordDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	email: string;
}

export function ResetPasswordDialog({
	open,
	onOpenChange,
	email,
}: ResetPasswordDialogProps) {
	const otpId = useId();
	const passwordId = useId();
	const confirmId = useId();
	const [otp, setOtp] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const navigate = useNavigate();

	const handleReset = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);

		if (password !== confirmPassword) {
			setError("Passwords do not match.");
			return;
		}

		if (password.length < 8) {
			setError("Password must be at least 8 characters long.");
			return;
		}

		setIsSubmitting(true);

		try {
			const { error } = await authClient.emailOtp.resetPassword({
				email,
				otp,
				password,
			});

			if (error) {
				setError(
					error.message ?? "Failed to reset password. Please try again.",
				);
				return;
			}

			onOpenChange(false);
			// After resetting, we usually want them to log in with the new password
			// to ensure everything is synced, or we can just go home if better-auth
			// logs them in automatically (check behavior).
			navigate({ to: "/login" });
		} catch (_err) {
			setError("An unexpected error occurred. Please try again.");
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="bg-surface p-6 w-full max-w-sm shadow-xl z-50 border border-border">
				<DialogHeader>
					<DialogTitle className="text-xl font-bold mb-2 text-text">
						Set New Password
					</DialogTitle>
					<DialogDescription className="text-sm text-text-muted mb-6">
						Enter the 6-digit code sent to{" "}
						<strong className="text-text">{email}</strong> and choose a new
						password.
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleReset} className="space-y-4">
					<div>
						<label
							htmlFor={otpId}
							className="block text-sm font-medium mb-1 text-text-muted"
						>
							Verification Code
						</label>
						<Input
							id={otpId}
							type="text"
							value={otp}
							onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
							placeholder="000000"
							maxLength={6}
							className="text-center tracking-widest font-mono"
							required
						/>
					</div>

					<div>
						<label
							htmlFor={passwordId}
							className="block text-sm font-medium mb-1 text-text-muted"
						>
							New Password
						</label>
						<Input
							id={passwordId}
							type="password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							placeholder="••••••••"
							required
						/>
					</div>

					<div>
						<label
							htmlFor={confirmId}
							className="block text-sm font-medium mb-1 text-text-muted"
						>
							Confirm New Password
						</label>
						<Input
							id={confirmId}
							type="password"
							value={confirmPassword}
							onChange={(e) => setConfirmPassword(e.target.value)}
							placeholder="••••••••"
							required
						/>
					</div>

					{error && (
						<p className="text-error text-sm bg-panel p-2 border border-border">
							{error}
						</p>
					)}

					<Button
						type="submit"
						disabled={otp.length !== 6 || !password || isSubmitting}
						className="w-full"
					>
						{isSubmitting ? "Resetting..." : "Update Password"}
					</Button>
				</form>

				<DialogClose asChild>
					<button
						type="button"
						className="absolute top-4 right-4 text-text-muted hover:text-text transition-colors p-1"
						aria-label="Close"
					>
						<svg
							className="w-5 h-5"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<title>Close</title>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M6 18L18 6M6 6l12 12"
							/>
						</svg>
					</button>
				</DialogClose>
			</DialogContent>
		</Dialog>
	);
}
