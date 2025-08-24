// Script para verificar la conexión a Supabase
const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase
const supabaseUrl = 'https://taybquizhxriczwvrjsu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRheWJxdWl6aHhyaWN6d3ZyanN1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1MzE0MTAsImV4cCI6MjA2MzEwNzQxMH0.n9eSF-OkJFiPwe8XzmAWJoS_Ggk60eiLonGnwp0mbyQ';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSupabaseConnection() {
  console.log('🔍 Verificando conexión a Supabase...');
  
  try {
    // Verificar conexión básica
    const { data, error } = await supabase
      .from('transactions')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('❌ Error conectando a Supabase:', error);
      console.error('❌ Detalles:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
    } else {
      console.log('✅ Conexión a Supabase exitosa');
      console.log('✅ Tabla transactions existe');
    }
  } catch (err) {
    console.error('❌ Error inesperado:', err);
  }
}

async function checkTables() {
  console.log('\n🔍 Verificando tablas...');
  
  const tables = ['transactions', 'budgets', 'accounts'];
  
  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);
      
      if (error) {
        console.error(`❌ Error en tabla ${table}:`, error.message);
      } else {
        console.log(`✅ Tabla ${table} existe y es accesible`);
      }
    } catch (err) {
      console.error(`❌ Error verificando tabla ${table}:`, err.message);
    }
  }
}

async function main() {
  await checkSupabaseConnection();
  await checkTables();
}

main().catch(console.error);

