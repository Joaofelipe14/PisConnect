campos do banco 


-- Tabela de Psicólogos
CREATE TABLE psicologos (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    nome text NOT NULL,
    email text UNIQUE NOT NULL,
    senha_hash text NOT NULL,
    crp text UNIQUE NOT NULL,
    foto_url text,
    areas_atuacao text[],
    abordagem_terapeutica text,
    resumo text,
    valor_consulta numeric(10,2) NOT NULL,
    redes_sociais jsonb,
    whatsapp text,
    horarios_disponiveis jsonb, -- ex: [{"dia":"segunda","inicio":"09:00","fim":"17:00"}]
    criado_em timestamptz DEFAULT now()
);

-- Tabela de Pacientes
CREATE TABLE pacientes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    nome text NOT NULL,
    email text UNIQUE NOT NULL,
    senha_hash text NOT NULL,
    criado_em timestamptz DEFAULT now()
);
