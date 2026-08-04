import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';

// GET all enlisted businesses
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('businesses')
      .select('*, founders(*)');

    if (error) {
      // Fallback mock data if database is still initializing
      return NextResponse.json({
        success: true,
        source: 'mock_fallback',
        businesses: [
          { id: '1', brand_name: 'ORO Roasters - Mirpur', ai_health_score: 88, is_enlisted: true, industry_sector: 'Food & Beverage', operational_months: 36 },
          { id: '2', brand_name: 'ORO Roasters - Banani', ai_health_score: 92, is_enlisted: true, industry_sector: 'Food & Beverage', operational_months: 14 },
          { id: '3', brand_name: 'Segreto Hub - Dhanmondi', ai_health_score: 84, is_enlisted: true, industry_sector: 'Food & Beverage', operational_months: 20 }
        ]
      });
    }

    return NextResponse.json({ success: true, source: 'supabase', businesses: data });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// POST new business enlistment
export async function POST(request) {
  try {
    const body = await request.json();
    const { data, error } = await supabase
      .from('businesses')
      .insert([body])
      .select();

    if (error) throw error;
    return NextResponse.json({ success: true, data });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}
