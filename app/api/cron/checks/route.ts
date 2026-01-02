
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail, sendSms } from "@/lib/notifications/service";

export async function GET(request: Request) {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const today = new Date();
        // Logic to find cards due in 'notifyDaysBefore' days
        // This is complex because 'dueDay' is just an integer (1-31)
        // For MVP, we fetch all active cards and filter in JS.

        // 1. Fetch all cards with notifications enabled
        const cards = await prisma.creditCard.findMany({
            where: {
                OR: [{ notifyEmail: true }, { notifySms: true }],
            },
            include: {
                user: true, // Assuming relation exists, might need adjustment if not
            }
        });

        const notificationsSent = [];

        for (const card of cards) {
            // Check time in ET
            const now = new Date();
            const timeInET = new Date(now.toLocaleString("en-US", { timeZone: "America/New_York" }));
            const currentHourET = timeInET.getHours();

            // Only notify after 5 PM ET (17:00)
            if (currentHourET < 17) {
                continue;
            }

            // Calculate due date for this month
            const currentYear = today.getFullYear();
            const currentMonth = today.getMonth(); // 0-indexed

            let dueDate = new Date(currentYear, currentMonth, card.dueDay);

            // If due date passed, look at next month
            if (dueDate < today) {
                dueDate = new Date(currentYear, currentMonth + 1, card.dueDay);
            }

            // Skip if already paid for this cycle
            if (card.lastPaidDueDate &&
                card.lastPaidDueDate.toDateString() === dueDate.toDateString()) {
                continue;
            }

            // Skip if already notified today.
            // Check if lastNotifiedAt is the same day as today (in ET or server time? server time is fine if we just want "today")
            // Actually, let's use the current date (server time) for simplicity, as the cron runs daily.
            if (card.lastNotifiedAt &&
                card.lastNotifiedAt.toDateString() === today.toDateString()) {
                continue;
            }

            // Calculate "Notify Date"
            const notifyDate = new Date(dueDate);
            notifyDate.setDate(dueDate.getDate() - card.notifyDaysBefore);

            // Check if TODAY is the notify date
            if (
                today.getDate() === notifyDate.getDate() &&
                today.getMonth() === notifyDate.getMonth() &&
                today.getFullYear() === notifyDate.getFullYear()
            ) {
                // SEND NOTIFICATION
                if (card.notifyEmail) {
                    const email = card.user?.email;
                    if (email) {
                        await sendEmail(email, `Bill Due: ${card.name}`, `Your ${card.name} bill is due on ${dueDate.toLocaleDateString()}`);
                    } else {
                        console.warn(`[CRON] Card ${card.name} has notifyEmail=true but user has no email.`);
                    }
                }
                if (card.notifySms) {
                    await sendSms("+1234567890", `Bill Due: ${card.name} on ${dueDate.toLocaleDateString()}`);
                }

                // Update lastNotifiedAt
                await prisma.creditCard.update({
                    where: { id: card.id },
                    data: { lastNotifiedAt: new Date() }
                });

                notificationsSent.push(card.name);
            }
        }

        return NextResponse.json({ success: true, sent: notificationsSent });

    } catch (error) {
        console.error("Cron Error:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
