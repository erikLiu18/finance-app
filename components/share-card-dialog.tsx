"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Share2, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { shareCreditCard, unshareCreditCard, getCardSharedUsers } from "@/app/actions/credit-cards";

interface ShareCardDialogProps {
    cardId: string;
    cardName: string;
}

interface SharedUser {
    id: string;
    email: string;
}

export function ShareCardDialog({ cardId, cardName }: ShareCardDialogProps) {
    const [open, setOpen] = useState(false);
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [sharedUsers, setSharedUsers] = useState<SharedUser[]>([]);
    const [isFetchingUsers, setIsFetchingUsers] = useState(false);

    useEffect(() => {
        if (open) {
            fetchSharedUsers();
        }
    }, [open, cardId]);

    const fetchSharedUsers = async () => {
        setIsFetchingUsers(true);
        try {
            const users = await getCardSharedUsers(cardId);
            setSharedUsers(users);
        } catch (error) {
            console.error("Failed to fetch shared users", error);
        } finally {
            setIsFetchingUsers(false);
        }
    };

    const handleShare = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setIsLoading(true);
        try {
            await shareCreditCard(cardId, email);
            toast.success(`Shared ${cardName} with ${email}`);
            setEmail("");
            fetchSharedUsers(); // Refresh list
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to share card");
        } finally {
            setIsLoading(false);
        }
    };

    const handleUnshare = async (userId: string) => {
        try {
            await unshareCreditCard(cardId, userId);
            toast.success("Stopped sharing card");
            setSharedUsers(prev => prev.filter(u => u.id !== userId));
        } catch (error) {
            toast.error("Failed to unshare card");
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="icon" title="Share Card">
                    <Share2 className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Share {cardName}</DialogTitle>
                    <DialogDescription>
                        Share this card with another user by their email address. They will be able to view the card details.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleShare} className="flex items-end gap-2 my-4">
                    <div className="grid gap-1 w-full">
                        <Label htmlFor="email" className="sr-only">Email address</Label>
                        <Input
                            id="email"
                            placeholder="user@example.com"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <Button type="submit" disabled={isLoading || !email}>
                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Share"}
                    </Button>
                </form>

                <div className="space-y-4">
                    <h4 className="text-sm font-medium">Shared with</h4>
                    {isFetchingUsers ? (
                        <div className="flex justify-center py-4">
                            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                        </div>
                    ) : sharedUsers.length === 0 ? (
                        <p className="text-sm text-muted-foreground">Not shared with anyone yet.</p>
                    ) : (
                        <div className="space-y-2">
                            {sharedUsers.map(user => (
                                <div key={user.id} className="flex items-center justify-between text-sm border p-2 rounded-md">
                                    <span>{user.email}</span>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                        onClick={() => handleUnshare(user.id)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                        <span className="sr-only">Remove</span>
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
