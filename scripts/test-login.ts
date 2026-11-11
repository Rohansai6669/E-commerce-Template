import { createClient } from '@supabase/supabase-js';
import { loadEnvConfig } from '@next/env';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { profiles } from '../src/lib/db/schema/auth';
import { eq } from 'drizzle-orm';

loadEnvConfig(process.cwd());

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const databaseUrl = process.env.DATABASE_URL!;

const email = 'rohansai280604@gmail.com';
const password = '12345678';

async function testAuth() {
  console.log('Testing auth for:', email);
  const client = createClient(supabaseUrl, anonKey);
  const adminClient = createClient(supabaseUrl, serviceKey);

  // Try signing in
  let { data, error } = await client.auth.signInWithPassword({ email, password });
  
  if (error) {
    console.log('Sign in check:', error.message);
    const { data: users } = await adminClient.auth.admin.listUsers();
    const found = users?.users?.find(u => u.email === email);
    
    if (found) {
      console.log('User exists in Supabase Auth:', found.id, 'Updating password...');
      await adminClient.auth.admin.updateUserById(found.id, { password, email_confirm: true });
    } else {
      console.log('User not found. Creating user in Supabase Auth...');
      const { data: newUser, error: createErr } = await adminClient.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name: 'Rohan Sai' }
      });
      if (createErr) {
        console.error('Failed to create user in auth:', createErr);
        return;
      }
      console.log('Created user in Supabase Auth:', newUser.user.id);
    }

    // Try signing in again
    const retry = await client.auth.signInWithPassword({ email, password });
    if (retry.error) {
      console.error('Retry sign in failed:', retry.error.message);
      return;
    }
    data = retry.data;
  }

  console.log('✅ Supabase Auth sign-in successful! User ID:', data.user?.id);

  // Check / Upsert profile in Postgres database
  console.log('Checking database profile role in Postgres...');
  const sqlClient = postgres(databaseUrl, { max: 1 });
  const db = drizzle(sqlClient);

  try {
    const [existingProfile] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.email, email))
      .limit(1);

    if (existingProfile) {
      console.log('Existing profile found. Current role:', existingProfile.role);
      if (existingProfile.role !== 'admin') {
        console.log('Elevating profile to admin...');
        await db
          .update(profiles)
          .set({ role: 'admin' })
          .where(eq(profiles.id, existingProfile.id));
        console.log('✅ Elevated profile to admin!');
      } else {
        console.log('✅ User already has admin role!');
      }
    } else if (data.user) {
      console.log('Profile not found in database. Creating admin profile...');
      await db.insert(profiles).values({
        id: data.user.id,
        email,
        fullName: 'Rohan Sai',
        role: 'admin',
      });
      console.log('✅ Created admin profile!');
    }
  } catch (dbErr) {
    console.error('Database profile check error:', dbErr);
  } finally {
    await sqlClient.end();
  }
}

testAuth().catch(console.error);

