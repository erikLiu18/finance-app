"use client";

import { CreditCard } from "@prisma/client";
import { CreditCardItem } from "@/components/credit-card-item";

interface CreditCardListProps {
    creditCards: (CreditCard & { sharedByEmail?: string | null })[];
    isEditMode: boolean;
    onUpdate?: (id: string, field: keyof CreditCard, value: any) => void;
    onDelete?: (id: string) => void;
}

export function CreditCardList({ creditCards, isEditMode, onUpdate, onDelete }: CreditCardListProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {creditCards.length === 0 ? (
                <div className="col-span-full text-center text-muted-foreground py-10">
                    No credit cards added yet. Add one to get started!
                </div>
            ) : (
                creditCards.map((card) => (
                    <CreditCardItem
                        key={card.id}
                        card={card}
                        isEditMode={isEditMode}
                        onUpdate={onUpdate}
                        onDelete={onDelete}
                    />
                ))
            )}
        </div>
    );
}
