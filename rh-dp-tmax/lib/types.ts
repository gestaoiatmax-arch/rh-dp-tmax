export type CargoSistema = "diretor" | "gerente" | "rh" | "assistente";

export interface Perfil {
  id: string;
  nome_completo: string;
  cargo_no_sistema: CargoSistema;
  ativo: boolean;
}

export interface Empresa {
  id: string;
  razao_social: string;
  cnpj: string;
  ativo: boolean;
}

export type StatusColaborador = "ativo" | "afastado" | "ferias" | "desligado";

export interface Colaborador {
  id: string;
  empresa_id: string;
  nome_completo: string;
  cpf: string;
  rg: string | null;
  data_nascimento: string | null;
  telefone: string | null;
  endereco: string | null;
  cargo_atual: string | null;
  setor: string | null;
  data_admissao: string;
  status: StatusColaborador;
  foto_url: string | null;
  empresas?: Empresa;
}

export type TipoDocumento =
  | "rg"
  | "cpf"
  | "pis_pasep"
  | "comprovante_residencia"
  | "certidao_nascimento_casamento"
  | "titulo_eleitor"
  | "carteira_reservista";

export const LABEL_DOCUMENTO: Record<TipoDocumento, string> = {
  rg: "RG",
  cpf: "CPF",
  pis_pasep: "PIS/PASEP",
  comprovante_residencia: "Comprovante de residência",
  certidao_nascimento_casamento: "Certidão de nascimento/casamento",
  titulo_eleitor: "Título de eleitor",
  carteira_reservista: "Carteira de reservista",
};

export interface ColaboradorDocumento {
  id: string;
  colaborador_id: string;
  tipo_documento: TipoDocumento;
  entregue: boolean;
  data_entrega: string | null;
  arquivo_url: string | null;
  observacao: string | null;
}

export interface ExameAdmissional {
  id: string;
  colaborador_id: string;
  data_exame: string | null;
  apto: boolean | null;
  arquivo_aso_url: string | null;
  observacao: string | null;
}

export interface ValeTransporte {
  id: string;
  colaborador_id: string;
  optante: boolean;
  valor: number | null;
}

export type TipoBeneficio = "vale_alimentacao" | "odontoprev";

export const LABEL_BENEFICIO: Record<TipoBeneficio, string> = {
  vale_alimentacao: "Vale-alimentação",
  odontoprev: "Odontoprev",
};

export interface Beneficio {
  id: string;
  colaborador_id: string;
  tipo_beneficio: TipoBeneficio;
  numero_cartao: string | null;
  status: "pendente" | "ativo" | "cancelado";
  data_ativacao: string | null;
}

export interface CadastroPonto {
  id: string;
  colaborador_id: string;
  matricula_ponto: string | null;
  cadastrado: boolean;
  data_cadastro: string | null;
}

export interface ExamePeriodico {
  id: string;
  colaborador_id: string;
  data_exame: string;
  proxima_data: string | null;
  arquivo_url: string | null;
}

export interface Ferias {
  id: string;
  colaborador_id: string;
  periodo_aquisitivo_inicio: string;
  periodo_aquisitivo_fim: string;
  dias_direito: number;
  dias_gozados: number;
  periodo_gozo_inicio: string | null;
  periodo_gozo_fim: string | null;
  observacao: string | null;
}

export type TipoAfastamento = "atestado_medico" | "inss" | "licenca_outra";

export const LABEL_AFASTAMENTO: Record<TipoAfastamento, string> = {
  atestado_medico: "Atestado médico",
  inss: "INSS",
  licenca_outra: "Outra licença",
};

export interface AfastamentoAtestado {
  id: string;
  colaborador_id: string;
  tipo: TipoAfastamento;
  data_inicio: string;
  data_fim: string | null;
  dias: number | null;
  cid: string | null;
  encaminhado_inss: boolean;
  arquivo_atestado_url: string | null;
  observacao: string | null;
}

export interface HistoricoCargoSalario {
  id: string;
  colaborador_id: string;
  data_evento: string;
  cargo_anterior: string | null;
  cargo_novo: string | null;
  salario_anterior: number | null;
  salario_novo: number | null;
  motivo: "reajuste" | "promocao" | "dissidio" | "admissao" | "outro" | null;
  observacao: string | null;
}
