"use server";

import { auth, currentUser, clerkClient } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { prisma } from "@/lib/prisma";

const creditCardSchema = z.object({
    name: z.string().min(1, "Name is required"),
    dueDay: z.coerce.number().min(1).max(31),
    notifyEmail: z.boolean().default(false),
    notifySms: z.boolean().default(false),
});

export async function getCreditCards() {
    const { userId } = await auth();
    if (!userId) return [];

    return await prisma.creditCard.findMany({
        where: { userId },
        orderBy: { dueDay: "asc" },
    });
}

export async function addCreditCard(formData: z.infer<typeof creditCardSchema>) {
    const user = await currentUser();
    if (!user) throw new Error("Unauthorized");
    const userId = user.id;

    const validatedFields = creditCardSchema.safeParse(formData);
    if (!validatedFields.success) {
        throw new Error("Invalid fields");
    }

    const { name, dueDay, notifyEmail, notifySms } = validatedFields.data;

    const email = user.emailAddresses[0]?.emailAddress ?? "no-email@example.com";

    // Ensure User exists in our DB (sync with Clerk)
    await prisma.user.upsert({
        where: { id: userId },
        update: { email }, // Update email if it changed
        create: {
            id: userId,
            email,
        },
    });

    await prisma.creditCard.create({
        data: {
            userId,
            name,
            dueDay,
            notifyEmail,
            notifySms,
        },
    });

    revalidatePath("/credit-cards");
}

export async function deleteCreditCard(id: string) {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    await prisma.creditCard.delete({
        where: {
            id,
            userId, // Security: Ensure user owns the card
        },
    });

    revalidatePath("/credit-cards");
}

export async function updateCreditCard(id: string, formData: z.infer<typeof creditCardSchema>) {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const validatedFields = creditCardSchema.safeParse(formData);
    if (!validatedFields.success) {
        throw new Error("Invalid fields");
    }

    const { name, dueDay, notifyEmail, notifySms } = validatedFields.data;

    await prisma.creditCard.update({
        where: {
            id,
            userId, // Security: Ensure user owns the card
        },
        data: {
            name,
            dueDay,
            notifyEmail,
            notifySms,
        },
    });

    revalidatePath("/credit-cards");
}

export async function markCardAsPaid(cardId: string) {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const card = await prisma.creditCard.findUnique({
        where: { id: cardId, userId },
    });

    if (!card) throw new Error("Card not found");

    // Fix: Use ET time to align with Cron logic and avoid timezone issues
    const now = new Date();
    const etString = now.toLocaleString("en-US", { timeZone: "America/New_York", hour12: false });
    const nowET = new Date(etString); // This creates a date object where the "local" time components match ET

    const currentDay = nowET.getDate();
    const currentMonth = nowET.getMonth();
    const currentYear = nowET.getFullYear();

    let targetMonth = currentMonth;
    let targetYear = currentYear;

    // Logic matches Cron: Only move to next month if strictly AFTER the due day.
    // Paying ON the due day should count for the current month.
    if (currentDay > card.dueDay) {
        targetMonth++;
        if (targetMonth > 11) {
            targetMonth = 0;
            targetYear++;
        }
    }

    // Format: YYYY-MM-DD (e.g., "2026-01-15")
    const mm = (targetMonth + 1).toString().padStart(2, "0");
    const dd = card.dueDay.toString().padStart(2, "0");
    const dueDateString = `${targetYear}-${mm}-${dd}`;

    await prisma.creditCard.update({
        where: { id: cardId },
        data: { lastPaidDueDate: dueDateString },
    });

    revalidatePath("/credit-cards");
}

export async function undoMarkCardAsPaid(cardId: string) {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const card = await prisma.creditCard.findUnique({
        where: { id: cardId, userId },
    });

    if (!card) throw new Error("Card not found");

    await prisma.creditCard.update({
        where: { id: cardId },
        data: { lastPaidDueDate: null },
    });

    revalidatePath("/credit-cards");
}

