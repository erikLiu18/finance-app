"use client";

import { CheckCircle, X, Banknote } from "lucide-react";
import { CreditCard } from "@prisma/client";

import { markCardAsPaid, undoMarkCardAsPaid } from "@/app/actions/credit-cards";
import { Button } from "@/components/ui/button";
import { Status, StatusIndicator, StatusLabel } from "@/components/ui/shadcn-io/status";
import { toast } from "sonner";
import { ShareCardDialog } from "@/components/share-card-dialog";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface CreditCardItemProps {
    card: CreditCard & { sharedByEmail?: string | null };
    isEditMode: boolean;
    onUpdate?: (id: string, field: keyof CreditCard, value: any) => void;
    onDelete?: (id: string) => void;
}

export function CreditCardItem({ card, isEditMode, onUpdate, onDelete }: CreditCardItemProps) {
    const isShared = !!card.sharedByEmail;

    if (isEditMode) {
        return (
            <Card className="flex flex-col gap-0 py-3 border-dashed border-2 border-primary/20 bg-muted/10 relative overflow-visible">
                <Button
                    variant="destructive"
                    size="icon"
                    className={isShared ? "hidden" : "absolute -top-2 -right-2 h-6 w-6 rounded-full shadow-md z-10"}
                    onClick={() => onDelete?.(card.id)}
                    type="button"
                    disabled={isShared}
                >
                    <X className="h-3 w-3" />
                </Button>

                <CardContent className="flex-1 space-y-2 px-5 py-3">
                    {isShared && (
                        <div className="text-xs text-muted-foreground italic mb-1">
                            Shared by {card.sharedByEmail}
                        </div>
                    )}
                    <div className="flex gap-2">
                        <div className="space-y-1 flex-1">
                            <Label htmlFor={`name-${card.id}`} className="text-xs">Card Name</Label>
                            <Input
                                id={`name-${card.id}`}
                                value={card.name}
                                onChange={(e) => onUpdate?.(card.id, "name", e.target.value)}
                                className="h-8"
                                disabled={isShared}
                            />
                        </div>

                        <div className="space-y-1 w-20">
                            <Label className="text-xs">Due Day</Label>
                            <Select
                                value={card.dueDay.toString()}
                                onValueChange={(val) => onUpdate?.(card.id, "dueDay", Number(val))}
                                disabled={isShared}
                            >
                                <SelectTrigger className="h-8 px-2">
                                    <SelectValue placeholder="Due" />
                                </SelectTrigger>
                                <SelectContent>
                                    {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                                        <SelectItem key={day} value={day.toString()}>
                                            {day}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <Label htmlFor={`notes-${card.id}`} className="text-xs">Notes</Label>
                        <Input
                            id={`notes-${card.id}`}
                            value={card.notes || ""}
                            onChange={(e) => onUpdate?.(card.id, "notes", e.target.value.slice(0, 50))}
                            className="h-8"
                            placeholder="Add a note (max 50 chars)"
                            maxLength={50}
                            disabled={isShared}
                        />
                    </div>

                    <div className="flex flex-row items-center justify-between rounded-lg border p-2 shadow-sm bg-background">
                        <Label className="cursor-pointer text-xs" htmlFor={`email-${card.id}`}>Email Alerts</Label>
                        <Switch
                            id={`email-${card.id}`}
                            checked={card.notifyEmail}
                            onCheckedChange={(checked) => onUpdate?.(card.id, "notifyEmail", checked)}
                            className="scale-75 origin-right"
                            disabled={isShared}
                        />
                    </div>


                </CardContent>
            </Card >
        );
    }

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    // Due date is at 00:00:00 of the specified day
    let dueDate = new Date(currentYear, currentMonth, card.dueDay);
    // Deadline is the end of that day (effectively 00:00:00 of the next day)
    let deadline = new Date(currentYear, currentMonth, card.dueDay + 1);

    // If the deadline has passed, the due date is next month
    if (deadline < now) {
        dueDate = new Date(currentYear, currentMonth + 1, card.dueDay);
        deadline = new Date(currentYear, currentMonth + 1, card.dueDay + 1);
    }

    const diffTime = deadline.getTime() - now.getTime();
    const hoursRemaining = diffTime / (1000 * 60 * 60);

    let timeRemainingText = "";
    if (hoursRemaining < 24) {
        const h = Math.ceil(hoursRemaining);
        timeRemainingText = `${h} ${h === 1 ? "hour" : "hours"}`;
    } else {
        const d = Math.ceil(hoursRemaining / 24);
        timeRemainingText = `${d} ${d === 1 ? "day" : "days"}`;
    }

    const isPaid = card.lastPaidDueDate === `${dueDate.getFullYear()}-${(dueDate.getMonth() + 1).toString().padStart(2, "0")}-${dueDate.getDate().toString().padStart(2, "0")}`;

    const getOrdinalSuffix = (day: number) => {
        if (day > 3 && day < 21) return 'th';
        switch (day % 10) {
            case 1: return "st";
            case 2: return "nd";
            case 3: return "rd";
            default: return "th";
        }
    };

    const handleMarkAsPaid = () => {
        toast.promise(markCardAsPaid(card.id), {
            loading: "Marking as paid...",
            success: "Card marked as paid",
            error: "Failed to mark as paid",
        });
    };

    const handleUndoMarkAsPaid = () => {
        toast.promise(undoMarkCardAsPaid(card.id), {
            loading: "Undoing...",
            success: "Mark as paid undone",
            error: "Failed to undo",
        });
    };

    return (
        <Card className="flex flex-col h-full">
            <CardContent className="flex flex-row justify-between items-start gap-4 p-5 h-full">
                {/* Left Column: Info & Alerts */}
                <div className="flex flex-col gap-3 flex-1">
                    <div className="space-y-1">
                        <h3 className="text-lg font-semibold leading-none tracking-tight">{card.name}</h3>
                        <p className="text-sm text-muted-foreground">
                            Due in {timeRemainingText} on the {card.dueDay}{getOrdinalSuffix(card.dueDay)}
                        </p>
                        {card.notes && (
                            <div className="text-sm text-primary font-medium mt-1">
                                {card.notes}
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-2 mt-auto">
                        <Status status={card.notifyEmail ? "online" : "offline"}>
                            <StatusIndicator />
                            <StatusLabel className="text-xs">Email</StatusLabel>
                        </Status>
                    </div>

                    {isShared && (
                        <div className="text-xs text-muted-foreground italic">
                            Shared by {card.sharedByEmail}
                        </div>
                    )}
                </div>

                {/* Right Column: Actions */}
                <div className="flex flex-col gap-2 items-end">
                    {isPaid ? (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-green-600 hover:text-green-700 hover:bg-green-100 dark:hover:bg-green-900/20 h-8 w-8"
                            onClick={handleUndoMarkAsPaid}
                            title="Mark as unpaid"
                        >
                            <CheckCircle className="h-5 w-5" />
                        </Button>
                    ) : (
                        !isShared && (
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={handleMarkAsPaid}
                                title="Mark as paid"
                                className="h-8 w-8"
                            >
                                <Banknote className="h-4 w-4" />
                            </Button>
                        )
                    )}

                    {!isShared && (
                        <div className="scale-90 origin-right">
                            <ShareCardDialog cardId={card.id} cardName={card.name} />
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
