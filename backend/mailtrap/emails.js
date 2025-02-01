import { VERIFICATION_EMAIL_TEMPLATE, WELCOME_EMAIL_TEMPLATE, PASSWORD_RESET_REQUEST_TEMPLATE } from "./emailTemplate.js";
import { mailtrapClient, sender } from "./mailtrap.config.js";

export const sendVerificationEmail = async (email, verificationToken) => {
    const recipient = [{ email }]
    
    try {
        const response = await mailtrapClient.send({
            from:sender,
            to:recipient,
            subject: "Verify your email",
            html: VERIFICATION_EMAIL_TEMPLATE.replace("{verificationCode}", verificationToken),
            category: "Email Verification"
        })
        console.log("Verification email sent", response);
    } catch (error) {
        console.error("Failed to send verification email", error);
        throw new Error(`Failed to send verification email: ${error}`);
    }
};

export const sendWelcomeEmail = async (email, name) => {
	const recipient = [{ email }];

	try {
        const response = await mailtrapClient.send({
            from: sender,
            to: recipient,
            subject: "Welcome to our app",
            html: WELCOME_EMAIL_TEMPLATE.replace("{username}", name),
            category: "Welcome Email"
        });
        console.log("Welcome email sent", response);
    } catch (error) {
        console.error("Error sending welcome email", error);
        throw new Error(`Error sending welcome email: ${error}`);
    }
};

export const sendPasswordResetEmail = async (email, resetURL) => {
    const recipient = [{ email }];

    try {
        const response = await mailtrapClient.send({
            from: sender,
            to: recipient,
            subject: "Reset your password",
            html: PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetURL}", resetURL),
            category: "Password Reset",
        });
        console.log("Password reset email sent", response);
    } catch (error) {
        console.error(`Error sending password reset email`, error);
        throw new Error(`Error sending password reset email: ${error}`);
    }
};