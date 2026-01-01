
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail(to: string, subject: string, html: string) {
    if (!process.env.RESEND_API_KEY) {
        console.warn("[EMAIL] No RESEND_API_KEY found, skipping email.");
        return;
    }

    try {
        const { data, error } = await resend.emails.send({
            from: 'Finance App <onboarding@resend.dev>', // Use default until domain is verified
            to: [to],
            subject: subject,
            html: html,
        });

        if (error) {
            console.error("[EMAIL] Error sending email:", error);
            return;
        }

        console.log(`[EMAIL] Sent to ${to} | ID: ${data?.id}`);
    } catch (err) {
        console.error("[EMAIL] Exception:", err);
    }
}

export async function sendSms(to: string, message: string) {
    // TODO: Integrate with Twilio
    console.log(`[SMS] To: ${to} | Message: ${message}`);
}
