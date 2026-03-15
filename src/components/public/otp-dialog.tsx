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

interface OtpDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	email: string;
}

export function OtpDialog({ open, onOpenChange, email }: OtpDialogProps) {
	const id = useId();
	const [otp, setOtp] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [isVerifying, setIsVerifying] = useState(false);
	const navigate = useNavigate();

	const handleVerify = async () => {
		setError(null);
		setIsVerifying(true);

		try {
			const { error } = await authClient.signIn.emailOtp({
				email,
				otp,
			});

			if (error) {
				setError(error.message ?? "Verification failed. Please try again.");
				return;
			}

			onOpenChange(false);
			navigate({ to: "/" });
		} catch (_err) {
			setError("An unexpected error occurred. Please try again.");
		} finally {
			setIsVerifying(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="bg-card p-6 w-full max-w-sm shadow-xl z-50 border border-border">
				<DialogHeader>
					<DialogTitle className="text-xl font-bold mb-2 text-foreground">
						Verify Your Email
					</DialogTitle>
					<DialogDescription className="text-sm text-muted-foreground mb-6">
						We've sent a 6-digit verification code to{" "}
						<strong className="text-foreground">{email}</strong>. Please enter
						it below to continue.
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-6">
					<div>
						<label
							htmlFor={id}
							className="block text-sm font-medium mb-2 text-muted-foreground"
						>
							Verification Code
						</label>
						<Input
							id={id}
							type="text"
							value={otp}
							onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
							placeholder="000000"
							maxLength={6}
							className="text-center tracking-[0.5em] text-2xl font-mono bg-input text-foreground"
							autoFocus
						/>
					</div>

					{error && (
						<p className="text-destructive text-sm bg-muted p-2 border border-border">
							{error}
						</p>
					)}

					<Button
						type="button"
						onClick={handleVerify}
						disabled={otp.length !== 6 || isVerifying}
						className="w-full bg-primary text-primary-foreground"
					>
						{isVerifying ? "Verifying..." : "Verify & Continue"}
					</Button>
				</div>

				<DialogClose asChild>
					<button
						type="button"
						className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors p-1"
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
