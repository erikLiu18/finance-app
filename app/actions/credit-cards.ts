"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { prisma } from "@/lib/prisma";

const creditCardSchema = z.object({
    name: z.string().min(1, "Name is required"),
    dueDay: z.coerce.number().min(1).max(31),
    notifyEmail: z.boolean().default(false),
    notifySms: z.boolean().default(false),
    daysBefore: z.coerce.number().min(0).max(10).default(3),
    hoursBefore: z.coerce.number().min(0).max(23).default(0),
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

    const { name, dueDay, notifyEmail, notifySms, daysBefore, hoursBefore } = validatedFields.data;

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
            notifyDaysBefore: daysBefore,
            notifyHoursBefore: hoursBefore,
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

    const { name, dueDay, notifyEmail, notifySms, daysBefore, hoursBefore } = validatedFields.data;

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
            notifyDaysBefore: daysBefore,
            notifyHoursBefore: hoursBefore,
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

    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();

    let dueDate = new Date(currentYear, currentMonth, card.dueDay);

    // Logic matches Cron: if date passed, move to next month.
    if (dueDate < today) {
        dueDate = new Date(currentYear, currentMonth + 1, card.dueDay);
    }

    await prisma.creditCard.update({
        where: { id: cardId },
        data: { lastPaidDueDate: dueDate },
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
