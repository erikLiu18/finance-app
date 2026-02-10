import { getCreditCards, getNotificationAlerts, getSharedCreditCards } from "@/app/actions/credit-cards";

export const dynamic = "force-dynamic";
import { CreditCardsContent } from "@/components/credit-cards-content";

export default async function CreditCardsPage() {
    const creditCards = await getCreditCards();
    const sharedCards = await getSharedCreditCards();
    const alerts = await getNotificationAlerts();

    return <CreditCardsContent creditCards={creditCards} sharedCards={sharedCards} alerts={alerts} />;
}
