import { supabase } from '../../../../lib/supabase';
import { sendTelegramMessage } from './authHandlers';

// 1. /mycode Command — Referral Toolkit
export async function handleMyCodeCommand(botToken, chatId, appUrl) {
  try {
    const { data: promoter } = await supabase
      .from('team')
      .select('*')
      .eq('telegram_chat_id', String(chatId))
      .maybeSingle();

    if (!promoter) {
      await sendTelegramMessage(botToken, chatId, `⚠️ Account not linked. Please type /start first.`);
      return;
    }

    const refCode = promoter.referral_code || `GRO-${promoter.full_name.slice(0, 3).toUpperCase()}-${promoter.id.slice(0, 4)}`;
    const shareUrl = `${appUrl}/apply?ref=${refCode}`;

    const text = `🎯 <b>Your GRO10X Growth Referral Toolkit</b>\n\n👤 <b>Promoter:</b> ${promoter.full_name}\n🔑 <b>Referral Code:</b> <code>${refCode}</code>\n\n🔗 <b>Shareable Investor Application Link:</b>\n<code>${shareUrl}</code>\n\n<i>Share this link with prospective investors to earn up to 1.0% commission per completed CapEx allocation.</i>`;

    const keyboard = {
      inline_keyboard: [
        [
          { text: '🏆 Tier Status', callback_data: 'cmd_tier' },
          { text: '💸 Earnings', callback_data: 'cmd_earnings' }
        ],
        [
          { text: '📋 Log Investor Survey', callback_data: 'cmd_survey' }
        ]
      ]
    };

    await sendTelegramMessage(botToken, chatId, text, keyboard);
  } catch (err) {
    console.error('Error in handleMyCodeCommand:', err);
    await sendTelegramMessage(botToken, chatId, `⚠️ Failed to load referral code: ${err.message}`);
  }
}

// 2. /tier Command — Gamified Progress
export async function handleTierCommand(botToken, chatId) {
  try {
    const { data: promoter } = await supabase
      .from('team')
      .select('*')
      .eq('telegram_chat_id', String(chatId))
      .maybeSingle();

    if (!promoter) {
      await sendTelegramMessage(botToken, chatId, `⚠️ Account not linked. Please type /start first.`);
      return;
    }

    const tier = promoter.promoter_tier || 'Associate';

    const text = `🏆 <b>Your Promoter Gamified Milestone Status</b>\n\n👤 <b>Name:</b> ${promoter.full_name}\n⭐ <b>Current Tier:</b> <b>${tier}</b>\n\n🎯 <b>Platform Tier Map:</b>\n🌱 Trainee (0–49 Inquiries)\n⭐ Junior Associate (50+ Inquiries)\n🥈 Associate — Current Base Level (0.75% Base)\n🥇 Senior Associate (৳50L Raised — 0.75% + 0.15% Bonus)\n💎 Elite Partner (৳2Cr Raised — 0.75% + 0.25% Max Bonus)\n\n<i>Keep submitting verified surveys to unlock your next commission tier!</i>`;

    await sendTelegramMessage(botToken, chatId, text);
  } catch (err) {
    console.error('Error in handleTierCommand:', err);
    await sendTelegramMessage(botToken, chatId, `⚠️ Failed to load tier: ${err.message}`);
  }
}

// 3. /earnings Command — Commission Ledger
export async function handleEarningsCommand(botToken, chatId) {
  try {
    const { data: promoter } = await supabase
      .from('team')
      .select('*')
      .eq('telegram_chat_id', String(chatId))
      .maybeSingle();

    if (!promoter) {
      await sendTelegramMessage(botToken, chatId, `⚠️ Account not linked. Please type /start first.`);
      return;
    }

    const { data: comms } = await supabase
      .from('promoter_commissions')
      .select('*')
      .eq('promoter_id', promoter.id);

    const totalEarned = (comms || []).reduce((sum, c) => sum + Number(c.commission_amount_bdt || 0), 0);

    const text = `💸 <b>Commission & Earnings Summary</b>\n\n👤 <b>Promoter:</b> ${promoter.full_name}\n💰 <b>Total Earned:</b> ৳${totalEarned.toLocaleString()} BDT\n📊 <b>Calculated Deals:</b> ${(comms || []).length}\n\n<i>Base Rate: 0.75% | Bonus Rate: 0.25%</i>`;

    const keyboard = {
      inline_keyboard: [
        [
          { text: '💳 Request Payout', callback_data: 'cmd_payout' }
        ]
      ]
    };

    await sendTelegramMessage(botToken, chatId, text, keyboard);
  } catch (err) {
    console.error('Error in handleEarningsCommand:', err);
    await sendTelegramMessage(botToken, chatId, `⚠️ Failed to load earnings: ${err.message}`);
  }
}

// 4. /payout Command — Submit Payout Request
export async function handlePayoutCommand(botToken, chatId, accountDetails = '') {
  try {
    const { data: promoter } = await supabase
      .from('team')
      .select('*')
      .eq('telegram_chat_id', String(chatId))
      .maybeSingle();

    if (!promoter) {
      await sendTelegramMessage(botToken, chatId, `⚠️ Account not linked. Please type /start first.`);
      return;
    }

    const payload = {
      promoter_id: promoter.id,
      amount_bdt: 5000, // Default requested block
      disbursement_channel: 'bKash',
      account_details: accountDetails || promoter.phone || '01700000000',
      status: 'Pending'
    };

    const { error } = await supabase.from('payout_requests').insert([payload]);
    if (error) throw error;

    const text = `✅ <b>Commission Payout Request Submitted!</b>\n\nPromoter: <b>${promoter.full_name}</b>\nRequested Amount: ৳5,000 BDT\nChannel: bKash (${payload.account_details})\nStatus: <b>⏳ Pending Admin Approval</b>\n\n<i>Your managing partner will review and clear funds shortly.</i>`;

    await sendTelegramMessage(botToken, chatId, text);
  } catch (err) {
    console.error('Error in handlePayoutCommand:', err);
    await sendTelegramMessage(botToken, chatId, `⚠️ Failed to submit payout: ${err.message}`);
  }
}

// 5. /survey Command — Start Conversational Investor Survey
export async function handleSurveyCommand(botToken, chatId) {
  const text = `📋 <b>GRO10X Investor Survey Logger</b>\n\nLog an accredited investor prospect directly from the field!\n\nTap below to launch the survey form:`;

  const keyboard = {
    inline_keyboard: [
      [
        { text: '📝 Start Survey Form', callback_data: 'survey_step_1' }
      ]
    ]
  };

  await sendTelegramMessage(botToken, chatId, text, keyboard);
}
