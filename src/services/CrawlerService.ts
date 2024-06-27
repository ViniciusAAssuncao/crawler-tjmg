import cheerio from 'cheerio';
import Logger from '../utils/Logger';
import { ProcessDetails } from '../interfaces/ProcessDetails';
import axios, { AxiosInstance } from 'axios';

class CrawlerService {
  private readonly axiosInstance: AxiosInstance;
  private readonly PJE_HEADERS = {
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:127.0) Gecko/20100101 Firefox/127.0',
    Accept: '*/*',
    'Accept-Language': 'pt-BR,pt;q=0.8,en-US;q=0.5,en;q=0.3',
    'Accept-Encoding': 'gzip, deflate, br, zstd',
    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
    Connection: 'keep-alive',
    'Sec-Fetch-Dest': 'empty',
    'Sec-Fetch-Mode': 'cors',
    'Sec-Fetch-Site': 'same-origin',
    'Sec-GPC': '1',
  };

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: 'https://pje-consulta-publica.tjmg.jus.br/pje/ConsultaPublica',
      headers: this.PJE_HEADERS,
      maxRedirects: 0,
    });
  }

  private async getSessionCookies(): Promise<string> {
    const response = await this.axiosInstance.get('/listView.seam', {
      validateStatus: (status) => status >= 200 && status < 400,
    });
    const cookies = response.headers['set-cookie'];
    return cookies?.join('; ') || '';
  }

  public async fetchProcessDetails(
    numeroProcesso: string,
  ): Promise<ProcessDetails | null> {
    try {
      const cookies = await this.getSessionCookies();
      const body = this.createRequestBody(numeroProcesso);

      const response = await this.axiosInstance.post('/listView.seam', body, {
        headers: { ...this.PJE_HEADERS, Cookie: cookies },
        maxRedirects: 0,
        validateStatus: (status) => status >= 200 && status < 400,
      });

      const processId = this.extractProcessId(response.data);
      if (!processId) throw new Error('ID do processo não encontrado');

      const detailsResponse = await this.axiosInstance.get(
        `/DetalheProcessoConsultaPublica/listView.seam?ca=${processId}`,
        {
          headers: { ...this.PJE_HEADERS, Cookie: cookies },
          maxRedirects: 0,
          validateStatus: (status) => status >= 200 && status < 400,
        },
      );

      Logger.info('Página de detalhes carregada');
      return this.parseProcessDetails(detailsResponse.data);
    } catch (error) {
      Logger.error((error as Error).message);
      return null;
    }
  }

  private createRequestBody(numeroProcesso: string): string {
    return `AJAXREQUEST=_viewRoot&fPP:numProcesso-inputNumeroProcessoDecoration:numProcesso-inputNumeroProcesso=${numeroProcesso}&mascaraProcessoReferenciaRadio=on&fPP:j_id150:processoReferenciaInput=&fPP:dnp:nomeParte=&fPP:j_id168:nomeSocial=&fPP:j_id177:alcunha=&fPP:j_id186:nomeAdv=&fPP:j_id195:classeProcessualProcessoHidden=&tipoMascaraDocumento=on&fPP:dpDec:documentoParte=&fPP:Decoration:numeroOAB=&fPP:Decoration:j_id230=&fPP:Decoration:estadoComboOAB=org.jboss.seam.ui.NoSelectionConverter.noSelectionValue&fPP=fPP&autoScroll=&javax.faces.ViewState=j_id1&fPP:j_id236=fPP:j_id236&AJAX:EVENTS_COUNT`;
  }

  private extractProcessId(responseData: string): string | null {
    const regex =
      /openPopUp\('Consulta pública','\/pje\/ConsultaPublica\/DetalheProcessoConsultaPublica\/listView\.seam\?ca=([a-f0-9]+)'\)/;
    const match = regex.exec(responseData);
    return match && match.length > 1 ? match[1] : null;
  }

  private parseProcessDetails(pageContent: string): ProcessDetails {
    const detailsPage = cheerio.load(pageContent);

    const getFieldValue = (label: string) =>
      detailsPage(`label:contains("${label}")`)
        .closest('.propertyView')
        .find('.value .col-sm-12')
        .text()
        .trim();

    const processDetails: ProcessDetails = {
      numeroProcesso: getFieldValue('Número Processo'),
      dataDistribuicao: getFieldValue('Data da Distribuição'),
      classeJudicial: getFieldValue('Classe Judicial'),
      assunto: getFieldValue('Assunto'),
      jurisdicao: getFieldValue('Jurisdição'),
      orgaoJulgador: getFieldValue('Órgão Julgador'),
      movimentos: this.extractMovements(pageContent),
    };

    return processDetails;
  }

  private extractMovements(pageContent: string): string[] {
    const movements: string[] = [];
    const page = cheerio.load(pageContent);
    page('table.rich-table tbody tr').each((_, element) => {
      const movementElement = page(element).find(
        'td.rich-table-cell.text-break.text-left span',
      );
      if (movementElement.length) {
        movements.push(movementElement.text().trim());
      }
    });
    return movements.sort(
      (a, b) =>
        new Date(b.split(' - ')[0]).getTime() -
        new Date(a.split(' - ')[0]).getTime(),
    );
  }
}

export default CrawlerService;
