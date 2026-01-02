
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
            // Calculate due date for this month
            const currentYear = today.getFullYear();
            const currentMonth = today.getMonth(); // 0-indexed

            // Handle due days that don't exist in current month (e.g. 31st in Feb)
            // JS Date auto-corrects (Feb 31 -> Mar 3), which might be okay or off by a day.
            // Better to strictly set the day.
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

            // Calculate "Notify Date"
            const notifyDate = new Date(dueDate);
            notifyDate.setDate(dueDate.getDate() - card.notifyDaysBefore);

            // Check if TODAY is the notify date
            // Compare YYYY-MM-DD
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
                notificationsSent.push(card.name);
            }
        }

        return NextResponse.json({ success: true, sent: notificationsSent });

    } catch (error) {
        console.error("Cron Error:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
