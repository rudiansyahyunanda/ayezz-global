const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://dxrncbevjnfasvkcqhbj.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR4cm5jYmV2am5mYXN2a2NxaGJqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc2MzQwMDEsImV4cCI6MjEwMzIxMDAwMX0.BBSkybNT_yoLQV5RI6xcKAnzHsUSazf3SCnMzLSTgkA';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function inspectImages() {
  const { data, error } = await supabase.from('design_templates').select('*').order('created_at', { ascending: false }).limit(6);
  if (data) {
    data.forEach((d, i) => {
      console.log(`[${i}] Name: ${d.name}`);
      console.log(`    Thumbnail: ${d.thumbnail}`);
      console.log(`    Images: ${JSON.stringify(d.images)}\n`);
    });
  }
}

inspectImages();
