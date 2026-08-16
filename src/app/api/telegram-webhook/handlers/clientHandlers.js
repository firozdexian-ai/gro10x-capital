import { supabase } from '../../../../lib/supabase';

// Helper to send messages via Telegram Bot API
async function sendMsg(botToken, chatId, text, extra = {}) {
  const payload = {
    chat_id: chatId,
    text,
    parse_mode: 'HTML',
    ...extra,
  };
  try {
    const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return await res.json();
  } catch (err) {
    console.error('sendMsg error (client bot):', err);
  }
}

// ─── /start Command ──────────────────────────────────────────────────────────
export async function handleClientStart(botToken, chatId, payload, appUrl) {
  // Check if this chat_id already belongs to a registered founder
  const { data: founder } = await supabase
    .from('founders')
    .select('id, full_name, telegram_chat_id, businesses(brand_name)')
    .eq('telegram_chat_id', String(chatId))
    .maybeSingle();

  if (founder) {
    const brand = founder.businesses?.brand_name || 'Your Business';
    await sendMsg(botToken, chatId,
      `🏢 <b>Welcome back, ${founder.full_name}!</b>\n\n` +
      `<b>Brand:</b> ${brand}\n\n` +
      `Use the commands below to monitor your funding rounds, cap table, and POS telemetry:\n\n` +
      `• /funds — Active funding raise & target progress\n` +
      `• /pos — Recent daily sales & net profit telemetry\n` +
      `• /status — Cohort application & onboarding status\n` +
      `• /help — Full command directory & quick actions`,
      {
        reply_markup: {
          inline_keyboard: [
            [
              { text: '🌐 Open Business Portal', url: `${appUrl}/business` },
              { text: '📊 POS Telemetry', url: `${appUrl}/business` }
            ]
          ]
        }
      }
    );
    return;
  }

  // New or unlinked founder — Request contact
  await sendMsg(botToken, chatId,
    `👋 <b>Welcome to GRO10X Business Partner Bot!</b>\n\n` +
    `This channel provides real-time access to your <b>Cap Table</b>, <b>Funding Raise Progress</b>, <b>Settlement Statements</b>, and <b>POS Telemetry Engine</b>.\n\n` +
    `📱 <i>Please share your registered contact number below to link your founder profile:</i>`,
    {
      reply_markup: {
        keyboard: [
          [{ text: '📱 Share Registered Phone Number', request_contact: true }]
        ],
        resize_keyboard: true,
        one_time_keyboard: true
      }
    }
  );
}

// ─── Contact Sharing → Verify Founder & Issue PIN ───────────────────────────
export async function handleClientContact(botToken, chatId, contact, appUrl) {
  let phoneRaw = contact.phone_number || '';
  let phoneClean = phoneRaw.replace(/[\s\-\+\(\)]/g, '');
  if (phoneClean.startsWith('880')) phoneClean = '0' + phoneClean.slice(3);

  const last10 = phoneClean.slice(-10);
  const phoneVariants = Array.from(new Set([
    phoneRaw,
    phoneClean,
    `+880${phoneClean.replace(/^0/, '')}`,
    `880${phoneClean.replace(/^0/, '')}`,
    `0${phoneClean.replace(/^0/, '')}`
  ].filter(Boolean)));

  // Search in founders table
  let query = supabase
    .from('founders')
    .select('id, full_name, phone, email, telegram_chat_id, businesses(brand_name)');

  if (last10.length >= 8) {
    query = query.or(`phone.in.(${phoneVariants.join(',')}),phone.ilike.%${last10}`);
  } else {
    query = query.in('phone', phoneVariants);
  }

  const { data: matchedFounders } = await query.limit(5);
  const founder = (matchedFounders || []).find(f => {
    let p = (f.phone || '').replace(/[\s\-\+\(\)]/g, '');
    if (p.startsWith('880')) p = '0' + p.slice(3);
    return p === phoneClean || phoneVariants.includes(f.phone);
  });

  if (!founder) {
    // Check if there is an active cohort application matching this phone
    let appQuery = supabase
      .from('business_cohort_applications')
      .select('id, brand_name, lead_founder_name, application_status, reference_code')
      .or(`lead_founder_phone.in.(${phoneVariants.join(',')}),lead_founder_phone.ilike.%${last10}`)
      .limit(1);

    const { data: matchedApps } = await appQuery;
    const app = matchedApps && matchedApps.length > 0 ? matchedApps[0] : null;

    if (app) {
      await sendMsg(botToken, chatId,
        `📋 <b>Cohort Application Found!</b>\n\n` +
        `<b>Brand:</b> ${app.brand_name}\n` +
        `<b>Ref Code:</b> <code>${app.reference_code || 'Pending'}</code>\n` +
        `<b>Status:</b> <b>${app.application_status || 'Under Review'}</b>\n\n` +
        `Your application is currently being evaluated by the Investment Committee. You will receive real-time notifications here as your review progresses.`,
        {
          reply_markup: {
            remove_keyboard: true,
            inline_keyboard: [[
              { text: '🌐 View Application Portal', url: `${appUrl}/apply` }
            ]]
          }
        }
      );
      return;
    }

    await sendMsg(botToken, chatId,
      `⚠️ <b>Phone Not Recognised</b>\n\n` +
      `The number <code>${phoneRaw}</code> is not currently registered as an active founder or cohort applicant.\n\n` +
      `If you have an SME or franchise seeking growth capital, you can apply directly below:`,
      {
        reply_markup: {
          remove_keyboard: true,
          inline_keyboard: [[
            { text: '🚀 Apply for Cohort Funding', url: `${appUrl}/apply` }
          ]]
        }
      }
    );
    return;
  }

  // Update founder record with telegram_chat_id
  await supabase
    .from('founders')
    .update({ telegram_chat_id: String(chatId) })
    .eq('id', founder.id);

  // Generate activation PIN
  const pin = String(Math.floor(1000 + Math.random() * 9000));
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

  await supabase.from('telegram_auth_pins').insert([{
    telegram_chat_id: String(chatId),
    temp_pin: pin,
    pin_expires_at: expiresAt,
    is_verified: false,
    user_role: 'founder',
    phone_number: founder.phone || phoneClean
  }]);

  const brand = founder.businesses?.brand_name || 'Your Business';

  await sendMsg(botToken, chatId,
    `✅ <b>Profile Verified: ${founder.full_name}</b>\n` +
    `🏢 <b>Brand:</b> ${brand}\n\n` +
    `Your Single-Sign-On PIN for the Web Business Portal is:\n\n` +
    `🔑 <b>PIN:</b> <code>${pin}</code> <i>(Valid for 15 minutes)</i>\n\n` +
    `Click below to log in directly to your Founder Dashboard:`,
    {
      reply_markup: {
        remove_keyboard: true,
        inline_keyboard: [[
          { text: '🚀 Open Business Portal', url: `${appUrl}/business` }
        ]]
      }
    }
  );
}

