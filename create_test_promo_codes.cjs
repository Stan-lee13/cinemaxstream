const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://otelzbaiqeqlktawuuyv.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90ZWx6YmFpcWVxbGt0YXd1dXl2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMzODMzNzAsImV4cCI6MjA1ODk1OTM3MH0.LYP50GjlDI6-4OqDIQ5n-bMntOv4_UZAqCfYUdXd_7o'
);

async function createTestPromoCodes() {
  try {
    console.log('Creating test promo codes...');
    
    // First, try to create the premium_codes table if it doesn't exist
    const { error: tableError } = await supabase.rpc('create_premium_codes_table_if_not_exists');
    
    // Create test promo codes
    const { data, error } = await supabase
      .from('premium_codes')
      .insert([
        {
          code: 'TEST2024',
          is_active: true,
          max_uses: 10,
          current_uses: 0,
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
          notes: 'Test promo code for validation'
        },
        {
          code: 'SUMMER2024',
          is_active: true,
          max_uses: 5,
          current_uses: 0,
          expires_at: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(), // 60 days from now
          notes: 'Summer promotion'
        },
        {
          code: 'Stanley123.',
          is_active: true,
          max_uses: 1,
          current_uses: 0,
          notes: 'Original promo code'
        }
      ])
      .select();

    if (error) {
      console.error('Error creating promo codes:', error);
    } else {
      console.log('Successfully created promo codes:', data);
    }
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

createTestPromoCodes();