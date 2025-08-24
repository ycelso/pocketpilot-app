// Script para verificar la estructura de la tabla transactions
const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase
const supabaseUrl = 'https://taybquizhxriczwvrjsu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRheWJxdWl6aHhyaWN6d3ZyanN1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1MzE0MTAsImV4cCI6MjA2MzEwNzQxMH0.n9eSF-OkJFiPwe8XzmAWJoS_Ggk60eiLonGnwp0mbyQ';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTableStructure() {
  console.log('🔍 Verificando estructura de la tabla transactions...');
  
  try {
    // Intentar obtener información de la tabla
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .limit(0);
    
    if (error) {
      console.error('❌ Error accediendo a la tabla:', error);
      return;
    }
    
    console.log('✅ Tabla transactions es accesible');
    
    // Intentar insertar una transacción de prueba
    console.log('\n🧪 Intentando insertar transacción de prueba...');
    
    const testTransaction = {
      user_id: 'test-user-id',
      amount: 100.00,
      type: 'expense',
      category: 'test',
      description: 'Test transaction',
      date: new Date().toISOString().split('T')[0],
      account_id: null
    };
    
    console.log('📝 Datos de prueba:', testTransaction);
    
    const { data: insertData, error: insertError } = await supabase
      .from('transactions')
      .insert(testTransaction)
      .select();
    
    if (insertError) {
      console.error('❌ Error insertando transacción de prueba:', insertError);
      console.error('❌ Detalles:', {
        message: insertError.message,
        details: insertError.details,
        hint: insertError.hint,
        code: insertError.code
      });
    } else {
      console.log('✅ Transacción de prueba insertada exitosamente:', insertData);
      
      // Limpiar la transacción de prueba
      if (insertData && insertData[0]) {
        const { error: deleteError } = await supabase
          .from('transactions')
          .delete()
          .eq('id', insertData[0].id);
        
        if (deleteError) {
          console.error('⚠️ Error eliminando transacción de prueba:', deleteError);
        } else {
          console.log('✅ Transacción de prueba eliminada');
        }
      }
    }
    
  } catch (err) {
    console.error('❌ Error inesperado:', err);
  }
}

async function main() {
  await checkTableStructure();
}

main().catch(console.error);

