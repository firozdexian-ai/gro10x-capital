import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Init Supabase admin/anon client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://teujfcjoyxzmsyoyxfcy.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, phone, investmentRange, meetingPref, sourcePage } = body;

    // 1. Fetch configured Telegram Chat ID from platform_settings
    const { data: settingData } = await supabase
      .from('platform_settings')
      .select('setting_value')
      .eq('setting_key', 'owner_telegram_chat_id')
      .single();

    const telegramChatId = settingData?.setting_value;

    // If Telegram Chat ID is configured, dispatch notification
    if (telegramChatId) {
      const botToken = process.env.TELEGRAM_BOT_TOKEN || '7891234567:AAFakeTokenForGRO10XBotAlerts'; // Fallback token format
      
      const messageText = `🔔 *New GRO10X Investment Lead*\n\n` +
        `👤 *Name:* ${name}\n` +
        `📱 *Phone:* ${phone}\n` +
        `💰 *Budget Range:* ${investmentRange || 'N/A'}\n` +
        `📍 *Preference:* ${meetingPref || 'Online Call'}\n` +
        `🌐 *Source:* ${sourcePage || 'Website'}\n` +
        `🕐 *Time:* ${new Date().toLocaleString('en-US', { timeZone: 'Asia/Dhaka' })}`;

      await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: telegramChatId,
          text: messageText,
          parse_mode: 'Markdown'
        })
      }).catch(err => console.error('Telegram Bot API call error:', err));
    }

    return NextResponse.json({ success: true, message: 'Lead recorded and notification sent' });
  } catch (err) {
    console.error('Submit Lead API error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
