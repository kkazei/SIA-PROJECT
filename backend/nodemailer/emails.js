import { VERIFICATION_EMAIL_TEMPLATE, WELCOME_EMAIL_TEMPLATE, PASSWORD_RESET_REQUEST_TEMPLATE, PASSWORD_RESET_SUCCESS_TEMPLATE } from "./emailTemplate.js";
import { sendEmail, sender } from "./email.config.js";

export const sendVerificationEmail = async (email, verificationToken) => {
    try {
        const response = await sendEmail(
            email,
            "Verify your email",
            VERIFICATION_EMAIL_TEMPLATE.replace("{verificationCode}", verificationToken)
        );
        console.log("Verification email sent", response);
        return response;
    } catch (error) {
        console.error("Failed to send verification email", error);
        throw new Error(`Failed to send verification email: ${error}`);
    }
};

export const sendWelcomeEmail = async (email, name) => {
    try {
        const response = await sendEmail(
            email,
            "Welcome to our app",
            WELCOME_EMAIL_TEMPLATE.replace("{username}", name)
        );
        console.log("Welcome email sent", response);
        return response;
    } catch (error) {
        console.error("Error sending welcome email", error);
        throw new Error(`Error sending welcome email: ${error}`);
    }
};

export const sendPasswordResetEmail = async (email, resetURL) => {
    try {
        // Fix any URLs that contain "undefined" before sending
        if (resetURL && resetURL.includes('undefined')) {
            console.warn('Invalid URL detected in password reset email:', resetURL);
            // Replace the invalid part with your production domain
            resetURL = resetURL.replace('http://undefined', 'https://sia-project-a5xr.onrender.com');
            console.log('URL corrected to:', resetURL);
        }
        
        const response = await sendEmail(
            email,
            "Reset your password",
            PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetURL}", resetURL)
        );
        console.log("Password reset email sent with URL:", resetURL);
        return response;
    } catch (error) {
        console.error(`Error sending password reset email`, error);
        throw new Error(`Error sending password reset email: ${error}`);
    }
};

export const sendResetSuccessEmail = async (email) => {
    try {
        const response = await sendEmail(
            email,
            "Password reset successful",
            PASSWORD_RESET_SUCCESS_TEMPLATE
        );
        console.log("Password reset success email sent", response);
        return response;
    } catch (error) {
        console.error("Error sending password reset success email", error);
        throw new Error(`Error sending password reset success email: ${error}`);
    }
};