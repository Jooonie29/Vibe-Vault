"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";

const RESEND_API_URL = "https://api.resend.com/emails";

// TODO: Configure these or pull from environment variables/database
// For free tier, you must send FROM "onboarding@resend.dev" to your verified email.
// Once you add a domain, you can change this.
const SENDER_EMAIL = "onboarding@resend.dev";
const SENDER_NAME = "Vault Vibe";

export const sendWelcomeEmail = action({
    args: {
        email: v.string(),
        name: v.string(),
    },
    handler: async (ctx, args) => {
        const apiKey = process.env.RESEND_API_KEY;

        if (!apiKey) {
            console.error("RESEND_API_KEY is not set. Cannot send welcome email.");
            return { success: false, error: "Configuration missing" };
        }

        const response = await fetch(RESEND_API_URL, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                from: `${SENDER_NAME} <${SENDER_EMAIL}>`,
                to: [args.email],
                subject: "Welcome to Vault Vibe!",
                html: `
          <h1>Welcome to Vault Vibe, ${args.name}!</h1>
          <p>We are thrilled to have you on board.</p>
          <p>Start capturing your inspiration and organizing your digital life today.</p>
          <br/>
          <p>Best,</p>
          <p>The Vault Vibe Team</p>
        `,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Failed to send email via Resend: ${response.status} ${errorText}`);
            return { success: false, error: errorText };
        }

        const data = await response.json();
        return { success: true, id: data.id };
    },
});
