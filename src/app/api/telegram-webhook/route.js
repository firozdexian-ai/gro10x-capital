import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';

// Helper to normalise Bangladesh phone numbers for clean DB matching
function normalisePhone(phone) {
  if (!phone) return '';
  let cleaned = phone.replace(/[\s\-\+\(\)]/g, '');
  if (cleaned.startsWith('880')) {
    cleaned = '0' + cleaned.slice(3);
  }
  return cleaned;
}

// Format team types nicely
function formatTeamType(teamType, designation) {
  if (designation) return designation;
  switch (teamType) {
    case 'admin': return 'Platform Administrator';
    case 'manager': return 'Operations Manager';
    case 'kam': return 'Key Account Manager (KAM)';
    case 'promoter': return 'Growth Promoter';
    case 'support_backops': return 'Support & BackOps';
    default: return 'Team Member';
  }
}

// Map team_type to user_roles
function mapTeamTypeToRole(teamType) {
  if (teamType === 'promoter') return 'promoter';
  return 'admin';
}

// Send message via Telegram Bot API
async function sendTelegramMessage(botToken, chatId, text, replyMarkup = null) {
  if (!botToken) return;
  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
  const payload = {
    chat_id: chatId,
    text: text,
    parse_mode: 'HTML',
    ...(replyMarkup && { reply_markup: replyMarkup })
  };

  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  } catch (err) {
    console.error('Failed to send Telegram message:', err);
  }
}

// Telegram Webhook Handler (POST)
export async function POST(request) {
  try {
    const urlObj = new URL(request.url);
    const botKey = urlObj.searchParams.get('bot') || 'team';

    // Select token
    let botToken = process.env.TELEGRAM_TEAM_BOT_TOKEN;
    if (botKey === 'investor') botToken = process.env.TELEGRAM_INVESTOR_BOT_TOKEN;
    if (botKey === 'client') botToken = process.env.TELEGRAM_CLIENT_BOT_TOKEN;

    const body = await request.json();
    const message = body.message || {};
    const chat = message.chat || {};
    const text = (message.text || '').trim();
    const contact = message.contact || null;
    const chatId = chat.id;

    if (!chatId) {
      return NextResponse.json({ ok: true });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    // 1. HANDLE /start OR REQUEST FOR CONTACT
    if (text.startsWith('/start')) {
      const welcomeText = `👋 <b>Welcome to GRO10X OS!</b>\n\nTo verify your identity and receive your 4-digit temporary web access PIN, please tap the button below to share your registered phone number.`;
      
      const replyMarkup = {
        keyboard: [[{ text: '📱 Share Phone Number', request_contact: true }]],
        resize_keyboard: true,
        one_time_keyboard: true
      };

      await sendTelegramMessage(botToken, chatId, welcomeText, replyMarkup);
      return NextResponse.json({ ok: true });
    }

    // 2. HANDLE CONTACT SHARING
    if (contact && contact.phone_number) {
      const rawPhone = contact.phone_number;
      const cleanPhone = normalisePhone(rawPhone);

      let matchedUser = null;
      let userRole = 'admin';

      // A) Check public.team (Unified Internal Stakeholders)
      const { data: teamMembers } = await supabase.from('team').select('*');
      if (teamMembers && teamMembers.length > 0) {
        const found = teamMembers.find(t => normalisePhone(t.phone) === cleanPhone);
        if (found) {
          matchedUser = {
            name: found.full_name,
            title: formatTeamType(found.team_type, found.designation),
            email: found.email,
            phone: found.phone,
            id: found.id,
            table: 'team',
            teamType: found.team_type
          };
          userRole = mapTeamTypeToRole(found.team_type);
        }
      }

      // B) Check investors table if not found (For Investor Bot)
      if (!matchedUser) {
        const { data: invs } = await supabase.from('investors').select('*');
        if (invs && invs.length > 0) {
          const found = invs.find(i => normalisePhone(i.phone) === cleanPhone);
          if (found) {
            matchedUser = {
              name: found.alias_name || found.full_name,
              title: 'Accredited Investor',
              email: found.email,
              phone: found.phone,
              id: found.id,
              table: 'investors',
              teamType: 'investor'
            };
            userRole = 'investor';
          }
        }
      }

      // IF USER FOUND
      if (matchedUser) {
        // Generate 4-digit PIN
        const tempPin = Math.floor(1000 + Math.random() * 9000).toString();
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 mins

        // Store PIN
        await supabase.from('telegram_auth_pins').insert([{
          phone_number: matchedUser.phone || cleanPhone,
          telegram_chat_id: String(chatId),
          user_role: userRole,
          temp_pin: tempPin,
          pin_expires_at: expiresAt,
          is_verified: false,
          linked_entity_id: matchedUser.id
        }]);

        // Update Telegram Chat ID on team or investors table
        if (matchedUser.table === 'team') {
          await supabase.from('team').update({ telegram_chat_id: String(chatId) }).eq('id', matchedUser.id);
        } else if (matchedUser.table === 'investors') {
          await supabase.from('investors').update({ telegram_chat_id: String(chatId) }).eq('id', matchedUser.id);
        }

        const identifier = matchedUser.email || matchedUser.phone;
        const onboardUrl = `${appUrl}/auth?onboard=1&id=${encodeURIComponent(identifier)}`;

        const successText = `Welcome <b>${matchedUser.name}</b> 👋\n<b>${matchedUser.title}</b> | GRO10X OS\n\nI am your Management AI Colleague 🤖\n\nTo complete your system registration and set up your web access, visit:\n🔗 <a href="${onboardUrl}">${onboardUrl}</a>\n\n🔑 <b>Temporary 4-Digit PIN:</b> <code>${tempPin}</code>\n\n<i>(This PIN expires in 15 minutes)</i>`;

        // Hide custom keyboard
        const removeKeyboard = { remove_keyboard: true };

        await sendTelegramMessage(botToken, chatId, successText, removeKeyboard);
        return NextResponse.json({ ok: true });
      } else {
        // NOT FOUND
        const notFoundText = `⚠️ <b>Verification Failed</b>\n\nThe phone number <code>${rawPhone}</code> is not registered in GRO10X OS.\n\nPlease contact your platform administrator to pre-register your account details first.`;
        const removeKeyboard = { remove_keyboard: true };

        await sendTelegramMessage(botToken, chatId, notFoundText, removeKeyboard);
        return NextResponse.json({ ok: true });
      }
    }

    // Default response for other messages
    const defaultText = `🤖 <b>GRO10X OS Bot Command Center</b>\n\nType /start to initiate identity verification or request a 4-digit web access PIN.`;
    await sendTelegramMessage(botToken, chatId, defaultText);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Telegram Webhook error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
