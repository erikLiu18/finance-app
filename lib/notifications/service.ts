
import { Resend } from 'resend';
import * as React from 'react';

export async function sendEmail(to: string, subject: string, content: string | React.ReactNode) {
    const apiKey = process.env.RESEND_API_KEY;

    if (!apiKey) {
        console.warn("[EMAIL] No RESEND_API_KEY found, skipping email.");
        return;
    }

    const resend = new Resend(apiKey);

    try {
        const payload = typeof content === 'string' ? { html: content } : { react: content as React.ReactElement };
        const { data, error } = await resend.emails.send({
            from: 'Finance App <onboarding@resend.dev>', // Use default until domain is verified
            to: [to],
            subject: subject,
            ...payload
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
