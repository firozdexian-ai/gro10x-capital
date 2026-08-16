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
  handleApplicationsCommand,
  handleKycCommand,
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
import {
  handleInvestorStart,
  handleInvestorContact,
  handleInvestorPortfolio,
  handleInvestorYields,
  handleInvestorKyc,
  handleInvestorDocuments,
  handleInvestorHelp
} from './handlers/investorHandlers';

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

    // ─── INVESTOR BOT ──────────────────────────────────────────────────────────
    if (botKey === 'investor') {
      const message = body.message || {};
      const chat = message.chat || {};
      const text = (message.text || '').trim();
      const contact = message.contact || null;
      const chatId = chat.id;

      if (!chatId) return NextResponse.json({ ok: true });

      if (text.startsWith('/start')) {
        const payload = text.replace('/start', '').trim();
        await handleInvestorStart(botToken, chatId, payload, appUrl);
        return NextResponse.json({ ok: true });
      }

      if (contact && contact.phone_number) {
        await handleInvestorContact(botToken, chatId, contact, appUrl);
        return NextResponse.json({ ok: true });
      }

      if (text === '/portfolio' || text === '/holdings') {
        await handleInvestorPortfolio(botToken, chatId, appUrl);
        return NextResponse.json({ ok: true });
      }

      if (text === '/yields' || text === '/dividends') {
        await handleInvestorYields(botToken, chatId, appUrl);
        return NextResponse.json({ ok: true });
      }

      if (text === '/kyc' || text === '/verify') {
        await handleInvestorKyc(botToken, chatId, appUrl);
        return NextResponse.json({ ok: true });
      }

      if (text === '/documents' || text === '/docs') {
        await handleInvestorDocuments(botToken, chatId, appUrl);
        return NextResponse.json({ ok: true });
      }

      if (text === '/help') {
        await handleInvestorHelp(botToken, chatId, appUrl);
        return NextResponse.json({ ok: true });
      }

      // Default investor fallback
      await handleInvestorHelp(botToken, chatId, appUrl);
      return NextResponse.json({ ok: true });
    }

    // ─── TEAM / MANAGEMENT BOT ───────────────────────────────────────────────

    // 1. HANDLE CALLBACK QUERIES (INLINE KEYBOARD BUTTON PRESSES)
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
        else if (callbackData === 'cmd_applications') await handleApplicationsCommand(botToken, chatId, appUrl);
        else if (callbackData === 'cmd_kyc') await handleKycCommand(botToken, chatId, appUrl);
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
          const { data: updatedPayout } = await supabase
            .from('payout_requests')
            .update({ status: 'Cleared', cleared_at: new Date().toISOString() })
            .eq('id', payoutId)
            .select('*, promoters(full_name, phone, user_id), team(full_name, phone, telegram_chat_id)')
            .single();

          await sendTelegramMessage(botToken, chatId, `✅ Commission Payout #${payoutId.slice(0, 6)} marked as Cleared!`);

          // Notify promoter on Telegram if they have linked chat ID
          if (updatedPayout) {
            let promoterChatId = updatedPayout.team?.telegram_chat_id;
            if (!promoterChatId && updatedPayout.promoter_id) {
              const { data: teamP } = await supabase
                .from('team')
                .select('telegram_chat_id')
                .or(`id.eq.${updatedPayout.promoter_id},phone.eq.${updatedPayout.promoters?.phone || 'none'}`)
                .maybeSingle();
              promoterChatId = teamP?.telegram_chat_id;
            }

            if (promoterChatId) {
              await sendTelegramMessage(
                botToken, 
                promoterChatId, 
                `🎉 <b>Commission Payout Disbursed!</b>\n\nYour withdrawal request for <b>৳${Number(updatedPayout.amount_bdt || 0).toLocaleString()}</b> via ${updatedPayout.disbursement_channel || 'bKash'} has been <b>Approved & Cleared</b> by Executive Admin.`
              );
            }
          }
        } else if (callbackData.startsWith('reject_payout:')) {
          const payoutId = callbackData.split(':')[1];
          const { data: rejectedPayout } = await supabase
            .from('payout_requests')
            .update({ status: 'Rejected' })
            .eq('id', payoutId)
            .select('*, promoters(full_name, phone, user_id), team(full_name, phone, telegram_chat_id)')
            .single();

          await sendTelegramMessage(botToken, chatId, `❌ Commission Payout #${payoutId.slice(0, 6)} Rejected.`);

          // Notify promoter on Telegram of rejection
          if (rejectedPayout) {
            let promoterChatId = rejectedPayout.team?.telegram_chat_id;
            if (!promoterChatId && rejectedPayout.promoter_id) {
              const { data: teamP } = await supabase
                .from('team')
                .select('telegram_chat_id')
                .or(`id.eq.${rejectedPayout.promoter_id},phone.eq.${rejectedPayout.promoters?.phone || 'none'}`)
                .maybeSingle();
              promoterChatId = teamP?.telegram_chat_id;
            }

            if (promoterChatId) {
              await sendTelegramMessage(
                botToken,
                promoterChatId,
                `⚠️ <b>Commission Payout Update</b>\n\nYour withdrawal request for <b>৳${Number(rejectedPayout.amount_bdt || 0).toLocaleString()}</b> via ${rejectedPayout.disbursement_channel || 'bKash'} could not be processed and has been marked as <b>Declined</b>.\n\nPlease reach out to your managing partner or Executive Admin.`
              );
            }
          }
        }
      }

      return NextResponse.json({ ok: true });
    }

    // 2. HANDLE TEXT MESSAGES, CONTACT SHARING & WEBAPP DATA
    const message = body.message || {};
    const chat = message.chat || {};
    const text = (message.text || '').trim();
    const contact = message.contact || null;
    const webAppData = message.web_app_data || null;
    const chatId = chat.id;

    if (!chatId) {
      return NextResponse.json({ ok: true });
    }

    // A) Handle WebApp sendData payloads
    if (webAppData && webAppData.data) {
      const dataStr = webAppData.data;
      if (dataStr.startsWith('pin_issued:')) {
        const pinCode = dataStr.split(':')[1];
        await sendTelegramMessage(botToken, chatId, `🔑 <b>New Web Access PIN Issued!</b>\n\nPIN Code: <code>${pinCode}</code>\n<i>Valid for 15 minutes.</i>`);
      } else if (dataStr.startsWith('survey_complete:')) {
        await sendTelegramMessage(botToken, chatId, `🎉 <b>Investor Survey Logged!</b>\n\nYour prospect has been saved to the CRM pipeline. Your managing partner has been notified.`);
      } else if (dataStr.startsWith('payout_approved:')) {
        const pid = dataStr.split(':')[1];
        await sendTelegramMessage(botToken, chatId, `✅ <b>Commission Payout Cleared!</b>\nPayout #${pid.slice(0,6)} has been marked as cleared.`);
      }
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

    // H) /applications Command (NEW)
    if (text === '/applications' || text === '/cohorts') {
      await handleApplicationsCommand(botToken, chatId, appUrl);
      return NextResponse.json({ ok: true });
    }

    // I) /kyc Command (NEW)
    if (text === '/kyc') {
      await handleKycCommand(botToken, chatId, appUrl);
      return NextResponse.json({ ok: true });
    }

    // J) /broadcast Command
    if (text.startsWith('/broadcast')) {
      const msg = text.replace('/broadcast', '').trim();
      await handleBroadcastCommand(botToken, chatId, msg);
      return NextResponse.json({ ok: true });
    }

    // K) /portfolio Command
    if (text === '/portfolio') {
      await handlePortfolioCommand(botToken, chatId, appUrl);
      return NextResponse.json({ ok: true });
    }

    // L) /tickets Command
    if (text === '/tickets') {
      await handleTicketsCommand(botToken, chatId, appUrl);
      return NextResponse.json({ ok: true });
    }

    // M) /mycode Command
    if (text === '/mycode') {
      await handleMyCodeCommand(botToken, chatId, appUrl);
      return NextResponse.json({ ok: true });
    }

    // N) /tier Command
    if (text === '/tier') {
      await handleTierCommand(botToken, chatId);
      return NextResponse.json({ ok: true });
    }

    // O) /earnings Command
    if (text === '/earnings') {
      await handleEarningsCommand(botToken, chatId);
      return NextResponse.json({ ok: true });
    }

    // P) /survey Command
    if (text === '/survey') {
      await handleSurveyCommand(botToken, chatId);
      return NextResponse.json({ ok: true });
    }

    // Q) /payout Command
    if (text === '/payout') {
      await handlePayoutCommand(botToken, chatId);
      return NextResponse.json({ ok: true });
    }

    // Fallback default response
    const defaultText = `🤖 <b>GRO10X Management AI Colleague</b>\n\nType /start to verify identity or /pin for a quick web access code.\nAvailable commands: /kpis, /alerts, /leads, /payouts, /applications, /kyc, /portfolio, /tickets, /mycode, /tier, /earnings, /survey, /broadcast`;
    await sendTelegramMessage(botToken, chatId, defaultText);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Telegram Webhook error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
