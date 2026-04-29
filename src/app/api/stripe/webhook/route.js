import { NextResponse } from "next/server";
import Stripe from "stripe";
import User from "@/models/User";
import dbConnect from "@/lib/dbConnect.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

dbConnect();

export async function POST(request) {
    const payload = await request.text();
    const sig = request.headers.get("stripe-signature");

    let event;

    try {
        event = stripe.webhooks.constructEvent(payload, sig, endpointSecret);
    } catch (err) {
        console.error("Webhook Signature Verification Failed:", err.message);
        return NextResponse.json({ error: "Webhook Error" }, { status: 400 });
    }

    // Handle the event
    switch (event.type) {
        case "checkout.session.completed":
            const session = event.data.object;
            console.log("user",session)
            const userId = session.metadata.userId;
            const subscriptionId = session.subscription;

            // Get subscription details to find end date
            const subscription = await stripe.subscriptions.retrieve(subscriptionId);
            
            let endDate = new Date();
            if (subscription && subscription.current_period_end) {
                endDate = new Date(subscription.current_period_end * 1000);
            } else {
                console.log("Warning: current_period_end missing from Stripe subscription. Using 30-day fallback.");
                endDate.setDate(endDate.getDate() + 30);
            }
            
            const updatedUser = await User.findByIdAndUpdate(userId, {
                subscriptionStatus: 'active',
                subscriptionId: subscriptionId,
                stripeCustomerId: session.customer,
                subscriptionEndDate: endDate
            }, { new: true });

            console.log(`👤 User ${userId} updated to active. End date: ${updatedUser.subscriptionEndDate}`);
            break;

        case "invoice.paid":
            const invoice = event.data.object;
            if (invoice.subscription) {
                const sub = await stripe.subscriptions.retrieve(invoice.subscription);
                await User.findOneAndUpdate(
                    { stripeCustomerId: invoice.customer },
                    {
                        subscriptionStatus: 'active',
                        subscriptionEndDate: new Date(sub.current_period_end * 1000)
                    }
                );
            }
            break;

        case "customer.subscription.deleted":
            const subDeleted = event.data.object;
            await User.findOneAndUpdate(
                { stripeCustomerId: subDeleted.customer },
                {
                    subscriptionStatus: 'expired',
                    subscriptionEndDate: new Date()
                }
            );
            break;

        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    return NextResponse.json({ received: true });
}

// Next.js config to disable body parsing for raw payload
export const config = {
    api: {
        bodyParser: false,
    },
};
