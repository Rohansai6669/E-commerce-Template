console.log('🔍 Checking environment variables...');

const requiredVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'SMTP_HOST',
  'SMTP_PORT',
  'SMTP_USERNAME',
  'SMTP_PASSWORD',
  'RESEND_API_KEY',
  'RAZORPAY_KEY',
  'RAZORPAY_SECRET',
];

let missing = false;

requiredVars.forEach((v) => {
  if (!process.env[v]) {
    console.error(`❌ Missing environment variable: ${v}`);
    missing = true;
  }
});

if (missing) {
  console.log('⚠️ Environment check failed. Please configure your .env.local file.');
  process.exit(1);
} else {
  console.log('✅ All environment variables are validated!');
  process.exit(0);
}
