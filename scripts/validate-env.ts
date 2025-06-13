import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables based on NODE_ENV
const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env.local';
config({ path: resolve(process.cwd(), envFile) });

const requiredEnvVars = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY',
  'CRON_SECRET_KEY',
  'SHUFFLE_API_URL'
];

function validateEnv() {
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.error('❌ Missing required environment variables:');
    missingVars.forEach(varName => console.error(`   - ${varName}`));
    process.exit(1);
  }

  // Validate Supabase URL format
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  if (!supabaseUrl?.startsWith('https://') || !supabaseUrl?.includes('.supabase.co')) {
    console.error('❌ Invalid VITE_SUPABASE_URL format');
    process.exit(1);
  }

  // Validate Supabase key format
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
  if (!supabaseKey?.startsWith('eyJ')) {
    console.error('❌ Invalid VITE_SUPABASE_ANON_KEY format');
    process.exit(1);
  }

  // Validate CRON_SECRET_KEY length
  const cronSecret = process.env.CRON_SECRET_KEY;
  if (!cronSecret || cronSecret.length < 16) {
    console.error('❌ CRON_SECRET_KEY must be at least 16 characters long');
    process.exit(1);
  }

  console.log('✅ All environment variables are valid');
}

validateEnv(); 