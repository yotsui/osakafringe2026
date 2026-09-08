import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { COOKIE_NAME } from '../../lib/authCrypto.ts';

export const dynamic = 'force-dynamic';

export default async function LogoutPage() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
  redirect('/password?loggedOut=1');
}
