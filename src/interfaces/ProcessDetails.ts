export interface ProcessDetails {
  numeroProcesso: string | null;
  dataDistribuicao: string | null;
  classeJudicial: string | null;
  assunto: string | null;
  jurisdicao: string | null;
  orgaoJulgador: string | null;
  movimentos: string[];
}
