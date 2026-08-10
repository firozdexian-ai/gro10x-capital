import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request) {
  try {
    const { pre_profile_id } = await request.json();

    if (!pre_profile_id) {
      return NextResponse.json({ error: 'pre_profile_id is required' }, { status: 400 });
    }

    // 1. Fetch pre-profile
    const { data: preProfile, error: fetchErr } = await supabase
      .from('investor_pre_profiles')
      .select('*, inquiry_leads(name, phone, target_project_id)')
      .eq('id', pre_profile_id)
      .single();

    if (fetchErr || !preProfile) {
      return NextResponse.json({ error: 'Pre-profile not found' }, { status: 404 });
    }

    const botUsername = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || 'GRO10XBot';
    const inviteLink = `https://t.me/${botUsername}?start=verify_${preProfile.id}`;

    // 2. Log notification record
    await supabase.from('notifications').insert([{
      user_id: preProfile.submitted_by_promoter_id || pre_profile_id,
      title: 'Telegram Investor Invite Dispatched',
      message: `Bot invite generated for ${preProfile.full_name} (${preProfile.phone}). Verification link: ${inviteLink}`,
      type: 'Telegram_Invite'
    }]);

    // 3. Update status to Telegram_Invite_Sent
    const { error: updateErr } = await supabase
      .from('investor_pre_profiles')
      .update({
        survey_status: 'Telegram_Invite_Sent',
        telegram_invite_sent_at: new Date().toISOString()
      })
      .eq('id', pre_profile_id);

    if (updateErr) throw updateErr;

    // Update parent lead status if present
    if (preProfile.lead_id) {
      await supabase
        .from('inquiry_leads')
        .update({ status: 'Telegram_Invite_Sent' })
        .eq('id', preProfile.lead_id);
    }

    return NextResponse.json({
      success: true,
      invite_link: inviteLink,
      phone: preProfile.phone,
      full_name: preProfile.full_name
    });

  } catch (error) {
    console.error('Error in send-investor-invite API:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
