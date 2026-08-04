import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';

// Telegram Webhook Handler (Receives POST requests from Telegram Bot API)
export async function POST(request) {
  try {
    const body = await request.json();
    
    // Extract message details if available
    const message = body.message || {};
    const chat = message.chat || {};
    const text = message.text || '';
    const sender = message.from || {};

    let replyText = '👋 Welcome to GRO10X Capital Telegram Bot!\n\nAvailable Commands:\n/audit - Query monthly outlet balance sheet\n/lead - Log new investor lead\n/deals - View active investment rounds';

    if (text.startsWith('/audit')) {
      replyText = '📊 *KAM Physical Audit Report*\n\nOutlet: ORO Roasters (Mirpur)\nCash in Hand: ৳45,000\nStock Inventory: ৳250,000\nReceivables: ৳12,000\nAI Health Score: *88/100 (Verified)*';
    } else if (text.startsWith('/lead')) {
      replyText = '🤝 *Lead Capture Confirmation*\n\nYour lead has been saved to your Promoter CRM portfolio.\nProgress: 39/50 Leads (78% to Link Unlock)';
    } else if (text.startsWith('/deals')) {
      replyText = '🔥 *Active Investment Deals*\n\n1. ORO Roasters Mirpur (18% Franchise Yield)\n2. Coffee Bean LC (24% APR Short-Term Debt)\n3. Chittagong Distribution (15% Sales)';
    }

    // Prepare Telegram Bot API response payload
    const telegramResponse = {
      method: 'sendMessage',
      chat_id: chat.id || 123456789,
      text: replyText,
      parse_mode: 'Markdown'
    };

    return NextResponse.json(telegramResponse);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
