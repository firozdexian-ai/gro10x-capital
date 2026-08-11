import { supabase } from '../../../../lib/supabase';

// ─── Core send helper ────────────────────────────────────────────────────────
async function sendMsg(botToken, chatId, text, extra = {}) {
  await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML', ...extra })
  }).catch(e => console.error('[investorBot] sendMessage error:', e));
}

// ─── /start with deep-link payload ──────────────────────────────────────────
export async function handleInvestorStart(botToken, chatId, payload, appUrl) {
  // payload format: "verify_PREID" or empty
  if (payload && payload.startsWith('verify_')) {
    const preId = payload.replace('verify_', '');

    const { data: pre } = await supabase
      .from('investor_pre_profiles')
      .select('*')
      .eq('id', preId)
      .maybeSingle();

    if (pre) {
      // Update telegram_chat_id immediately on pre_profile
      await supabase.from('investor_pre_profiles').update({
        telegram_chat_id: String(chatId),
        survey_status: 'Telegram_Linked'
      }).eq('id', preId);

      await sendMsg(botToken, chatId,
        `🌟 <b>Welcome to GRO10X Capital</b>\n\n` +
        `Hello, <b>${pre.full_name || 'Valued Partner'}</b>!\n\n` +
        `You've been personally invited to join our <b>private investor ecosystem</b>.\n\n` +
        `To activate your portfolio access, please verify your identity by sharing your registered phone number below. 👇`,
        {
          reply_markup: {
            keyboard: [[{ text: '📱 Share My Verified Number', request_contact: true }]],
            resize_keyboard: true,
            one_time_keyboard: true
          }
        }
      );
      return;
    }
  }

  // Generic start (no pre-profile ID)
  await sendMsg(botToken, chatId,
    `🌟 <b>Welcome to GRO10X Capital Investor Portal</b>\n\n` +
    `This is your private investment companion. You can:\n\n` +
    `📊 /portfolio — View your investment summary\n` +
    `💸 /yields — See your yield receipts\n` +
    `🛡️ /kyc — Check your verification status\n` +
    `📄 /documents — Access your legal contracts\n` +
    `❓ /help — Full command guide\n\n` +
    `If you have an <b>investor invite link</b>, please click it again to activate your account.`,
    {
      reply_markup: {
        inline_keyboard: [[
          { text: '🌐 Open Investor Portal', url: `${appUrl}/investor` }
        ]]
      }
    }
  );
}

// ─── Contact sharing → Issue PIN ─────────────────────────────────────────────
export async function handleInvestorContact(botToken, chatId, contact, appUrl) {
  let phoneRaw = contact.phone_number || '';
  let phoneClean = phoneRaw.replace(/[\s\-\+\(\)]/g, '');
  if (phoneClean.startsWith('880')) phoneClean = '0' + phoneClean.slice(3);

  // 1. Find investor by phone (investors table)
  const { data: allInvestors } = await supabase
    .from('investors')
    .select('id, full_name, alias_name, phone, email, telegram_chat_id');

  let investor = (allInvestors || []).find(i => {
    let p = (i.phone || '').replace(/[\s\-\+\(\)]/g, '');
    if (p.startsWith('880')) p = '0' + p.slice(3);
    return p === phoneClean;
  });

  // 2. Fallback: Check investor_pre_profiles
  if (!investor) {
    const { data: allPre } = await supabase
      .from('investor_pre_profiles')
      .select('*');

    const pre = (allPre || []).find(p => {
      let ph = (p.phone || '').replace(/[\s\-\+\(\)]/g, '');
      if (ph.startsWith('880')) ph = '0' + ph.slice(3);
      return ph === phoneClean;
    });

    if (pre) {
      // Update pre-profile with telegram_chat_id
      await supabase.from('investor_pre_profiles').update({
        telegram_chat_id: String(chatId),
        survey_status: 'Telegram_Linked'
      }).eq('id', pre.id);

      // Issue PIN using pre-profile phone/email
      await issueInvestorPin(botToken, chatId, pre.phone || phoneRaw, pre.full_name || 'Valued Partner', appUrl, pre.email);
      return;
    }

    // Completely unknown number
    await sendMsg(botToken, chatId,
      `⚠️ <b>Phone Not Recognised</b>\n\n` +
      `The number <code>${phoneRaw}</code> is not registered in our investor system.\n\n` +
      `Please contact your GRO10X relationship manager to get your access link, or ensure you're using the same number that was registered with us.`
    );
    return;
  }

  // 3. Update investor telegram_chat_id
  await supabase.from('investors').update({
    telegram_chat_id: String(chatId)
  }).eq('id', investor.id);

  await issueInvestorPin(botToken, chatId, investor.phone || phoneRaw, investor.alias_name || investor.full_name || 'Valued Investor', appUrl, investor.email);
}

