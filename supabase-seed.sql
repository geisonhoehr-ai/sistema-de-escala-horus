-- ============================================
-- Sistema de Escala Horus - Dados Iniciais
-- ============================================

-- ============================================
-- 1. Tipos de Indisponibilidade (Seed Data)
-- ============================================
INSERT INTO unavailability_types (id, name, description)
VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'Férias', 'Férias regulamentares'),
  ('550e8400-e29b-41d4-a716-446655440002', 'Dispensa Médica', 'Afastamento por motivo de saúde'),
  ('550e8400-e29b-41d4-a716-446655440003', 'Missão', 'Em missão oficial'),
  ('550e8400-e29b-41d4-a716-446655440004', 'Curso', 'Participando de curso de capacitação'),
  ('550e8400-e29b-41d4-a716-446655440005', 'Licença', 'Licença especial')
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- 2. Configurações Iniciais
-- ============================================
INSERT INTO configurations (id, key, value, description)
VALUES
  ('660e8400-e29b-41d4-a716-446655440001', 'MAX_CONSECUTIVE_SERVICES', '2', 'Número máximo de serviços consecutivos permitidos'),
  ('660e8400-e29b-41d4-a716-446655440002', 'MIN_REST_DAYS', '1', 'Número mínimo de dias de descanso entre serviços'),
  ('660e8400-e29b-41d4-a716-446655440003', 'NOTIFICATION_DAYS_ADVANCE', '7', 'Dias de antecedência para notificações de escala'),
  ('660e8400-e29b-41d4-a716-446655440004', 'WORKING_HOURS_START', '08:00', 'Horário padrão de início do expediente'),
  ('660e8400-e29b-41d4-a716-446655440005', 'WORKING_HOURS_END', '18:00', 'Horário padrão de fim do expediente')
ON CONFLICT (key) DO NOTHING;

-- ============================================
-- 3. Militares de Exemplo (Opcional)
-- ============================================
INSERT INTO military (id, name, rank, unit, status, email, phone, associated_scales)
VALUES
  (
    '770e8400-e29b-41d4-a716-446655440001',
    'Carlos Silva',
    'Capitão',
    '1º Batalhão',
    'Active',
    'carlos.silva@exemplo.com',
    '(11) 99999-1111',
    '{}'
  ),
  (
    '770e8400-e29b-41d4-a716-446655440002',
    'Ana Souza',
    'Tenente',
    'Comando Geral',
    'Active',
    'ana.souza@exemplo.com',
    '(11) 99999-2222',
    '{}'
  ),
  (
    '770e8400-e29b-41d4-a716-446655440003',
    'Pedro Oliveira',
    'Sargento',
    'Logística',
    'Active',
    'pedro.oliveira@exemplo.com',
    '(11) 99999-3333',
    '{}'
  ),
  (
    '770e8400-e29b-41d4-a716-446655440004',
    'Maria Santos',
    'Tenente',
    '2º Batalhão',
    'Active',
    'maria.santos@exemplo.com',
    '(11) 99999-4444',
    '{}'
  ),
  (
    '770e8400-e29b-41d4-a716-446655440005',
    'João Costa',
    'Major',
    'Estado Maior',
    'Active',
    'joao.costa@exemplo.com',
    '(11) 99999-5555',
    '{}'
  )
ON CONFLICT (email) DO NOTHING;

-- ============================================
-- 4. Escala de Exemplo
-- ============================================
INSERT INTO scales (id, name, description, associated_military_ids)
VALUES
  (
    '880e8400-e29b-41d4-a716-446655440001',
    'Escala Oficial de Dia',
    'Escala diária para oficiais de dia ao regimento',
    ARRAY[
      '770e8400-e29b-41d4-a716-446655440001',
      '770e8400-e29b-41d4-a716-446655440002',
      '770e8400-e29b-41d4-a716-446655440003',
      '770e8400-e29b-41d4-a716-446655440004',
      '770e8400-e29b-41d4-a716-446655440005'
    ]::text[]
  )
ON CONFLICT DO NOTHING;

-- ============================================
-- 5. Notificação de Exemplo
-- ============================================
INSERT INTO notifications (message, type, read)
VALUES
  ('Sistema de Escala Horus inicializado com sucesso!', 'success', false),
  ('Lembre-se de configurar as escalas do próximo mês', 'info', false)
ON CONFLICT DO NOTHING;

-- ============================================
-- NOTA IMPORTANTE
-- ============================================
-- Para criar um usuário administrador, você precisa:
-- 1. Ir até Supabase Dashboard > Authentication > Users
-- 2. Clicar em "Add user" > "Create new user"
-- 3. Inserir email e senha
-- 4. Após criar, o perfil será criado automaticamente pelo trigger
-- 5. Atualize o role do usuário para 'Admin':
--
-- UPDATE profiles
-- SET role = 'Admin'
-- WHERE email = 'seu-email@exemplo.com';
--
-- ============================================
