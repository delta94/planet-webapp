/**
 * This is a singleton to ensure we only instantiate Stripe once.
 */
import { Stripe, loadStripe } from '@stripe/stripe-js';

let stripePromise: Promise<Stripe | null>;
const getStripe = (locale) => {
  if (!stripePromise) {
    console.log('locale:' + locale);
    stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!, { locale: locale });
  }
  return stripePromise;
};

export default getStripe;