// ─── Generate & send 4-digit PIN ─────────────────────────────────────────────
async function issueInvestorPin(botToken, chatId, phone, name, appUrl, email) {
  const pin = String(Math.floor(1000 + Math.random() * 9000));
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

  await supabase.from('telegram_auth_pins').insert([{
    telegram_chat_id: String(chatId),
    temp_pin: pin,
    pin_expires_at: expiresAt,
    is_verified: false,
    user_role: 'investor',
    phone_number: phone
  }]);

  const idParam = email || phone;

  await sendMsg(botToken, chatId,
    `✅ <b>Phone Verified — ${name}!</b>\n\n` +
    `Your <b>4-digit Web Access PIN</b> has been generated:\n\n` +
    `🔑 PIN: <code>${pin}</code>\n` +
    `⏳ Expires in: <b>15 minutes</b>\n\n` +
    `Now visit your personal portal to activate your investment dashboard:`,
    {
      reply_markup: {
        inline_keyboard: [[
          { text: '🚀 Activate My Portfolio', url: `${appUrl}/auth?onboard=1&id=${encodeURIComponent(idParam)}` }
        ]],
        remove_keyboard: true
      }
    }
  );
}

// ─── /portfolio Command ───────────────────────────────────────────────────────
export async function handleInvestorPortfolio(botToken, chatId, appUrl) {
  // Find investor by telegram_chat_id
  const { data: investor } = await supabase
    .from('investors')
    .select('id, alias_name, full_name, requires_anonymity')
    .eq('telegram_chat_id', String(chatId))
    .maybeSingle();

  if (!investor) {
    await sendMsg(botToken, chatId,
      `⚠️ <b>No linked investor account found.</b>\n\nPlease ensure you activated your portfolio via /start with your invite link.`
    );
    return;
  }

  const displayName = investor.requires_anonymity ? 'Private Investor' : (investor.alias_name || investor.full_name);

  // Fetch investments
  const { data: investments } = await supabase
    .from('investments')
    .select('amount_invested_bdt, status, funding_projects(project_title)')
    .eq('investor_id', investor.id)
    .eq('status', 'Active');

  const totalInvested = (investments || []).reduce((s, i) => s + Number(i.amount_invested_bdt || 0), 0);

  // Fetch total yields earned
  const { data: yields } = await supabase
    .from('investor_yields')
    .select('amount_bdt')
    .eq('investor_id', investor.id);

  const totalYields = (yields || []).reduce((s, y) => s + Number(y.amount_bdt || 0), 0);

  const projectLines = (investments || [])
    .map(i => `  ▸ ${i.funding_projects?.project_title || 'Active Deal'} — ৳${Number(i.amount_invested_bdt || 0).toLocaleString()}`)
    .join('\n') || '  ▸ No active investments yet';

  await sendMsg(botToken, chatId,
    `💼 <b>Your GRO10X Portfolio — ${displayName}</b>\n\n` +
    `💰 Total Invested: <b>৳${totalInvested.toLocaleString()} BDT</b>\n` +
    `📊 Active Projects: <b>${(investments || []).length}</b>\n` +
    `🎯 Target Yield: <b>18% – 20% IRR</b>\n\n` +
    `<b>Active Capital Allocations:</b>\n${projectLines}\n\n` +
    `💸 Total Yield Received: <b>৳${totalYields.toLocaleString()} BDT</b>`,
    {
      reply_markup: {
        inline_keyboard: [[
          { text: '📋 Full Dashboard', url: `${appUrl}/investor` },
          { text: '🏗️ Browse Deals', url: `${appUrl}/showcase` }
        ]]
      }
    }
  );
}

// ─── /yields Command ─────────────────────────────────────────────────────────
export async function handleInvestorYields(botToken, chatId, appUrl) {
  const { data: investor } = await supabase
    .from('investors')
    .select('id, alias_name, requires_anonymity')
    .eq('telegram_chat_id', String(chatId))
    .maybeSingle();

  if (!investor) {
    await sendMsg(botToken, chatId, `⚠️ Portfolio not linked. Use your invite link to activate.`);
    return;
  }

  const { data: yields } = await supabase
    .from('investor_yields')
    .select('amount_bdt, yield_disbursements(month, year, funding_projects(project_title))')
    .eq('investor_id', investor.id)
    .order('created_at', { ascending: false })
    .limit(5);

  if (!yields || yields.length === 0) {
    await sendMsg(botToken, chatId,
      `📊 <b>Yield History</b>\n\nNo yield distributions recorded yet. Your first yield notification will arrive automatically at the next disbursement cycle.`
    );
    return;
  }

  const lines = yields.map(y => {
    const d = y.yield_disbursements;
    return `  ▸ ${d?.month || '—'}/${d?.year || '—'} — ${d?.funding_projects?.project_title || 'GRO10X SPV'}: <b>৳${Number(y.amount_bdt).toLocaleString()}</b>`;
  }).join('\n');

  const total = yields.reduce((s, y) => s + Number(y.amount_bdt || 0), 0);

  await sendMsg(botToken, chatId,
    `💸 <b>Your Recent Yield Receipts</b>\n\n${lines}\n\n` +
    `📦 Shown: Last ${yields.length} distributions\n` +
    `🏦 Total Received: <b>৳${total.toLocaleString()} BDT</b>`,
    {
      reply_markup: {
        inline_keyboard: [[{ text: '📈 Full Yield History', url: `${appUrl}/investor` }]]
      }
    }
  );
}

