"use client";

import { CheckCircle, X, Banknote } from "lucide-react";
import { CreditCard } from "@prisma/client";

import { markCardAsPaid, undoMarkCardAsPaid } from "@/app/actions/credit-cards";
import { Button } from "@/components/ui/button";
import { Status, StatusIndicator, StatusLabel } from "@/components/ui/shadcn-io/status";
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
    card: CreditCard;
    isEditMode: boolean;
    onUpdate?: (id: string, field: keyof CreditCard, value: any) => void;
    onDelete?: (id: string) => void;
}

export function CreditCardItem({ card, isEditMode, onUpdate, onDelete }: CreditCardItemProps) {

    if (isEditMode) {
        return (
            <Card className="flex flex-col gap-0 py-3 border-dashed border-2 border-primary/20 bg-muted/10 relative overflow-visible">
                <Button
                    variant="destructive"
                    size="icon"
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full shadow-md z-10"
                    onClick={() => onDelete?.(card.id)}
                    type="button"
                >
                    <X className="h-3 w-3" />
                </Button>

                <CardContent className="flex-1 space-y-2 px-5 py-3">
                    <div className="flex gap-2">
                        <div className="space-y-1 flex-1">
                            <Label htmlFor={`name-${card.id}`} className="text-xs">Card Name</Label>
                            <Input
                                id={`name-${card.id}`}
                                value={card.name}
                                onChange={(e) => onUpdate?.(card.id, "name", e.target.value)}
                                className="h-8"
                            />
                        </div>

                        <div className="space-y-1 w-20">
                            <Label className="text-xs">Due Day</Label>
                            <Select
                                value={card.dueDay.toString()}
                                onValueChange={(val) => onUpdate?.(card.id, "dueDay", Number(val))}
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

                    <div className="flex flex-row items-center justify-between rounded-lg border p-2 shadow-sm bg-background">
                        <Label className="cursor-pointer text-xs" htmlFor={`email-${card.id}`}>Email Alerts</Label>
                        <Switch
                            id={`email-${card.id}`}
                            checked={card.notifyEmail}
                            onCheckedChange={(checked) => onUpdate?.(card.id, "notifyEmail", checked)}
                            className="scale-75 origin-right"
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

    const isPaid = card.lastPaidDueDate &&
        dueDate.toDateString() === card.lastPaidDueDate.toDateString();

    const getOrdinalSuffix = (day: number) => {
        if (day > 3 && day < 21) return 'th';
        switch (day % 10) {
            case 1: return "st";
            case 2: return "nd";
            case 3: return "rd";
            default: return "th";
        }
    };

    return (
        <Card className="flex flex-col gap-4">
            <CardHeader className="flex flex-row items-center justify-between pb-1 space-y-0">
                <div className="space-y-0">
                    <CardTitle className="text-lg">{card.name}</CardTitle>
                    <CardDescription>Due in {timeRemainingText} on the {card.dueDay}{getOrdinalSuffix(card.dueDay)}</CardDescription>
                </div>
                {isPaid ? (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-green-600 hover:text-green-700 hover:bg-green-100 dark:hover:bg-green-900/20"
                        onClick={() => undoMarkCardAsPaid(card.id)}
                    >
                        <CheckCircle className="h-5 w-5" />
                    </Button>
                ) : (
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => markCardAsPaid(card.id)}
                    >
                        <Banknote className="h-5 w-5" />
                    </Button>
                )}
            </CardHeader>
            <CardContent className="flex-1">
                <div className="flex flex-col gap-2 text-sm">
                    <div className="flex justify-start items-center h-8">
                        <Status status={card.notifyEmail ? "online" : "offline"}>
                            <StatusIndicator />
                            <StatusLabel>Email</StatusLabel>
                        </Status>
                    </div>

                </div>
            </CardContent>
        </Card>
    );
}
