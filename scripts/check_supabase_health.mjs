import { createClient } from '@supabase/supabase-js';
import dns from 'node:dns/promises';
import fs from 'node:fs';
import path from 'node:path';

function loadEnv() {
  const envPath = path.resolve(process.cwd(), '.env.local');
  if (!fs.existsSync(envPath)) return {};
  const content = fs.readFileSync(envPath, 'utf8');
  const env = {};
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx !== -1) {
      env[trimmed.substring(0, eqIdx).trim()] = trimmed.substring(eqIdx + 1).trim();
    }
  }
  return env;
}

async function runHealthCheck() {
  console.log('\n========================================');
  console.log('   GRO10X SUPABASE HEALTH CHECK');
  console.log('========================================\n');

  const env = loadEnv();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !anonKey) {
    console.error('❌ FAIL: Supabase configuration missing in .env.local');
    process.exit(1);
  }

  let hostname = '';
  try {
    const parsed = new URL(supabaseUrl);
    hostname = parsed.hostname;
    console.log(`📡 Target Endpoint : ${supabaseUrl}`);
    console.log(`🌐 Hostname        : ${hostname}`);
  } catch (err) {
    console.error(`❌ FAIL: Invalid SUPABASE_URL: ${supabaseUrl}`);
    process.exit(1);
  }

  // 1. DNS Resolution Probe
  process.stdout.write('🔍 Probing DNS Resolution... ');
  try {
    const addresses = await dns.resolve4(hostname);
    console.log(`✅ OK (${addresses.join(', ')})`);
  } catch (err) {
    console.log(`❌ FAILED (${err.code || err.message})`);
    console.error('\n⚠️  DNS could not resolve the host. Your Supabase project is likely PAUSED/IDLE.');
    console.error('👉 Restore it at: https://supabase.com/dashboard/project/' + hostname.split('.')[0]);
    process.exit(1);
  }

  // 2. Auth Endpoint Probe
  process.stdout.write('🔐 Checking Auth Endpoint... ');
  try {
    const healthRes = await fetch(`${supabaseUrl}/auth/v1/health`, {
      headers: { apikey: anonKey }
    });
    if (healthRes.ok) {
      console.log(`✅ OK (HTTP ${healthRes.status})`);
    } else {
      console.log(`⚠️ HTTP ${healthRes.status}`);
    }
  } catch (err) {
    console.log(`❌ FAILED: ${err.message}`);
  }

  // 3. Database Table Probes
  console.log('\n📊 Checking Database Tables:');
  const supabase = createClient(supabaseUrl, anonKey);
  const tables = ['funding_projects', 'businesses', 'investors', 'work_orders', 'user_roles'];

  for (const table of tables) {
    process.stdout.write(`   - public.${table.padEnd(18)} : `);
    try {
      const { data, count, error, status } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });

      if (error) {
        if (error.code === 'PGRST205' || error.message?.includes('schema cache')) {
          console.log(`⚠️ Not found in schema`);
        } else {
          console.log(`❌ Error: ${error.message} (code ${error.code})`);
        }
      } else {
        console.log(`✅ Healthy (Count: ${count ?? 0})`);
      }
    } catch (err) {
      console.log(`❌ Query failed: ${err.message}`);
    }
  }

  console.log('\n🎉 ALL SYSTEMS OPERATIONAL! Supabase connection is healthy.\n');
}

runHealthCheck().catch(err => {
  console.error('\n❌ Unexpected error during health check:', err);
  process.exit(1);
});
