import { createClient } from '@/utils/supabase/server';
import {
  getProducts,
  getSubscription,
  getUser
} from '../../utils/supabase/queries';
import { cookies } from 'next/headers';
import { User } from '@supabase/supabase-js';
import PricingRounded from './pricing-rounded';

export default async function PricingPage() {
  const supabase = createClient({ cookies });
  const [user, products] = await Promise.all([
    getUser(),
    getProducts(supabase),
  ]);

  const subscription = user ? await getSubscription(supabase, user.id) : null;

  return (
    <PricingRounded
      user={user as User | null}
      products={products ?? []}
      subscription={subscription}
    />
  );
}
