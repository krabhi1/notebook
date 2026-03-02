import { env } from "cloudflare:workers";
import { render } from "@react-email/render";
import { Resend } from "resend";
import { EmailTemplate, type EmailTemplateType } from "./template";

const resend = new Resend(env.RESEND_API_KEY);

/**
 * Sends an OTP email using the unified EmailTemplate
 * @param email - Recipient email address
 * @param otp - The 6-digit one-time password
 * @param type - The type of email to send (affects subject and content)
 */
export async function sendVerifyEmail(
	email: string,
	otp: string,
	type: EmailTemplateType = "email-verification",
) {
	try {
		const subjects: Record<EmailTemplateType, string> = {
			"email-verification": "Verify Your Email",
			"sign-in": "Your Sign-In Code",
			"forget-password": "Reset Your Password",
			"change-password": "Change Your Password",
		};

		const startTime = performance.now();
		const html = await render(<EmailTemplate otp={otp} type={type} />);

		await resend.emails.send({
			from: "Vow <vow@mail.krabhi.me>",
			to: email,
			subject: subjects[type] || subjects["email-verification"],
			html,
		});
		const endTime = performance.now();
		console.log(
			`Time taken to render and send email: ${endTime - startTime} ms`,
		);
	} catch (error) {
		console.error("Error sending email:", error);
	}
}