// ─── /funds Command ─────────────────────────────────────────────────────────
export async function handleClientFunds(botToken, chatId, appUrl) {
  const { data: founder } = await supabase
    .from('founders')
    .select('id, full_name, businesses(id, brand_name)')
    .eq('telegram_chat_id', String(chatId))
    .maybeSingle();

  if (!founder || !founder.businesses) {
    await sendMsg(botToken, chatId,
      `⚠️ <b>No active business entity linked to this chat.</b>\nPlease verify via /start first.`
    );
    return;
  }

  const biz = founder.businesses;
  const { data: projects } = await supabase
    .from('funding_projects')
    .select('id, project_title, target_raise_bdt, amount_raised_bdt, status, yield_model')
    .eq('business_id', biz.id)
    .order('created_at', { ascending: false });

  if (!projects || projects.length === 0) {
    await sendMsg(botToken, chatId,
      `📊 <b>${biz.brand_name} — Capital Funding</b>\n\n` +
      `No active funding campaigns currently listed in pipeline.\n\n` +
      `To launch a new CapEx expansion round, contact your assigned Key Account Manager.`,
      {
        reply_markup: {
          inline_keyboard: [[
            { text: '🌐 Business Portal', url: `${appUrl}/business` }
          ]]
        }
      }
    );
    return;
  }

  let text = `💼 <b>${biz.brand_name} — Active Capital Rounds</b>\n\n`;
  projects.forEach((p, idx) => {
    const target = Number(p.target_raise_bdt || 0);
    const raised = Number(p.amount_raised_bdt || 0);
    const pct = target > 0 ? Math.round((raised / target) * 100) : 0;
    text += `${idx + 1}. <b>${p.project_title}</b>\n`;
    text += `   • Status: <b>${p.status}</b>\n`;
    text += `   • Raised: ৳${raised.toLocaleString()} / ৳${target.toLocaleString()} BDT (${pct}%)\n`;
    text += `   • Model: ${p.yield_model || 'CapEx Revenue Share'}\n\n`;
  });

  await sendMsg(botToken, chatId, text, {
    reply_markup: {
      inline_keyboard: [[
        { text: '📋 View Cap Table & Investors', url: `${appUrl}/business` }
      ]]
    }
  });
}

