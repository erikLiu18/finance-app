"use client";

import { useState, useEffect } from "react";
import { CreditCard, NotificationAlert } from "@prisma/client";
import { Pencil, Check, X, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

import { CreditCardList } from "@/components/credit-card-list";
import { NotificationSettings } from "@/components/notification-settings";
import { MobileNotificationSettings } from "@/components/mobile-notification-settings";
import { AddCardDialog } from "@/components/add-card-dialog";
import { Button } from "@/components/ui/button";
import { updateCreditCard, deleteCreditCard } from "@/app/actions/credit-cards";

interface CreditCardsContentProps {
    creditCards: CreditCard[];
    alerts: NotificationAlert[];
}

export function CreditCardsContent({ creditCards: initialCreditCards, alerts }: CreditCardsContentProps) {
    const router = useRouter();
    const [cards, setCards] = useState<CreditCard[]>(initialCreditCards);
    const [isEditMode, setIsEditMode] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Sync with server data if it changes (e.g. after adding a card via dialog)
    // But ONLY if not in edit mode to avoid overwriting work in progress
    useEffect(() => {
        if (!isEditMode) {
            setCards(initialCreditCards);
        }
    }, [initialCreditCards, isEditMode]);

    const handleUpdate = (id: string, field: keyof CreditCard, value: any) => {
        setCards((prev) =>
            prev.map((card) =>
                card.id === id ? { ...card, [field]: value } : card
            )
        );
    };

    const handleDelete = (id: string) => {
        setCards((prev) => prev.filter((card) => card.id !== id));
    };

    const handleCancel = () => {
        setCards(initialCreditCards);
        setIsEditMode(false);
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            // Calculate diffs
            // 1. Deletions: Cards present in initial but not in current
            const currentIds = new Set(cards.map(c => c.id));
            const distinctIdsToDelete = initialCreditCards
                .filter(c => !currentIds.has(c.id))
                .map(c => c.id);

            // 2. Updates: Cards present in both but changed
            const updates = cards.filter(current => {
                const original = initialCreditCards.find(c => c.id === current.id);
                if (!original) return false; // Should not happen for existing cards
                return (
                    current.name !== original.name ||
                    current.dueDay !== original.dueDay ||
                    current.notifyEmail !== original.notifyEmail ||
                    current.notifySms !== original.notifySms
                );
            });

            // Execute deletions
            await Promise.all(distinctIdsToDelete.map(id => deleteCreditCard(id)));

            // Execute updates
            await Promise.all(updates.map(card => updateCreditCard(card.id, {
                name: card.name,
                dueDay: card.dueDay,
                notifyEmail: card.notifyEmail,
                notifySms: card.notifySms
            })));

            setIsEditMode(false);
            router.refresh(); // Refresh server data
        } catch (error) {
            console.error("Failed to save changes", error);
            alert("Failed to save changes. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-6 md:py-10">
            <div className="flex flex-row justify-between items-center gap-4 mb-6">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold">Credit Cards</h1>
                    <p className="text-muted-foreground text-sm mt-1">
                        Manage your credit cards and payment alerts.
                    </p>
                </div>
                <div className="flex gap-2 items-center">
                    <MobileNotificationSettings alerts={alerts} />

                    {isEditMode ? (
                        <>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleCancel}
                                disabled={isSaving}
                            >
                                <X className="h-4 w-4 mr-2" />
                                Cancel
                            </Button>
                            <Button
                                size="sm"
                                onClick={handleSave}
                                disabled={isSaving}
                            >
                                {isSaving ? (
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                    <Check className="h-4 w-4 mr-2" />
                                )}
                                Done
                            </Button>
                        </>
                    ) : (
                        <>
                            {/* Only show Edit if there are cards to edit */}
                            {cards.length > 0 && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setIsEditMode(true)}
                                >
                                    <Pencil className="h-4 w-4 mr-2" />
                                    Edit
                                </Button>
                            )}
                            <AddCardDialog />
                        </>
                    )}
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-6 md:items-start">
                <div className="hidden md:block w-full md:w-1/3 lg:w-1/4">
                    <NotificationSettings initialAlerts={alerts} />
                </div>
                <div className="flex-1">
                    <CreditCardList
                        creditCards={cards}
                        isEditMode={isEditMode}
                        onUpdate={handleUpdate}
                        onDelete={handleDelete}
                    />
                </div>
            </div>
        </div>
    );
}
