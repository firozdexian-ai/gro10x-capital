import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';
import { 
  handleStartCommand, 
  handleContactVerification, 
  handlePinCommand,
  sendTelegramMessage,
  answerCallbackQuery
} from './handlers/authHandlers';
import { 
  handleKpisCommand, 
  handleAlertsCommand, 
  handleLeadsCommand, 
  handlePayoutsCommand, 
  handleBroadcastCommand 
} from './handlers/adminHandlers';
import { 
  handlePortfolioCommand, 
  handleTicketsCommand 
} from './handlers/kamHandlers';
import { 
  handleMyCodeCommand, 
  handleTierCommand, 
  handleEarningsCommand, 
  handlePayoutCommand, 
  handleSurveyCommand 
} from './handlers/promoterHandlers';

export async function POST(request) {
  try {
    const urlObj = new URL(request.url);
    const botKey = urlObj.searchParams.get('bot') || 'team';

    // Verify secret token if configured
    const secretHeader = request.headers.get('x-telegram-bot-api-secret-token');
    const expectedSecret = process.env.TELEGRAM_WEBHOOK_SECRET;
    if (expectedSecret && secretHeader !== expectedSecret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let botToken = process.env.TELEGRAM_TEAM_BOT_TOKEN;
    if (botKey === 'investor') botToken = process.env.TELEGRAM_INVESTOR_BOT_TOKEN;
    if (botKey === 'client') botToken = process.env.TELEGRAM_CLIENT_BOT_TOKEN;

    if (!botToken) {
      return NextResponse.json({ ok: true });
    }

    const body = await request.json();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    // -----------------------------------------------------------
    // 1. HANDLE CALLBACK QUERIES (INLINE KEYBOARD BUTTON PRESSES)
    // -----------------------------------------------------------
    if (body.callback_query) {
      const cb = body.callback_query;
      const callbackData = cb.data || '';
      const chatId = cb.message?.chat?.id;

      if (chatId) {
        await answerCallbackQuery(botToken, cb.id);

        if (callbackData === 'cmd_kpis') await handleKpisCommand(botToken, chatId, appUrl);
        else if (callbackData === 'cmd_alerts') await handleAlertsCommand(botToken, chatId, appUrl);
        else if (callbackData === 'cmd_leads') await handleLeadsCommand(botToken, chatId, appUrl);
        else if (callbackData === 'cmd_payouts') await handlePayoutsCommand(botToken, chatId, appUrl);
        else if (callbackData === 'cmd_portfolio') await handlePortfolioCommand(botToken, chatId, appUrl);
        else if (callbackData === 'cmd_tickets') await handleTicketsCommand(botToken, chatId, appUrl);
        else if (callbackData === 'cmd_mycode') await handleMyCodeCommand(botToken, chatId, appUrl);
        else if (callbackData === 'cmd_tier') await handleTierCommand(botToken, chatId);
        else if (callbackData === 'cmd_earnings') await handleEarningsCommand(botToken, chatId);
        else if (callbackData === 'cmd_payout') await handlePayoutCommand(botToken, chatId);
        else if (callbackData === 'cmd_survey') await handleSurveyCommand(botToken, chatId);
        else if (callbackData === 'cmd_pin') await handlePinCommand(botToken, chatId, appUrl);
        else if (callbackData.startsWith('approve_payout:')) {
          const payoutId = callbackData.split(':')[1];
          await supabase.from('payout_requests').update({ status: 'Cleared' }).eq('id', payoutId);
          await sendTelegramMessage(botToken, chatId, `✅ Commission Payout #${payoutId.slice(0, 6)} marked as Cleared!`);
        } else if (callbackData.startsWith('reject_payout:')) {
          const payoutId = callbackData.split(':')[1];
          await supabase.from('payout_requests').update({ status: 'Rejected' }).eq('id', payoutId);
          await sendTelegramMessage(botToken, chatId, `❌ Commission Payout #${payoutId.slice(0, 6)} Rejected.`);
        }
      }

      return NextResponse.json({ ok: true });
    }

    // -----------------------------------------------------------
    // 2. HANDLE TEXT MESSAGES & CONTACT SHARING
    // -----------------------------------------------------------
    const message = body.message || {};
    const chat = message.chat || {};
    const text = (message.text || '').trim();
    const contact = message.contact || null;
    const chatId = chat.id;

    if (!chatId) {
      return NextResponse.json({ ok: true });
    }

    // A) /start Command
    if (text.startsWith('/start')) {
      await handleStartCommand(botToken, chatId);
      return NextResponse.json({ ok: true });
    }

    // B) Contact Sharing Verification
    if (contact && contact.phone_number) {
      await handleContactVerification(botToken, chatId, contact, appUrl);
      return NextResponse.json({ ok: true });
    }

    // C) /pin Command
    if (text === '/pin') {
      await handlePinCommand(botToken, chatId, appUrl);
      return NextResponse.json({ ok: true });
    }

    // D) /kpis Command
    if (text === '/kpis') {
      await handleKpisCommand(botToken, chatId, appUrl);
      return NextResponse.json({ ok: true });
    }

    // E) /alerts Command
    if (text === '/alerts') {
      await handleAlertsCommand(botToken, chatId, appUrl);
      return NextResponse.json({ ok: true });
    }

    // F) /leads Command
    if (text === '/leads') {
      await handleLeadsCommand(botToken, chatId, appUrl);
      return NextResponse.json({ ok: true });
    }

    // G) /payouts Command
    if (text === '/payouts') {
      await handlePayoutsCommand(botToken, chatId, appUrl);
      return NextResponse.json({ ok: true });
    }

    // H) /broadcast Command
    if (text.startsWith('/broadcast')) {
      const msg = text.replace('/broadcast', '').trim();
      await handleBroadcastCommand(botToken, chatId, msg);
      return NextResponse.json({ ok: true });
    }

    // I) /portfolio Command
    if (text === '/portfolio') {
      await handlePortfolioCommand(botToken, chatId, appUrl);
      return NextResponse.json({ ok: true });
    }

    // J) /tickets Command
    if (text === '/tickets') {
      await handleTicketsCommand(botToken, chatId, appUrl);
      return NextResponse.json({ ok: true });
    }

    // K) /mycode Command
    if (text === '/mycode') {
      await handleMyCodeCommand(botToken, chatId, appUrl);
      return NextResponse.json({ ok: true });
    }

    // L) /tier Command
    if (text === '/tier') {
      await handleTierCommand(botToken, chatId);
      return NextResponse.json({ ok: true });
    }

    // M) /earnings Command
    if (text === '/earnings') {
      await handleEarningsCommand(botToken, chatId);
      return NextResponse.json({ ok: true });
    }

    // N) /survey Command
    if (text === '/survey') {
      await handleSurveyCommand(botToken, chatId);
      return NextResponse.json({ ok: true });
    }

    // O) /payout Command
    if (text === '/payout') {
      await handlePayoutCommand(botToken, chatId);
      return NextResponse.json({ ok: true });
    }

    // Fallback default response
    const defaultText = `🤖 <b>GRO10X Management AI Colleague</b>\n\nType /start to verify identity or /pin for a quick web access code.\nAvailable commands: /kpis, /alerts, /leads, /payouts, /portfolio, /tickets, /mycode, /tier, /earnings, /survey`;
    await sendTelegramMessage(botToken, chatId, defaultText);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Telegram Webhook error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