// ─── /pos Command ───────────────────────────────────────────────────────────
export async function handleClientPos(botToken, chatId, appUrl) {
  const { data: founder } = await supabase
    .from('founders')
    .select('id, full_name, businesses(id, brand_name)')
    .eq('telegram_chat_id', String(chatId))
    .maybeSingle();

  if (!founder || !founder.businesses) {
    await sendMsg(botToken, chatId,
      `⚠️ <b>No active business linked.</b>\nPlease connect your account via /start.`
    );
    return;
  }

  const biz = founder.businesses;
  const { data: posData } = await supabase
    .from('pos_daily_sales')
    .select('date, gross_sales_bdt, net_profit_bdt, transaction_count')
    .eq('business_id', biz.id)
    .order('date', { ascending: false })
    .limit(7);

  if (!posData || posData.length === 0) {
    await sendMsg(botToken, chatId,
      `📈 <b>${biz.brand_name} — POS Telemetry</b>\n\n` +
      `No daily revenue logs recorded in the last 7 days.\n\n` +
      `💡 <i>Make sure to log daily telemetry before 11:59 PM to maintain automated audit compliance.</i>`,
      {
        reply_markup: {
          inline_keyboard: [[
            { text: '📊 Log Today\'s POS Sales', url: `${appUrl}/business` }
          ]]
        }
      }
    );
    return;
  }

  let text = `📈 <b>${biz.brand_name} — Last 7 Days POS Telemetry</b>\n\n`;
  let totalGross = 0;
  let totalNet = 0;

  posData.forEach(p => {
    const gross = Number(p.gross_sales_bdt || 0);
    const net = Number(p.net_profit_bdt || 0);
    const margin = gross > 0 ? Math.round((net / gross) * 100) : 0;
    totalGross += gross;
    totalNet += net;
    text += `📅 <b>${p.date}:</b> ৳${gross.toLocaleString()} | Net: ৳${net.toLocaleString()} (${margin}%)\n`;
  });

  const avgMargin = totalGross > 0 ? Math.round((totalNet / totalGross) * 100) : 0;
  text += `\n<b>7-Day Total Gross:</b> ৳${totalGross.toLocaleString()} BDT\n`;
  text += `<b>7-Day Net Profit:</b> ৳${totalNet.toLocaleString()} BDT (Avg Margin: ${avgMargin}%)`;

  await sendMsg(botToken, chatId, text, {
    reply_markup: {
      inline_keyboard: [[
        { text: '📊 Sync POS Revenue', url: `${appUrl}/business` }
      ]]
    }
  });
}

// ─── /status Command ────────────────────────────────────────────────────────
export async function handleClientStatus(botToken, chatId, appUrl) {
  const { data: founder } = await supabase
    .from('founders')
    .select('id, full_name, phone, businesses(id, brand_name, is_enlisted, ai_health_score)')
    .eq('telegram_chat_id', String(chatId))
    .maybeSingle();

  if (founder) {
    const biz = founder.businesses;
    await sendMsg(botToken, chatId,
      `🏢 <b>Business Profile Status — ${biz?.brand_name || 'Enlisted Business'}</b>\n\n` +
      `• Founder: <b>${founder.full_name}</b>\n` +
      `• Platform Enlistment: <b>${biz?.is_enlisted ? 'Active Partner' : 'Pending Verification'}</b>\n` +
      `• AI Health Score: <b>${biz?.ai_health_score || 85}/100</b>\n\n` +
      `You have full access to the Business Portal for Cap Table management, POS telemetry sync, and Investor distributions.`,
      {
        reply_markup: {
          inline_keyboard: [[
            { text: '🌐 Open Business Portal', url: `${appUrl}/business` }
          ]]
        }
      }
    );
    return;
  }

  // Not in founders -> Check cohort application
  await sendMsg(botToken, chatId,
    `ℹ️ <b>No registered founder record linked.</b>\n\n` +
    `Please share your phone number via /start to verify your profile or check an existing application.`,
    {
      reply_markup: {
        inline_keyboard: [[
          { text: '🚀 Apply for Capital', url: `${appUrl}/apply` }
        ]]
      }
    }
  );
}

// ─── /help Command ──────────────────────────────────────────────────────────
export async function handleClientHelp(botToken, chatId, appUrl) {
  await sendMsg(botToken, chatId,
    `🛠️ <b>GRO10X Founder & Business Bot Commands</b>\n\n` +
    `• /funds — Active funding raise and progress\n` +
    `• /pos — 7-day POS revenue & margin breakdown\n` +
    `• /status — Business enlistment & profile standing\n` +
    `• /start — Re-link phone number or generate Web PIN\n` +
    `• /help — Show this command directory\n\n` +
    `For deeper financial models and cap-table operations, access the web terminal below:`,
    {
      reply_markup: {
        inline_keyboard: [
          [
            { text: '🌐 Business Portal', url: `${appUrl}/business` },
            { text: '📈 POS Sync Terminal', url: `${appUrl}/pos-sync` }
          ]
        ]
      }
    }
  );
}
