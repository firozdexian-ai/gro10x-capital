import { supabase } from '../../../../lib/supabase';

// Helper to normalise Bangladesh phone numbers
export function normalisePhone(phone) {
  if (!phone) return '';
  let cleaned = phone.replace(/[\s\-\+\(\)]/g, '');
  if (cleaned.startsWith('880')) {
    cleaned = '0' + cleaned.slice(3);
  }
  return cleaned;
}

// Format team types nicely
export function formatTeamType(teamType, designation) {
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
export function mapTeamTypeToRole(teamType) {
  if (teamType === 'promoter') return 'promoter';
  if (teamType === 'kam') return 'kam';
  return 'admin';
}

// Send message via Telegram Bot API
export async function sendTelegramMessage(botToken, chatId, text, replyMarkup = null) {
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

// Answer Callback Query
export async function answerCallbackQuery(botToken, callbackQueryId, text = '') {
  if (!botToken || !callbackQueryId) return;
  try {
    await fetch(`https://api.telegram.org/bot${botToken}/answerCallbackQuery`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        callback_query_id: callbackQueryId,
        text: text
      })
    });
  } catch (err) {
    console.error('Failed to answer callback query:', err);
  }
}

// Generate Role-Specific Inline Keyboard
export function getRoleMenuKeyboard(role, appUrl) {
  const miniAppUrl = `${appUrl}/team-miniapp`;

  if (role === 'admin' || role === 'manager') {
    return {
      inline_keyboard: [
        [
          { text: '💼 Open GRO10X Mini App ↗', web_app: { url: miniAppUrl } }
        ],
        [
          { text: '📊 Live KPIs', callback_data: 'cmd_kpis' },
          { text: '🔔 Action Alerts', callback_data: 'cmd_alerts' }
        ],
        [
          { text: '👥 Inquiry Leads', callback_data: 'cmd_leads' },
          { text: '💳 Payout Queue', callback_data: 'cmd_payouts' }
        ],
        [
          { text: '🔑 New Web PIN', callback_data: 'cmd_pin' },
          { text: '🌐 Admin Panel', url: `${appUrl}/admin` }
        ]
      ]
    };
  }

  if (role === 'kam') {
    return {
      inline_keyboard: [
        [
          { text: '💼 Open GRO10X Mini App ↗', web_app: { url: miniAppUrl } }
        ],
        [
          { text: '📁 My Portfolio', callback_data: 'cmd_portfolio' },
          { text: '🎫 Cash Tickets', callback_data: 'cmd_tickets' }
        ],
        [
          { text: '🔑 New Web PIN', callback_data: 'cmd_pin' },
          { text: '🌐 KAM Portal', url: `${appUrl}/kam-dashboard` }
        ]
      ]
    };
  }

  // Promoter
  return {
    inline_keyboard: [
      [
        { text: '💼 Open GRO10X Mini App ↗', web_app: { url: miniAppUrl } }
      ],
      [
        { text: '🎯 Referral Code', callback_data: 'cmd_mycode' },
        { text: '🏆 Tier Progress', callback_data: 'cmd_tier' }
      ],
      [
        { text: '💸 Earnings Summary', callback_data: 'cmd_earnings' },
        { text: '💳 Request Payout', callback_data: 'cmd_payout' }
      ],
      [
        { text: '📋 Log Investor Survey', callback_data: 'cmd_survey' },
        { text: '🌐 Promoter Hub', url: `${appUrl}/promoter` }
      ]
    ]
  };
}

// Handle /start command
export async function handleStartCommand(botToken, chatId) {
  const welcomeText = `👋 <b>Welcome to GRO10X OS Management Bot!</b>\n\nI am your <b>Management AI Colleague</b> 🤖\n\nTo verify your identity and unlock your role-based management tools, please tap the button below to share your registered phone number.`;
  
  const replyMarkup = {
    keyboard: [[{ text: '📱 Share Phone Number', request_contact: true }]],
    resize_keyboard: true,
    one_time_keyboard: true
  };

  await sendTelegramMessage(botToken, chatId, welcomeText, replyMarkup);
}

