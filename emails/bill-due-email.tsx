import {
    Body,
    Button,
    Container,
    Head,
    Heading,
    Html,
    Preview,
    Section,
    Text,
} from "@react-email/components";
import * as React from "react";

interface BillDueEmailProps {
    cardName: string;
    dueDate: string;
    amount?: string;
    userName?: string;
}

export const BillDueEmail = ({
    cardName,
    dueDate,
    amount,
    userName,
}: BillDueEmailProps) => {
    const previewText = `Bill Due Reminder: ${cardName}`;

    return (
        <Html>
            <Head />
            <Preview>{previewText}</Preview>
            <Body style={main}>
                <Container style={container}>
                    <Heading style={h1}>Bill Due Reminder</Heading>
                    <Text style={text}>
                        Hi {userName || "there"},
                    </Text>
                    <Text style={text}>
                        This is a reminder that your bill for <strong>{cardName}</strong> is due on{" "}
                        <strong>{dueDate}</strong>.
                    </Text>
                    {amount && (
                        <Text style={text}>
                            Amount Due: <strong>{amount}</strong>
                        </Text>
                    )}
                    <Section style={btnContainer}>
                        <Button style={button} href="https://finance.erik.io">
                            View Dashboard
                        </Button>
                    </Section>
                    <Text style={footer}>
                        Securely powered by your Personal Finance App.
                    </Text>
                </Container>
            </Body>
        </Html>
    );
};

export default BillDueEmail;

const main = {
    backgroundColor: "#ffffff",
    fontFamily:
        '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
    margin: "0 auto",
    padding: "20px 0 48px",
    maxWidth: "560px",
};

const h1 = {
    fontSize: "24px",
    fontWeight: "600",
    lineHeight: "1.25",
    color: "#1a1a1a",
    marginBottom: "24px",
};

const text = {
    fontSize: "16px",
    lineHeight: "26px",
    color: "#4a4a4a",
    marginBottom: "16px",
};

const btnContainer = {
    textAlign: "center" as const,
    marginTop: "32px",
    marginBottom: "32px",
};

const button = {
    backgroundColor: "#000000",
    borderRadius: "6px",
    color: "#ffffff",
    fontSize: "16px",
    fontWeight: "600",
    textDecoration: "none",
    textAlign: "center" as const,
    display: "block",
    padding: "12px 24px",
};

const footer = {
    fontSize: "12px",
    lineHeight: "24px",
    color: "#8898aa",
    marginTop: "48px",
};
