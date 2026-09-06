"use client";

import { useState } from "react";
import { CheckCircle, X, Banknote, Calendar, DollarSign, Check, Info, ShieldCheck } from "lucide-react";
import { CreditCard } from "@prisma/client";

import { markCardAsPaid, undoMarkCardAsPaid } from "@/app/actions/credit-cards";
import { Button } from "@/components/ui/button";
import { Status, StatusIndicator, StatusLabel } from "@/components/ui/shadcn-io/status";
import { toast } from "sonner";
import { ShareCardDialog } from "@/components/share-card-dialog";
import {
    Card,
    CardContent,
} from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
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
import { CREDIT_CARD_PRESETS, getCardPreset, MONTHS, getMonthName } from "@/lib/constants/card-presets";

interface CreditCardItemProps {
    card: CreditCard & { sharedByEmail?: string | null };
    isEditMode: boolean;
    onUpdate?: (id: string, field: keyof CreditCard, value: string | number | boolean | null | undefined) => void;
    onDelete?: (id: string) => void;
}

export function CreditCardItem({ card, isEditMode, onUpdate, onDelete }: CreditCardItemProps) {
    const isShared = !!card.sharedByEmail;
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const preset = getCardPreset(card.cardType);

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

                <CardContent className="flex-1 space-y-3 px-5 py-3">
                    {isShared && (
                        <div className="text-xs text-muted-foreground italic mb-1">
                            Shared by {card.sharedByEmail}
                        </div>
                    )}

                    {/* Card Type Selection */}
                    <div className="space-y-1">
                        <Label htmlFor={`cardType-${card.id}`} className="text-xs font-medium">Card Type</Label>
                        <Select
                            value={card.cardType || "custom"}
                            onValueChange={(val) => {
                                const newType = val === "custom" ? null : val;
                                onUpdate?.(card.id, "cardType", newType);
                                if (newType) {
                                    const selectedPreset = getCardPreset(newType);
                                    if (selectedPreset && (!card.name || CREDIT_CARD_PRESETS.some(p => p.fullName === card.name || p.shortName === card.name))) {
                                        onUpdate?.(card.id, "name", selectedPreset.fullName);
                                    }
                                }
                            }}
                            disabled={isShared}
                        >
                            <SelectTrigger id={`cardType-${card.id}`} className="h-8 text-xs">
                                <SelectValue placeholder="Select card preset" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="custom" className="text-xs">
                                    Custom / Other Card
                                </SelectItem>
                                {CREDIT_CARD_PRESETS.map((p) => (
                                    <SelectItem key={p.id} value={p.id} className="text-xs">
                                        {p.fullName}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

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

                    {/* Annual Fee Month Selection */}
                    <div className="space-y-1">
                        <Label htmlFor={`annualFeeMonth-${card.id}`} className="text-xs">Annual Fee Month</Label>
                        <Select
                            value={card.annualFeeMonth?.toString() || "none"}
                            onValueChange={(val) => onUpdate?.(card.id, "annualFeeMonth", val === "none" ? null : Number(val))}
                            disabled={isShared}
                        >
                            <SelectTrigger id={`annualFeeMonth-${card.id}`} className="h-8 text-xs">
                                <SelectValue placeholder="Select annual fee month" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none" className="text-xs">
                                    None / Not set
                                </SelectItem>
                                {MONTHS.map((m) => (
                                    <SelectItem key={m.value} value={m.value.toString()} className="text-xs">
                                        {m.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
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
            </Card>
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

    const feeMonthName = getMonthName(card.annualFeeMonth);

    return (
        <>
            <Card
                onClick={() => setIsDetailsOpen(true)}
                className="flex flex-col h-full cursor-pointer hover:border-primary/50 hover:shadow-sm transition-all active:scale-[0.99]"
            >
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
                    <div className="flex flex-col gap-2 items-end" onClick={(e) => e.stopPropagation()}>
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

            {/* Benefits & Card Details Modal */}
            <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
                <DialogContent className="sm:max-w-[540px] max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold flex items-center gap-2">
                            {preset ? preset.fullName : card.name}
                        </DialogTitle>
                        <DialogDescription>
                            Due on the {card.dueDay}{getOrdinalSuffix(card.dueDay)} of every month • {isPaid ? "Paid for this cycle" : "Payment pending"}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 pt-2">
                        {/* Fee & Month Summary Grid */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="flex flex-col p-3 rounded-lg border bg-muted/30">
                                <span className="text-xs text-muted-foreground flex items-center gap-1 font-medium mb-1">
                                    <DollarSign className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                                    Annual Fee
                                </span>
                                <span className="text-base font-semibold">
                                    {preset ? preset.annualFeeDisplay : "N/A"}
                                </span>
                            </div>

                            <div className="flex flex-col p-3 rounded-lg border bg-muted/30">
                                <span className="text-xs text-muted-foreground flex items-center gap-1 font-medium mb-1">
                                    <Calendar className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                                    Annual Fee Month
                                </span>
                                <span className="text-base font-semibold">
                                    {feeMonthName ? `${feeMonthName} (Due on the ${card.dueDay}${getOrdinalSuffix(card.dueDay)})` : "Not set"}
                                </span>
                            </div>
                        </div>

                        {/* Notes if present */}
                        {card.notes && (
                            <div className="p-3 rounded-lg border bg-background space-y-1">
                                <span className="text-xs font-semibold text-muted-foreground">Notes</span>
                                <p className="text-sm text-foreground">{card.notes}</p>
                            </div>
                        )}

                        {/* Benefits Section */}
                        {preset ? (
                            <div className="space-y-3 pt-1">
                                <h4 className="text-sm font-semibold flex items-center gap-1.5 text-foreground">
                                    <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                    Card Benefits & Perks
                                </h4>
                                <ul className="space-y-2.5">
                                    {preset.benefits.map((benefit, index) => (
                                        <li key={index} className="flex items-start gap-2.5 text-xs sm:text-sm leading-relaxed text-muted-foreground">
                                            <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                                            <span>{benefit}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ) : (
                            <div className="flex items-start gap-3 p-4 rounded-lg border bg-muted/20 text-muted-foreground text-xs leading-relaxed">
                                <Info className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                                <div>
                                    <span className="font-semibold text-foreground block mb-0.5">No Card Preset Selected</span>
                                    Click the Edit (pencil) button on the main page to select a card preset (such as The Platinum Card® from American Express, Chase Sapphire Preferred®, etc.) to view its full benefits.
                                </div>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
