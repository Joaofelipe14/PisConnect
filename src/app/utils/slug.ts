/**
 * Gera um slug a partir do nome e CRP do psicólogo
 * Exemplo: "João Silva" + "CRP 12/34567" -> "joao-silva-crp-12-34567"
 */
export function gerarSlug(nome: string, crp: string): string {
  if (!nome) return '';
  
  // Normaliza o nome: remove acentos, converte para minúsculas, remove caracteres especiais
  const nomeNormalizado = nome
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // Remove caracteres especiais
    .replace(/\s+/g, '-') // Substitui espaços por hífens
    .replace(/-+/g, '-') // Remove hífens duplicados
    .replace(/^-|-$/g, ''); // Remove hífens no início e fim

  // Normaliza o CRP: remove "CRP", espaços e caracteres especiais, mantém apenas números e hífens
  let crpNormalizado = '';
  if (crp) {
    crpNormalizado = crp
      .toLowerCase()
      .replace(/crp\s*/gi, '') // Remove "CRP"
      .replace(/\s+/g, '-') // Substitui espaços por hífens
      .replace(/[^0-9-]/g, '') // Remove tudo exceto números e hífens
      .replace(/-+/g, '-') // Remove hífens duplicados
      .replace(/^-|-$/g, ''); // Remove hífens no início e fim
  }

  // Combina nome e CRP
  if (crpNormalizado) {
    return `${nomeNormalizado}-crp-${crpNormalizado}`;
  }
  
  return nomeNormalizado;
}

/**
 * Extrai o nome e CRP de um slug
 * Exemplo: "joao-silva-crp-12-34567" -> { nome: "João Silva", crp: "12/34567" }
 * Nota: Esta função não pode recuperar o nome original com acentos, apenas uma aproximação
 */
export function extrairDadosDoSlug(slug: string): { nome: string; crp: string } | null {
  if (!slug) return null;
  
  // Procura pelo padrão "-crp-" no slug
  const crpIndex = slug.toLowerCase().indexOf('-crp-');
  
  if (crpIndex === -1) {
    // Se não tem CRP, retorna apenas o nome
    return {
      nome: slug.replace(/-/g, ' '),
      crp: ''
    };
  }
  
  const nomeSlug = slug.substring(0, crpIndex);
  const crpSlug = slug.substring(crpIndex + 5); // +5 para pular "-crp-"
  
  return {
    nome: nomeSlug.replace(/-/g, ' '),
    crp: crpSlug.replace(/-/g, '/')
  };
}
