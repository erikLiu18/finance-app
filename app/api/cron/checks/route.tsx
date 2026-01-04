import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/notifications/service";
import BillDueEmail from "@/emails/bill-due-email";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        // 1. Fetch users with alerts and cards
        const users = await prisma.user.findMany({
            include: {
                notificationAlerts: true,
                creditCards: {
                    where: {
                        OR: [{ notifyEmail: true }, { notifySms: true }],
                    },
                    include: {
                        notificationLogs: true, // Fetch logs to check against
                    }
                }
            }
        });

        const notificationsSent: string[] = [];

        // 2. Determine Current Time in ET
        // We do this by creating a date string in ET and parsing it back
        const now = new Date();
        const etString = now.toLocaleString("en-US", { timeZone: "America/New_York", hour12: false });
        // etString is roughly "M/D/YYYY, HH:mm:ss"
        const nowET = new Date(etString);

        // Helper to get ET date object for a specific year/month/day at 17:00:00
        const getDeadlineET = (dYear: number, dMonth: number, dDay: number) => {
            const date = new Date(dYear, dMonth, dDay, 17, 0, 0, 0);
            // Note: This 'date' is constructed using Server Local Time interpretation of the numbers.
            // If server is UTC, this is 17:00 UTC.
            // But we want to compare with 'nowET' which is also constructed similarly.
            // As long as both `nowET` and `deadline` are constructed from components treated as "Local Time" (which we align to ET components), the difference is correct.
            return date;
        };

        for (const user of users) {
            if (user.notificationAlerts.length === 0 || user.creditCards.length === 0) continue;

            for (const card of user.creditCards) {
                const currentDay = nowET.getDate();
                const currentMonth = nowET.getMonth(); // 0-11
                const currentYear = nowET.getFullYear();

                // Determine relevant due date
                // If we are past the due day (e.g. today 6th, due 5th), we assume the NEXT bill.
                // However, if we are currently checking for a missed alert on the 5th (today 5th 18:00), we still want the 5th.

                let targetMonth = currentMonth;
                let targetYear = currentYear;

                // Safe check: if today is past the card due day, and we are quite late (e.g. next day), move to next month.
                // But strictly, if we are on the due day (after 17:00), we might still need to send the 0-hour alert or overdue.
                // Let's stick to: If today > dueDay, assume next month.
                // This has the edge case: What if cron runs on DueDay at 18:00? 
                // It sees DueDay < Today? No, Equal. So it stays current month. 

                if (currentDay > card.dueDay) {
                    targetMonth++;
                    if (targetMonth > 11) {
                        targetMonth = 0;
                        targetYear++;
                    }
                }

                const deadlineET = getDeadlineET(targetYear, targetMonth, card.dueDay);

                // If deadline is in the past (e.g. earlier today), that's fine, we check if we missed alert.

                // Skip if already paid
                // We need to construct the JS Date for the due date to compare with lastPaidDueDate (which is DB stored date).
                // DB stores generic date. Let's compare generic YYYY-MM-DD string.
                const dueDateString = `${targetYear}-${String(targetMonth + 1).padStart(2, '0')}-${String(card.dueDay).padStart(2, '0')}`;

                if (card.lastPaidDueDate) {
                    // Convert stored date to string
                    const paidDate = new Date(card.lastPaidDueDate);
                    const paidYear = paidDate.getFullYear();
                    const paidMonth = paidDate.getMonth() + 1;
                    const paidDay = paidDate.getDate();
                    const paidDateString = `${paidYear}-${String(paidMonth).padStart(2, '0')}-${String(paidDay).padStart(2, '0')}`;

                    // We match broadly on the cycle.
                    // Actually, exact match on constructed Due Date is safest.
                    // Our `markCardAsPaid` logic sets `lastPaidDueDate` to the exact Due Date.
                    // But let's handle potential timezone drift in DB storage by comparing components or close proximity?
                    // Safer: compare generic strings YYYY-MM-DD.

                    // Wait, `markCardAsPaid` uses server local time. Cron uses ET-shifted time.
                    // The `dueDay` is the anchor. 
                    // If `lastPaidDueDate` is "2023-01-05...", and we are looking at due date "2023-01-05", it's match.

                    if (paidDateString === dueDateString) {
                        continue;
                    }
                }

                // Check each alert
                for (const alert of user.notificationAlerts) {
                    // Check NotificationLog
                    const alreadySent = card.notificationLogs.some(log =>
                        log.alertHoursBefore === alert.hoursBefore &&
                        new Date(log.dueDate).toISOString().startsWith(dueDateString) // Compare YMD
                    );

                    if (alreadySent) continue;

                    // Check if time to trigger
                    // Trigger is deadline - hoursBefore
                    // e.g. Deadline 17:00. Alert 1h. Trigger 16:00.
                    // If Now 16:01. 16:01 >= 16:00. Send.

                    const triggerTime = new Date(deadlineET);
                    triggerTime.setHours(triggerTime.getHours() - alert.hoursBefore);

                    if (nowET >= triggerTime) {
                        // SEND
                        // const msg = `Bill Due: ${card.name} is due on ${targetYear}-${targetMonth + 1}-${card.dueDay} by 5 PM ET.`;

                        if (card.notifyEmail && user.email) {
                            await sendEmail(user.email, `Bill Due Reminder: ${card.name}`, (
                                <BillDueEmail
                                    cardName={card.name}
                                    dueDate={`${targetYear}-${targetMonth + 1}-${card.dueDay}`}
                                />
                            ));
                        }
                        if (card.notifySms) {
                            // Assuming we have a phone number, logic placeholder
                            // await sendSms(...)
                        }

                        // LOG
                        await prisma.notificationLog.create({
                            data: {
                                creditCardId: card.id,
                                alertHoursBefore: alert.hoursBefore,
                                dueDate: new Date(targetYear, targetMonth, card.dueDay) // Storing purely as date marker
                            }
                        });

                        notificationsSent.push(`${card.name} (${alert.hoursBefore}h)`);
                    }
                }
            }
        }

        return NextResponse.json({ success: true, sent: notificationsSent });

    } catch (error) {
        console.error("Cron Error:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
