"use server";

import { auth } from "@clerk/nextjs/server";
import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { prisma } from "@/lib/prisma";

// const prisma = new PrismaClient(); // Removed

const creditCardSchema = z.object({
    name: z.string().min(1, "Name is required"),
    dueDay: z.coerce.number().min(1).max(31),
    notifyEmail: z.boolean().default(false),
    notifySms: z.boolean().default(false),
    daysBefore: z.coerce.number().min(1).max(10).default(3),
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
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const validatedFields = creditCardSchema.safeParse(formData);
    if (!validatedFields.success) {
        throw new Error("Invalid fields");
    }

    const { name, dueDay, notifyEmail, notifySms, daysBefore } = validatedFields.data;

    // Ensure User exists in our DB (sync with Clerk if needed)
    // Logic: In a real app we'd use webhooks, but for now we can upsert the user
    await prisma.user.upsert({
        where: { id: userId },
        update: {},
        create: {
            id: userId,
            email: "placeholder@example.com", // We might not have email here without extra Clerk calls
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

    const { name, dueDay, notifyEmail, notifySms, daysBefore } = validatedFields.data;

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
        },
    });

    revalidatePath("/credit-cards");
}
