import User from "@/models/User";
import dbConnect from "./dbConnect";

/**
 * Checks if a user has an active subscription or trial.
 * If a trial has expired, updates the user's status to 'expired'.
 * @param {string} userId - The ID of the user to check.
 * @returns {Promise<{isActive: boolean, user: any}>} - Returns whether the subscription is active and the updated user object.
 */
export async function checkSubscriptionStatus(userId) {
  await dbConnect();
  const user = await User.findById(userId);

  if (!user) {
    return { isActive: false, user: null };
  }

  const now = new Date();

  // Handle trialing status
  if (user.subscriptionStatus === 'trialing') {
    if (user.trialEndDate && now > new Date(user.trialEndDate)) {
      user.subscriptionStatus = 'expired';
      await user.save();
    }
  }

  // Handle active (paid) status expiration if needed 
  // (Assuming Stripe webhooks handle 'active' status, but we can add a fallback here)
  if (user.subscriptionStatus === 'active') {
    if (user.subscriptionEndDate && now > new Date(user.subscriptionEndDate)) {
      user.subscriptionStatus = 'expired';
      await user.save();
    }
  }

  const isActive = user.subscriptionStatus === 'active' || user.subscriptionStatus === 'trialing';

  return { isActive, user };
}
