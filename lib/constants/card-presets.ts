export interface CardPreset {
    id: string;
    fullName: string;
    shortName: string;
    issuer: "American Express" | "Chase" | "Discover";
    annualFee: number;
    annualFeeDisplay: string;
    benefits: string[];
}

export const CREDIT_CARD_PRESETS: CardPreset[] = [
    {
        id: "amex_platinum",
        fullName: "The Platinum Card® from American Express",
        shortName: "Amex Platinum",
        issuer: "American Express",
        annualFee: 695,
        annualFeeDisplay: "$695",
        benefits: [
            "5x Membership Rewards® points on flights booked directly with airlines or with American Express Travel (up to $500,000 per calendar year)",
            "5x Membership Rewards® points on prepaid hotels booked on amextravel.com",
            "$200 Annual Hotel Credit (prepaid Fine Hotels + Resorts® or The Hotel Collection bookings)",
            "$240 Annual Digital Entertainment Credit (up to $20/month back on eligible subscriptions)",
            "$200 Annual Airline Incidental Fee Credit with selected qualifying airline",
            "$200 Annual Uber Cash ($15/month plus $35 in December for US rides and orders)",
            "$199 Annual CLEAR® Plus Credit",
            "$100 Annual Saks Fifth Avenue Credit (up to $50 semi-annually)",
            "American Express Global Lounge Collection® (Centurion Lounges, Priority Pass™, Delta Sky Club® when flying Delta)"
        ],
    },
    {
        id: "chase_freedom_unlimited",
        fullName: "Chase Freedom Unlimited®",
        shortName: "Freedom Unlimited",
        issuer: "Chase",
        annualFee: 0,
        annualFeeDisplay: "$0",
        benefits: [
            "5% cash back on travel purchased through Chase Travel",
            "3% cash back on dining at restaurants, including takeout and eligible delivery services",
            "3% cash back on drugstore purchases",
            "1.5% unlimited cash back on all other purchases"
        ],
    },
    {
        id: "chase_freedom_flex",
        fullName: "Chase Freedom Flex®",
        shortName: "Freedom Flex",
        issuer: "Chase",
        annualFee: 0,
        annualFeeDisplay: "$0",
        benefits: [
            "5% cash back on up to $1,500 in combined purchases in bonus categories each quarter (requires quarterly activation)",
            "5% cash back on travel purchased through Chase Travel",
            "3% cash back on dining at restaurants, including takeout and delivery",
            "3% cash back on drugstore purchases",
            "1% cash back on all other purchases"
        ],
    },
    {
        id: "discover_it_cash_back",
        fullName: "Discover it® Cash Back",
        shortName: "Discover It",
        issuer: "Discover",
        annualFee: 0,
        annualFeeDisplay: "$0",
        benefits: [
            "5% cash back on everyday purchases at different places each quarter up to the quarterly maximum (requires activation)",
            "1% unlimited cash back on all other purchases automatically",
            "Unlimited Cashback Match: Discover matches all the cash back you've earned at the end of your first year",
            "No foreign transaction fees"
        ],
    },
    {
        id: "delta_skymiles_gold_amex",
        fullName: "Delta SkyMiles® Gold American Express Card",
        shortName: "Amex Delta Gold",
        issuer: "American Express",
        annualFee: 150,
        annualFeeDisplay: "$150 ($0 intro annual fee for the first year)",
        benefits: [
            "2x miles on dining at restaurants worldwide, including takeout and delivery",
            "2x miles at U.S. supermarkets",
            "2x miles on Delta purchases",
            "First checked bag free on Delta flights for you and up to 8 companions on the same reservation",
            "TakeOff 15: 15% off when booking Award Travel on Delta flights using miles",
            "$200 Delta Flight Credit after spending $10,000 in purchases in a calendar year",
            "Main Cabin 1 Priority Boarding on Delta flights"
        ],
    },
    {
        id: "chase_sapphire_preferred",
        fullName: "Chase Sapphire Preferred® Card",
        shortName: "Sapphire Preferred",
        issuer: "Chase",
        annualFee: 95,
        annualFeeDisplay: "$95",
        benefits: [
            "5x total points on travel purchased through Chase Travel",
            "3x points on dining, select streaming services, and online grocery purchases (excluding Target, Walmart, and wholesale clubs)",
            "2x points on all other travel purchases",
            "$50 Annual Chase Travel Hotel Credit",
            "10% Anniversary points boost based on total annual card spending",
            "1:1 point transfers to leading airline and hotel loyalty programs",
            "Auto Rental Collision Damage Waiver (primary coverage) & Trip Cancellation/Interruption Insurance"
        ],
    },
];

export function getCardPreset(cardTypeId?: string | null): CardPreset | undefined {
    if (!cardTypeId) return undefined;
    return CREDIT_CARD_PRESETS.find((preset) => preset.id === cardTypeId);
}

export const MONTHS = [
    { value: 1, label: "January" },
    { value: 2, label: "February" },
    { value: 3, label: "March" },
    { value: 4, label: "April" },
    { value: 5, label: "May" },
    { value: 6, label: "June" },
    { value: 7, label: "July" },
    { value: 8, label: "August" },
    { value: 9, label: "September" },
    { value: 10, label: "October" },
    { value: 11, label: "November" },
    { value: 12, label: "December" },
];

export function getMonthName(monthNum?: number | null): string | null {
    if (!monthNum || monthNum < 1 || monthNum > 12) return null;
    return MONTHS[monthNum - 1]?.label ?? null;
}
