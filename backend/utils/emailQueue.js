import Queue from 'bull';
import { sendEmail } from '../mailtrap/email.config.js';
import { queueEmail } from '../utils/emailQueue.js';

// Create a queue
const emailQueue = new Queue('email-queue');

// Process jobs from the queue
emailQueue.process(async (job) => {
  const { to, subject, html } = job.data;
  return await sendEmail(to, subject, html);
});

// Add a job to the queue
export const queueEmail = (to, subject, html) => {
  return emailQueue.add({
    to,
    subject,
    html
  });
};

// Handle completed jobs
emailQueue.on('completed', (job, result) => {
  console.log(`Job ${job.id} completed with result:`, result);
});

// Handle failed jobs
emailQueue.on('failed', (job, error) => {
  console.error(`Job ${job.id} failed with error:`, error);
});

export const sendVerificationEmail = async (email, verificationToken) => {
  try {
    await queueEmail(
      email,
      "Verify your email",
      VERIFICATION_EMAIL_TEMPLATE.replace("{verificationCode}", verificationToken)
    );
    return { success: true };
  } catch (error) {
    console.error("Failed to queue verification email", error);
    throw new Error(`Failed to queue verification email: ${error}`);
  }
};

export default emailQueue;