"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Pencil } from "lucide-react";

import { updateCreditCard } from "@/app/actions/credit-cards";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

const formSchema = z.object({
    name: z.string().min(1, "Name is required"),
    dueDay: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 1 && Number(val) <= 31, {
        message: "Must be between 1 and 31",
    }),
    notifyEmail: z.boolean().default(false),
    notifySms: z.boolean().default(false),
    daysBefore: z.coerce.number().min(0).max(10).default(3),
    hoursBefore: z.coerce.number().min(0).max(23).default(0),
});

interface EditCardDialogProps {
    card: {
        id: string;
        name: string;
        dueDay: number;
        notifyEmail: boolean;
        notifySms: boolean;
        notifyDaysBefore: number;
        notifyHoursBefore: number;
    };
}

export function EditCardDialog({ card }: EditCardDialogProps) {
    const [open, setOpen] = useState(false);
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema) as any,
        defaultValues: {
            name: card.name,
            dueDay: card.dueDay.toString(),
            notifyEmail: card.notifyEmail,
            notifySms: card.notifySms,
            daysBefore: card.notifyDaysBefore,
            hoursBefore: card.notifyHoursBefore,
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            await updateCreditCard(card.id, {
                ...values,
                dueDay: Number(values.dueDay),
            });
            setOpen(false);
            alert("Card updated successfully!");
        } catch (error) {
            console.error(error);
            alert("Failed to update card");
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon">
                    <Pencil className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Edit Credit Card</DialogTitle>
                    <DialogDescription>
                        Update your credit card details and notification preferences.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Card Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Chase Sapphire" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-3 gap-4">
                            <FormField
                                control={form.control}
                                name="dueDay"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Due Day</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select day" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                                                    <SelectItem key={day} value={day.toString()}>
                                                        {day}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="daysBefore"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Days Before</FormLabel>
                                        <FormControl>
                                            <Input type="number" min="0" max="10" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="hoursBefore"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Hours Before</FormLabel>
                                        <FormControl>
                                            <Input type="number" min="0" max="23" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="notifyEmail"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                    <div className="space-y-0.5">
                                        <FormLabel>Email Alerts</FormLabel>
                                        <FormDescription>Receive email notifications.</FormDescription>
                                    </div>
                                    <FormControl>
                                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="notifySms"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                    <div className="space-y-0.5">
                                        <FormLabel>SMS Alerts</FormLabel>
                                        <FormDescription>Receive text messages.</FormDescription>
                                    </div>
                                    <FormControl>
                                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button type="submit">Update Card</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
