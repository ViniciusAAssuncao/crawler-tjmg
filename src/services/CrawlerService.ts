import axios from 'axios';
import cheerio from 'cheerio';
import Logger from '../utils/Logger';
import { ProcessDetails } from '../interfaces/ProcessDetails';

class CrawlerService {
  public async fetchProcessDetails(
    dynamicParam: string,
  ): Promise<ProcessDetails | null> {
    try {
      const url = `https://pje-consulta-publica.tjmg.jus.br/pje/ConsultaPublica/DetalheProcessoConsultaPublica/listView.seam?ca=${dynamicParam}`;
      const response = await axios.get(url);
      Logger.info('Página carregada');

      const $ = cheerio.load(response.data);
      Logger.info('HTML analisado');

      const processDetails: ProcessDetails = {
        numeroProcesso: $('label:contains("Número Processo")')
          .closest('.propertyView')
          .find('.value .col-sm-12')
          .text()
          .trim(),
        dataDistribuicao: $('label:contains("Data da Distribuição")')
          .closest('.propertyView')
          .find('.value')
          .text()
          .trim(),
        classeJudicial: $('label:contains("Classe Judicial")')
          .closest('.propertyView')
          .find('.value')
          .text()
          .trim(),
        assunto: $('label:contains("Assunto")')
          .closest('.propertyView')
          .find('.value .col-sm-12')
          .text()
          .trim(),
        jurisdicao: $('label:contains("Jurisdição")')
          .closest('.propertyView')
          .find('.value')
          .text()
          .trim(),
        orgaoJulgador: $('label:contains("Órgão Julgador")')
          .closest('.propertyView')
          .find('.value')
          .text()
          .trim(),
        movimentos: [],
      };

      const extractMovements = (): string[] => {
        const movements: string[] = [];
        $('table.rich-table tbody tr').each((_, element) => {
          const movementElement = $(element).find(
            'td.rich-table-cell.text-break.text-left span',
          );
          if (movementElement.length) {
            movements.push(movementElement.text().trim());
          }
        });
        return movements;
      };

      processDetails.movimentos = extractMovements().sort((a, b) => {
        const dateA = new Date(a.split(' - ')[0]);
        const dateB = new Date(b.split(' - ')[0]);
        return dateB.getTime() - dateA.getTime();
      });

      return processDetails;
    } catch (error) {
      Logger.error((error as Error).message);
      return null;
    }
  }
}

export default CrawlerService;
