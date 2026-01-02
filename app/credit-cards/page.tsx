import { getCreditCards, deleteCreditCard, markCardAsPaid, undoMarkCardAsPaid } from "@/app/actions/credit-cards";

export const dynamic = "force-dynamic";
import { AddCardDialog } from "@/components/add-card-dialog";
import { EditCardDialog } from "@/components/edit-card-dialog";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, CheckCircle } from "lucide-react";
import { CreditCard } from "@prisma/client";

export default async function CreditCardsPage() {
    const creditCards = await getCreditCards();

    return (
        <div className="container mx-auto px-4 py-6 md:py-10">
            <div className="flex flex-row justify-between items-center gap-4 mb-6">
                <h1 className="text-2xl md:text-3xl font-bold">Credit Cards</h1>
                <AddCardDialog />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {creditCards.length === 0 ? (
                    <div className="col-span-full text-center text-muted-foreground py-10">
                        No credit cards added yet. Add one to get started!
                    </div>
                ) : (
                    creditCards.map((card: CreditCard) => (
                        <Card key={card.id} className="flex flex-col">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg">{card.name}</CardTitle>
                                <CardDescription>Due on the {card.dueDay}th</CardDescription>
                            </CardHeader>
                            <CardContent className="flex-1">
                                <div className="flex flex-col gap-2 text-sm">
                                    <div className="flex justify-between">
                                        <span>Email Alerts:</span>
                                        <span className={card.notifyEmail ? "text-green-600 dark:text-green-500" : "text-muted-foreground"}>
                                            {card.notifyEmail ? "On" : "Off"}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Text Alerts:</span>
                                        <span className={card.notifySms ? "text-green-600 dark:text-green-500" : "text-muted-foreground"}>
                                            {card.notifySms ? "On" : "Off"}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Notify Before:</span>
                                        <span>
                                            {card.notifyDaysBefore}d {card.notifyHoursBefore}h
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="flex justify-between gap-2 pt-3 items-center">
                                {(() => {
                                    const today = new Date();
                                    const currentYear = today.getFullYear();
                                    const currentMonth = today.getMonth();
                                    let nextDueDate = new Date(currentYear, currentMonth, card.dueDay);
                                    if (nextDueDate < today) {
                                        nextDueDate = new Date(currentYear, currentMonth + 1, card.dueDay);
                                    }
                                    const isPaid = card.lastPaidDueDate &&
                                        nextDueDate.toDateString() === card.lastPaidDueDate.toDateString();

                                    if (isPaid) {
                                        return (
                                            <div className="flex items-center gap-2">
                                                <div className="flex items-center text-green-600 gap-2 text-sm font-medium">
                                                    <CheckCircle className="h-4 w-4" />
                                                    Paid
                                                </div>
                                                <form action={undoMarkCardAsPaid.bind(null, card.id)}>
                                                    <Button variant="ghost" size="sm" className="h-6 text-muted-foreground hover:text-foreground text-xs px-2">
                                                        Undo
                                                    </Button>
                                                </form>
                                            </div>
                                        );
                                    } else {
                                        return (
                                            <form action={markCardAsPaid.bind(null, card.id)}>
                                                <Button size="sm" variant="outline" className="h-8">
                                                    Mark Paid
                                                </Button>
                                            </form>
                                        );
                                    }
                                })()}
                                <div className="flex gap-2">
                                    <EditCardDialog card={card} />
                                    <form
                                        action={async () => {
                                            "use server";
                                            await deleteCreditCard(card.id);
                                        }}
                                    >
                                        <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </form>
                                </div>
                            </CardFooter>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