export async function getNotificationAlerts() {
    const { userId } = await auth();
    if (!userId) return [];

    return await prisma.notificationAlert.findMany({
        where: { userId },
        orderBy: { hoursBefore: "desc" },
    });
}

export async function createNotificationAlert(hoursBefore: number) {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    // Enforce max 5 alerts
    const count = await prisma.notificationAlert.count({
        where: { userId },
    });

    if (count >= 5) {
        throw new Error("Maximum of 5 alerts allowed.");
    }

    // Check for duplicates
    const existing = await prisma.notificationAlert.findFirst({
        where: { userId, hoursBefore },
    });

    if (existing) {
        throw new Error("Alert already exists for this time.");
    }

    await prisma.notificationAlert.create({
        data: {
            userId,
            hoursBefore,
        },
    });

    revalidatePath("/credit-cards");
}

export async function deleteNotificationAlert(id: string) {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    await prisma.notificationAlert.delete({
        where: { id, userId },
    });

    revalidatePath("/credit-cards");
}

export async function getSharedCreditCards() {
    const { userId } = await auth();
    if (!userId) return [];

    const sharedCards = await prisma.sharedCreditCard.findMany({
        where: { userId },
        include: {
            creditCard: {
                include: {
                    user: {
                        select: { email: true }
                    }
                }
            }
        }
    });

    return sharedCards.map(sc => ({
        ...sc.creditCard,
        sharedByEmail: sc.creditCard.user.email
    }));
}

export async function shareCreditCard(cardId: string, email: string) {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    // 1. Find the user to share with
    let userToShareWith = await prisma.user.findUnique({
        where: { email }
    });

    if (!userToShareWith) {
        // Try to find in Clerk and sync
        try {
            const client = await clerkClient();
            const clerkUsers = await client.users.getUserList({ emailAddress: [email] });

            if (clerkUsers.data.length > 0) {
                const clerkUser = clerkUsers.data[0];
                const primaryEmail = clerkUser.emailAddresses.find(e => e.id === clerkUser.primaryEmailAddressId)?.emailAddress || clerkUser.emailAddresses[0].emailAddress;

                userToShareWith = await prisma.user.create({
                    data: {
                        id: clerkUser.id,
                        email: primaryEmail,
                    }
                });
            }
        } catch (error) {
            console.error("Failed to fetch user from Clerk", error);
        }
    }

    if (!userToShareWith) {
        throw new Error("User with this email not found. They must sign up first.");
    }

    if (userToShareWith.id === userId) {
        throw new Error("You cannot share a card with yourself.");
    }

    // 2. Verify ownership
    const card = await prisma.creditCard.findUnique({
        where: { id: cardId, userId }
    });

    if (!card) throw new Error("Card not found or you are not the owner.");

    // 3. Create share
    try {
        await prisma.sharedCreditCard.create({
            data: {
                creditCardId: cardId,
                userId: userToShareWith.id
            }
        });
    } catch (error) {
        // Unique constraint violation means already shared
        throw new Error("Card is already shared with this user.");
    }

    revalidatePath("/credit-cards");
}

export async function unshareCreditCard(cardId: string, userIdToUnshare: string) {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    // Verify ownership of the card
    const card = await prisma.creditCard.findUnique({
        where: { id: cardId, userId }
    });

    if (!card) throw new Error("Card not found or you are not the owner.");

    await prisma.sharedCreditCard.deleteMany({
        where: {
            creditCardId: cardId,
            userId: userIdToUnshare
        }
    });

    revalidatePath("/credit-cards");
}

export async function getCardSharedUsers(cardId: string) {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    // Verify ownership
    const card = await prisma.creditCard.findUnique({
        where: { id: cardId, userId }
    });

    if (!card) return []; // Or throw error, but empty list is safer for UI

    const shared = await prisma.sharedCreditCard.findMany({
        where: { creditCardId: cardId },
        include: {
            user: {
                select: { id: true, email: true }
            }
        }
    });

    return shared.map(s => s.user);
}
