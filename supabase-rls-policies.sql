-- Script para configurar políticas RLS en Supabase
-- Ejecutar esto en el SQL Editor de Supabase

-- 1. Habilitar RLS en las tablas
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;

-- 2. Políticas para la tabla transactions
-- Política para INSERT: usuarios pueden insertar sus propias transacciones
CREATE POLICY "Users can insert their own transactions" ON transactions
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Política para SELECT: usuarios pueden ver sus propias transacciones
CREATE POLICY "Users can view their own transactions" ON transactions
FOR SELECT USING (auth.uid() = user_id);

-- Política para UPDATE: usuarios pueden actualizar sus propias transacciones
CREATE POLICY "Users can update their own transactions" ON transactions
FOR UPDATE USING (auth.uid() = user_id);

-- Política para DELETE: usuarios pueden eliminar sus propias transacciones
CREATE POLICY "Users can delete their own transactions" ON transactions
FOR DELETE USING (auth.uid() = user_id);

-- 3. Políticas para la tabla budgets
-- Política para INSERT: usuarios pueden insertar sus propios presupuestos
CREATE POLICY "Users can insert their own budgets" ON budgets
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Política para SELECT: usuarios pueden ver sus propios presupuestos
CREATE POLICY "Users can view their own budgets" ON budgets
FOR SELECT USING (auth.uid() = user_id);

-- Política para UPDATE: usuarios pueden actualizar sus propios presupuestos
CREATE POLICY "Users can update their own budgets" ON budgets
FOR UPDATE USING (auth.uid() = user_id);

-- Política para DELETE: usuarios pueden eliminar sus propios presupuestos
CREATE POLICY "Users can delete their own budgets" ON budgets
FOR DELETE USING (auth.uid() = user_id);

-- 4. Políticas para la tabla accounts
-- Política para INSERT: usuarios pueden insertar sus propias cuentas
CREATE POLICY "Users can insert their own accounts" ON accounts
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Política para SELECT: usuarios pueden ver sus propias cuentas
CREATE POLICY "Users can view their own accounts" ON accounts
FOR SELECT USING (auth.uid() = user_id);

-- Política para UPDATE: usuarios pueden actualizar sus propias cuentas
CREATE POLICY "Users can update their own accounts" ON accounts
FOR UPDATE USING (auth.uid() = user_id);

-- Política para DELETE: usuarios pueden eliminar sus propias cuentas
CREATE POLICY "Users can delete their own accounts" ON accounts
FOR DELETE USING (auth.uid() = user_id);

-- 5. Verificar que las políticas se crearon correctamente
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename IN ('transactions', 'budgets', 'accounts')
ORDER BY tablename, policyname;
