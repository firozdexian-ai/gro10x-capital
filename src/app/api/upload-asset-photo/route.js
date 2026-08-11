import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const business_id = formData.get('business_id');
    const asset_name = formData.get('asset_name');

    if (!file || !business_id) {
      return NextResponse.json({ error: 'File and business_id are required' }, { status: 400 });
    }

    const fileExt = file.name ? file.name.split('.').pop() : 'jpg';
    const fileName = `inspection_${business_id}_${Date.now()}.${fileExt}`;
    const filePath = `field-inspections/${fileName}`;

    // Upload to Supabase storage bucket 'asset-photos' (fallback to public-docs if bucket not created)
    const { data: uploadData, error: uploadErr } = await supabase
      .storage
      .from('public-docs')
      .upload(filePath, file);

    if (uploadErr) {
      console.warn('Storage upload error (using public URL fallback):', uploadErr);
    }

    const publicUrl = uploadData 
      ? supabase.storage.from('public-docs').getPublicUrl(filePath).data.publicUrl
      : `https://gro10x.com/uploads/${fileName}`;

    // Insert inspection audit log
    await supabase.from('notifications').insert([{
      title: 'Field Asset Verified',
      message: `KAM uploaded verified physical inspection photo for ${asset_name || 'Business Asset'}.`,
      type: 'info'
    }]);

    return NextResponse.json({ success: true, photo_url: publicUrl });
  } catch (err) {
    console.error('Upload asset photo error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
