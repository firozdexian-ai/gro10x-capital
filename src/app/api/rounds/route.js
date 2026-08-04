import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';

// GET all active funding rounds
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('funding_projects')
      .select('*, businesses(*)');

    if (error) {
      return NextResponse.json({
        success: true,
        source: 'mock_fallback',
        rounds: [
          { id: '101', project_title: 'Mirpur Flagship Store Expansion', funding_type: 'Franchise', target_raise_bdt: 12000000, amount_raised_bdt: 7800000, yield_model: '18% IRR' },
          { id: '102', project_title: 'Coffee Bean Import LC Financing', funding_type: 'Short-Term Debt', target_raise_bdt: 5000000, amount_raised_bdt: 750000, yield_model: '24% APR' },
          { id: '103', project_title: 'Chittagong Distribution Rights', funding_type: 'Distribution', target_raise_bdt: 20000000, amount_raised_bdt: 15000000, yield_model: '15% Gross Sales' }
        ]
      });
    }

    return NextResponse.json({ success: true, source: 'supabase', rounds: data });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// POST new funding round
export async function POST(request) {
  try {
    const body = await request.json();
    const { data, error } = await supabase
      .from('funding_projects')
      .insert([body])
      .select();

    if (error) throw error;
    return NextResponse.json({ success: true, data });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}
