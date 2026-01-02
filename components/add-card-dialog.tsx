"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Plus } from "lucide-react";

import { addCreditCard } from "@/app/actions/credit-cards";
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
// import { toast } from "sonner"; // Removed to avoid missing provider

const formSchema = z.object({
    name: z.string().min(1, "Name is required"),
    dueDay: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 1 && Number(val) <= 31, {
        message: "Must be between 1 and 31",
    }),
    notifyEmail: z.boolean().default(false),
    notifySms: z.boolean().default(false),
});

export function AddCardDialog() {
    const [open, setOpen] = useState(false);
    // Use Type assertion to avoid any if possible, or keep as any but disable lint line
    /* eslint-disable @typescript-eslint/no-explicit-any */
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema) as any,
        defaultValues: {
            name: "",
            dueDay: "1",
            notifyEmail: false,
            notifySms: false,
        },
    });
    /* eslint-enable @typescript-eslint/no-explicit-any */

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            await addCreditCard({
                ...values,
                dueDay: Number(values.dueDay),
            });
            setOpen(false);
            form.reset();
            alert("Card added successfully!");
        } catch (error) {
            console.error(error);
            alert("Failed to add card");
        }
    }

    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIsMounted(true);
    }, []);

    if (!isMounted) {
        return null;
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" /> Add Card
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add Credit Card</DialogTitle>
                    <DialogDescription>
                        Track a new credit card. Set notification timing in global settings.
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
                            name="notifyEmail"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                    <div className="space-y-0.5">
                                        <FormLabel>Email Alerts</FormLabel>
                                        <FormDescription>
                                            Receive email notifications.
                                        </FormDescription>
                                    </div>
                                    <FormControl>
                                        <Switch
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
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
                                        <FormDescription>
                                            Receive text messages.
                                        </FormDescription>
                                    </div>
                                    <FormControl>
                                        <Switch
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button type="submit">Save Card</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
