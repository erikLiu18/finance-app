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
        annualFee: 895,
        annualFeeDisplay: "$895",
        benefits: [
            "5x Membership Rewards® points on flights booked directly with airlines or with American Express Travel (up to $500,000 per calendar year)",
            "5x Membership Rewards® points on prepaid hotels booked on amextravel.com",
            "$600 Annual Hotel Credit ($300 semi-annually on prepaid Fine Hotels + Resorts® or The Hotel Collection bookings)",
            "$400 Annual Resy Dining Credit (up to $100 per quarter for eligible Resy purchases)",
            "$300 Annual Digital Entertainment Credit (for eligible streaming & digital subscriptions)",
            "$300 Annual lululemon Credit for eligible purchases",
            "$200 Annual Airline Incidental Fee Credit with selected qualifying airline",
            "$200 Annual Uber Cash ($15/month plus $20 in December for US rides and orders) + Uber One credit",
            "$120 Global Entry or $85 TSA PreCheck® application fee credit every 4 years",
            "American Express Global Lounge Collection® (Access to 1,550+ lounges: Centurion Lounges, Priority Pass™, Delta Sky Club® when flying Delta)"
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
            "1.5% unlimited cash back on all other purchases",
            "Points can be pooled with premium Chase Ultimate Rewards® cards for travel partner transfers"
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
            "1% cash back on all other purchases",
            "Cell phone protection (up to $800 per claim) & no foreign transaction fees"
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
            "Unlimited Cashback Match: Discover automatically matches all the cash back earned at the end of your first year",
            "No foreign transaction fees & no annual fee"
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
            "First and second checked bags free on domestic Delta flights for you and companions on same reservation",
            "Up to $120 annual Rideshare Credit ($10/month on select U.S. rideshare providers after first card renewal)",
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
            "3x points on dining worldwide, gas stations & EV charging, vacation rentals (Airbnb, Vrbo), and select streaming & online groceries",
            "2x points on all other travel purchases",
            "Up to $100 Annual Chase Travel Hotel Credit each anniversary year",
            "Up to $120 Global Entry / TSA PreCheck / NEXUS fee credit every 4 years",
            "10% Anniversary points boost based on total annual card spending",
            "Complimentary 1-year Apple TV subscription & complimentary DashPass with $10/mo credit",
            "Auto Rental Collision Damage Waiver (primary coverage), Emergency Evacuation & Trip Cancellation Insurance"
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