// ─── /kyc Command ────────────────────────────────────────────────────────────
export async function handleInvestorKyc(botToken, chatId, appUrl) {
  const { data: investor } = await supabase
    .from('investors')
    .select('id, alias_name, kyc_verified')
    .eq('telegram_chat_id', String(chatId))
    .maybeSingle();

  if (!investor) {
    await sendMsg(botToken, chatId, `⚠️ Portfolio not linked. Use your invite link to activate.`);
    return;
  }

  const { data: subs } = await supabase
    .from('kyc_submissions')
    .select('target_level, status')
    .eq('investor_id', investor.id)
    .order('created_at', { ascending: false });

  const approved = (subs || []).filter(s => s.status === 'Approved');
  const pending = (subs || []).filter(s => s.status === 'Pending');
  let level = 1;
  if (approved.find(s => s.target_level === 3)) level = 3;
  else if (approved.find(s => s.target_level === 2)) level = 2;

  const levelMap = {
    1: { label: 'Basic Access', next: 'Upload NID to unlock P2P Secondary Market', unlock: 'P2P Market' },
    2: { label: 'P2P Market Unlocked', next: 'Upload Source of Funds to unlock Cash Concierge', unlock: 'HNW Cash Concierge (৳50L+)' },
    3: { label: 'Full HNW Access — Elite Investor', next: null, unlock: null }
  };

  const info = levelMap[level];
  const pendingLine = pending.length > 0 ? `\n⏳ <b>${pending.length} submission(s) pending admin review</b>` : '';

  await sendMsg(botToken, chatId,
    `🛡️ <b>Your KYC Verification Status</b>\n\n` +
    `Current Level: <b>Level ${level} — ${info.label}</b>${pendingLine}\n\n` +
    (info.next ? `📋 <b>Next Step:</b>\n${info.next}\n\n🔓 Unlocks: <b>${info.unlock}</b>` : `🎖️ You have achieved <b>full HNW investor status</b>. All platform features are unlocked.`),
    {
      reply_markup: {
        inline_keyboard: [[{ text: '🛡️ Manage KYC Verification', url: `${appUrl}/investor` }]]
      }
    }
  );
}

// ─── /documents Command ──────────────────────────────────────────────────────
export async function handleInvestorDocuments(botToken, chatId, appUrl) {
  const { data: investor } = await supabase
    .from('investors')
    .select('id')
    .eq('telegram_chat_id', String(chatId))
    .maybeSingle();

  if (!investor) {
    await sendMsg(botToken, chatId, `⚠️ Portfolio not linked. Use your invite link to activate.`);
    return;
  }

  const { data: docs } = await supabase
    .from('legal_documents')
    .select('id, doc_type, created_at, doc_url, investments(funding_projects(project_title))')
    .eq('investor_id', investor.id)
    .order('created_at', { ascending: false })
    .limit(5);

  if (!docs || docs.length === 0) {
    await sendMsg(botToken, chatId,
      `📄 <b>Document Vault</b>\n\nNo executed legal documents yet. Documents will appear here once your first investment is confirmed.`
    );
    return;
  }

  const docLines = docs.map(d =>
    `  ▸ <b>${d.doc_type || 'Agreement'}</b> — ${d.investments?.funding_projects?.project_title || 'GRO10X SPV'}\n    📅 ${new Date(d.created_at).toLocaleDateString()}`
  ).join('\n');

  await sendMsg(botToken, chatId,
    `📄 <b>Your Legal Document Vault</b>\n\n${docLines}\n\n` +
    `Access and download your full document suite from the web portal:`,
    {
      reply_markup: {
        inline_keyboard: [[{ text: '📁 Open Document Vault', url: `${appUrl}/investor` }]]
      }
    }
  );
}

// ─── /help Command ───────────────────────────────────────────────────────────
export async function handleInvestorHelp(botToken, chatId, appUrl) {
  await sendMsg(botToken, chatId,
    `🌟 <b>GRO10X Capital — Investor Bot Commands</b>\n\n` +
    `📊 /portfolio — Investment summary & holdings\n` +
    `💸 /yields — Recent yield receipts\n` +
    `🛡️ /kyc — KYC verification status\n` +
    `📄 /documents — Legal contracts vault\n` +
    `❓ /help — This command list\n\n` +
    `<i>For urgent matters, contact your relationship manager directly.</i>`,
    {
      reply_markup: {
        inline_keyboard: [[
          { text: '🌐 Open Portfolio', url: `${appUrl}/investor` },
          { text: '🏗️ Browse Projects', url: `${appUrl}/showcase` }
        ]]
      }
    }
  );
}
