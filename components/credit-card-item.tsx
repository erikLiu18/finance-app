"use client";

import { CheckCircle, X } from "lucide-react";
import { CreditCard } from "@prisma/client";

import { markCardAsPaid, undoMarkCardAsPaid } from "@/app/actions/credit-cards";
import { Button } from "@/components/ui/button";
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

                    <div className="flex flex-row items-center justify-between rounded-lg border p-2 shadow-sm bg-background">
                        <Label className="cursor-pointer text-xs" htmlFor={`sms-${card.id}`}>SMS Alerts</Label>
                        <Switch
                            id={`sms-${card.id}`}
                            checked={card.notifySms}
                            onCheckedChange={(checked) => onUpdate?.(card.id, "notifySms", checked)}
                            className="scale-75 origin-right"
                        />
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="flex flex-col">
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
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 text-muted-foreground hover:text-foreground text-xs px-2"
                                    onClick={() => undoMarkCardAsPaid(card.id)}
                                >
                                    Undo
                                </Button>
                            </div>
                        );
                    } else {
                        return (
                            <Button
                                size="sm"
                                variant="outline"
                                className="h-8"
                                onClick={() => markCardAsPaid(card.id)}
                            >
                                Mark Paid
                            </Button>
                        );
                    }
                })()}
            </CardFooter>
        </Card>
    );
}
