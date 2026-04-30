import { NextResponse } from "next/server";
import Stripe from "stripe";
import User from "@/models/User";
import dbConnect from "@/lib/dbConnect.js";
import { getUserFromToken } from "@/lib/auth";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

dbConnect();

const PLAN_DETAILS = {
  plan_7days: {
    name: "Quick Kickstart (7 Days)",
    amount: 5000, // 50.00 INR (Stripe uses smallest currency unit)
    interval: 'day',
    interval_count: 7
  },
  plan_1month: {
    name: "Monthly Goal-Getter",
    amount: 10000, // 100.00 INR
    interval: 'month',
    interval_count: 1
  },
  plan_1year: {
    name: "Annual Legend",
    amount: 100000, // 1000.00 INR
    interval: 'year',
    interval_count: 1
  }
};

export async function POST(request) {
    try {
        const decoded = await getUserFromToken(request);
        const userId = decoded?.id;
        // console.log("user",decoded)
        const { planId } = await request.json();

        if (!PLAN_DETAILS[planId]) {
            return NextResponse.json({ error: "Invalid plan selected" }, { status: 400 });
        }

        const user = await User.findById(userId);
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // 1. Get or create Stripe Customer
        let customerId = user.stripeCustomerId;
        if (!customerId) {
            const customer = await stripe.customers.create({
                email: user.email,
                name: user.name,
                metadata: { userId: user._id.toString() }
            });
            customerId = customer.id;
            user.stripeCustomerId = customerId;
            await user.save();
        }

        // 2. Create Checkout Session
        const session = await stripe.checkout.sessions.create({
            customer: customerId,
            line_items: [
                {
                    price_data: {
                        currency: 'inr',
                        product_data: {
                            name: PLAN_DETAILS[planId].name,
                            description: `Subscription for ${PLAN_DETAILS[planId].interval_count} ${PLAN_DETAILS[planId].interval}(s)`,
                        },
                        unit_amount: PLAN_DETAILS[planId].amount,
                        recurring: {
                            interval: PLAN_DETAILS[planId].interval,
                            interval_count: PLAN_DETAILS[planId].interval_count,
                        },
                    },
                    quantity: 1,
                },
            ],
            mode: 'subscription',
            success_url: `${process.env.NEXT_PUBLIC_DOMAIN}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.NEXT_PUBLIC_DOMAIN}/pricing`,
            metadata: {
                userId: user._id.toString(),
                planId: planId
            }
        });

        return NextResponse.json({ url: session.url });

    } catch (error) {
        console.error("Stripe Error:", error);
        return NextResponse.json({ error: "Could not create checkout session" }, { status: 500 });
    }
}
