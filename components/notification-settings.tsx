"use client";

import { useState } from "react";
import { NotificationAlert } from "@prisma/client";
import { createNotificationAlert, deleteNotificationAlert } from "@/app/actions/credit-cards";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Trash2, Plus } from "lucide-react";
import { Label } from "@/components/ui/label";

interface NotificationSettingsProps {
    initialAlerts: NotificationAlert[];
}

export function NotificationSettings({ initialAlerts }: NotificationSettingsProps) {
    const [hours, setHours] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        const val = Number(hours);
        if (val >= 1 && val <= 24) {
            setIsSubmitting(true);
            try {
                await createNotificationAlert(val);
                setHours("");
            } catch (error) {
                console.error(error);
                alert("Failed to add alert. Ensure it's not a duplicate and you have less than 5 alerts.");
            } finally {
                setIsSubmitting(false);
            }
        } else {
            alert("Please enter a value between 1 and 24");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this alert?")) return;
        try {
            await deleteNotificationAlert(id);
        } catch (error) {
            console.error(error);
            alert("Failed to delete alert");
        }
    };

    return (
        <Card className="h-fit">
            <CardHeader>
                <CardTitle>Notification Alerts</CardTitle>
                <CardDescription>
                    Set up to 5 alerts. Notifications are sent N hours before the due time (5 PM ET).
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <form onSubmit={handleAdd} className="flex gap-2 items-end">
                    <div className="grid w-full items-center gap-1.5">
                        <Label htmlFor="hours">Hours Before (5 PM ET)</Label>
                        <Input
                            id="hours"
                            type="number"
                            min="1"
                            max="24"
                            placeholder="e.g. 24"
                            value={hours}
                            onChange={(e) => setHours(e.target.value)}
                        />
                    </div>
                    <Button type="submit" disabled={isSubmitting || !hours}>
                        <Plus className="h-4 w-4" />
                    </Button>
                </form>

                <div className="space-y-2">
                    <h4 className="text-sm font-medium">Your Alerts</h4>
                    {initialAlerts.length === 0 && (
                        <p className="text-sm text-muted-foreground">No alerts set.</p>
                    )}
                    <div className="flex flex-col gap-2">
                        {initialAlerts.map((alert) => (
                            <div
                                key={alert.id}
                                className="flex items-center justify-between rounded-md border p-3 text-sm shadow-sm"
                            >
                                <span>
                                    {alert.hoursBefore} hour{alert.hoursBefore !== 1 && "s"} before
                                </span>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-destructive hover:bg-destructive/10"
                                    onClick={() => handleDelete(alert.id)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