// Handle Contact Sharing Verification
export async function handleContactVerification(botToken, chatId, contact, appUrl) {
  const rawPhone = contact.phone_number;
  const cleanPhone = normalisePhone(rawPhone);
  const last10Digits = cleanPhone.slice(-10);

  let matchedUser = null;
  let userRole = 'admin';

  // Efficient targeted query on public.team
  const { data: teamMembers } = await supabase
    .from('team')
    .select('*')
    .or(`phone.eq.${rawPhone},phone.eq.${cleanPhone},phone.ilike.%${last10Digits}`);

  if (teamMembers && teamMembers.length > 0) {
    const found = teamMembers[0];
    matchedUser = {
      name: found.full_name,
      title: formatTeamType(found.team_type, found.designation),
      email: found.email,
      phone: found.phone,
      id: found.id,
      table: 'team',
      teamType: found.team_type,
      referralCode: found.referral_code || null
    };
    userRole = mapTeamTypeToRole(found.team_type);
  }

  if (matchedUser) {
    // Generate 4-digit PIN
    const tempPin = Math.floor(1000 + Math.random() * 9000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

    await supabase.from('telegram_auth_pins').insert([{
      phone_number: matchedUser.phone || cleanPhone,
      telegram_chat_id: String(chatId),
      user_role: userRole,
      temp_pin: tempPin,
      pin_expires_at: expiresAt,
      is_verified: false,
      linked_entity_id: matchedUser.id
    }]);

    await supabase.from('team').update({ telegram_chat_id: String(chatId) }).eq('id', matchedUser.id);

    const identifier = matchedUser.email || matchedUser.phone;
    const onboardUrl = `${appUrl}/auth?onboard=1&id=${encodeURIComponent(identifier)}`;

    const successText = `✅ <b>Identity Verified!</b>\n\nWelcome <b>${matchedUser.name}</b> 👋\n<b>${matchedUser.title}</b> | GRO10X OS\n\n🔑 <b>Temporary Web Access PIN:</b> <code>${tempPin}</code>\n<i>(Valid for 15 minutes)</i>\n\n🔗 Web Panel Link:\n${onboardUrl}\n\nChoose an action from your management dashboard below:`;

    const menuKeyboard = getRoleMenuKeyboard(userRole, appUrl);
    await sendTelegramMessage(botToken, chatId, successText, menuKeyboard);
  } else {
    const notFoundText = `⚠️ <b>Verification Failed</b>\n\nThe phone number <code>${rawPhone}</code> is not registered in public.team.\n\nPlease contact your platform administrator to pre-register your account.`;
    await sendTelegramMessage(botToken, chatId, notFoundText);
  }
}

// Handle /pin Command (On-Demand Web PIN Generation)
export async function handlePinCommand(botToken, chatId, appUrl) {
  // Find team user by telegram_chat_id
  const { data: teamUser } = await supabase
    .from('team')
    .select('*')
    .eq('telegram_chat_id', String(chatId))
    .maybeSingle();

  if (!teamUser) {
    await sendTelegramMessage(botToken, chatId, `⚠️ <b>Account Not Linked</b>\n\nPlease type /start and share your registered phone number first.`);
    return;
  }

  const tempPin = Math.floor(1000 + Math.random() * 9000).toString();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();
  const userRole = mapTeamTypeToRole(teamUser.team_type);

  await supabase.from('telegram_auth_pins').insert([{
    phone_number: teamUser.phone,
    telegram_chat_id: String(chatId),
    user_role: userRole,
    temp_pin: tempPin,
    pin_expires_at: expiresAt,
    is_verified: false,
    linked_entity_id: teamUser.id
  }]);

  const identifier = teamUser.email || teamUser.phone;
  const onboardUrl = `${appUrl}/auth?onboard=1&id=${encodeURIComponent(identifier)}`;

  const pinText = `🔑 <b>New Web Access PIN Issued!</b>\n\nUser: <b>${teamUser.full_name}</b>\nPIN: <code>${tempPin}</code>\n<i>(Expires in 15 minutes)</i>\n\n🔗 Quick Web Login:\n${onboardUrl}`;

  await sendTelegramMessage(botToken, chatId, pinText);
}
