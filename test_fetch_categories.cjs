const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://dxrncbevjnfasvkcqhbj.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR4cm5jYmV2am5mYXN2a2NxaGJqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc2MzQwMDEsImV4cCI6MjEwMzIxMDAwMX0.BBSkybNT_yoLQV5RI6xcKAnzHsUSazf3SCnMzLSTgkA';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkCategories() {
  console.log("=== SUPABASE CATEGORIES TABLE ===");
  const { data: cats, error: catErr } = await supabase.from('categories').select('*').order('code', { ascending: true });
  console.log("Categories Error:", catErr);
  console.log("Categories Count:", cats?.length);
  console.log("Categories Data:", JSON.stringify(cats, null, 2));

  console.log("\n=== SUPABASE SUB_CATEGORIES TABLE ===");
  const { data: subs, error: subErr } = await supabase.from('sub_categories').select('*');
  console.log("SubCategories Error:", subErr);
  console.log("SubCategories Count:", subs?.length);

  console.log("\n=== SUPABASE DESIGN_TEMPLATES TABLE CATEGORIES ===");
  const { data: tpls, error: tplErr } = await supabase.from('design_templates').select('category, sub_category');
  console.log("Templates Count:", tpls?.length);
  const templateCats = [...new Set(tpls?.map(t => t.category))];
  console.log("Unique Categories in design_templates:", templateCats);
}

checkCategories();
