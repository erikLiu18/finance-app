"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";
import { NotificationAlert } from "@prisma/client";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { NotificationSettingsContent } from "@/components/notification-settings";

interface MobileNotificationSettingsProps {
    alerts: NotificationAlert[];
}

export function MobileNotificationSettings({ alerts }: MobileNotificationSettingsProps) {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) {
        return null;
    }

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="md:hidden">
                    <Bell className="h-4 w-4" />
                </Button>
            </SheetTrigger>
            <SheetContent side="left">
                <SheetHeader className="mb-4">
                    <SheetTitle>Notification Settings</SheetTitle>
                    <SheetDescription>
                        Manage your alert preferences.
                    </SheetDescription>
                </SheetHeader>
                <div className="px-4">
                    <NotificationSettingsContent initialAlerts={alerts} />
                </div>
            </SheetContent>
        </Sheet>
    );
}
