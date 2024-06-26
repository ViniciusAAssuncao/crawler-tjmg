import puppeteer, { Browser, Page, Target } from 'puppeteer';
import PuppeteerConfig from '../config/PuppeteerConfig';
import Logger from '../utils/Logger';
import { ProcessDetails } from '../interfaces/ProcessDetails';

class CrawlerService {
  private browser!: Browser;

  private async init() {
    this.browser = await puppeteer.launch(PuppeteerConfig);
    Logger.info('Navegador iniciado');
  }

  public async fetchProcessDetails(
    processNumber: string,
  ): Promise<ProcessDetails | null> {
    try {
      await this.init();
      const page: Page = await this.browser.newPage();
      Logger.info('Nova aba aberta');
      await page.goto(
        'https://pje-consulta-publica.tjmg.jus.br/pje/ConsultaPublica/listView.seam',
      );
      Logger.info('Página carregada');

      await page.waitForSelector(
        '#fPP\\:numProcesso-inputNumeroProcessoDecoration\\:numProcesso-inputNumeroProcesso',
      );
      await page.type(
        '#fPP\\:numProcesso-inputNumeroProcessoDecoration\\:numProcesso-inputNumeroProcesso',
        processNumber,
      );
      Logger.info('Número do processo inserido');

      await page.waitForSelector('#fPP\\:searchProcessos');
      await page.click('#fPP\\:searchProcessos');
      Logger.info('Botão "Pesquisar" clicado');

      await page.waitForSelector('td.rich-table-cell');
      Logger.info('Tabela de resultados carregada');

      await page.evaluate(() => {
        const link = document.querySelector(
          'td.rich-table-cell a[title="Ver Detalhes"]',
        );
        if (link) (link as HTMLElement).click();
      });
      Logger.info('Link "Ver Detalhes" clicado');

      const newPagePromise: Promise<Page> = new Promise((resolve, reject) => {
        this.browser.once('targetcreated', async (target: Target) => {
          const newPage = await target.page();
          newPage
            ? resolve(newPage)
            : reject(new Error('Nova página não encontrada'));
        });
      });

      const newPage: Page = await newPagePromise;
      await newPage.waitForSelector('body');
      Logger.info('Nova aba carregada');

      const processDetails: ProcessDetails = await newPage.evaluate(() => {
        const getFieldText = (selector: string): string | null => {
          const element = document.querySelector(selector);
          return element ? element.textContent?.trim() || null : null;
        };

        return {
          numeroProcesso: getFieldText(
            'span#j_id134\\:processoTrfViewView\\:j_id140 .value .col-sm-12',
          ),
          dataDistribuicao: getFieldText(
            'span#j_id134\\:processoTrfViewView\\:j_id152 .value',
          ),
          classeJudicial: getFieldText(
            'span#j_id134\\:processoTrfViewView\\:j_id163 .value',
          ),
          assunto: getFieldText(
            'span#j_id134\\:processoTrfViewView\\:j_id174 .value .col-sm-12',
          ),
          jurisdicao: getFieldText(
            'span#j_id134\\:processoTrfViewView\\:j_id187 .value',
          ),
          orgaoJulgador: getFieldText(
            'span#j_id134\\:processoTrfViewView\\:j_id211 .value',
          ),
          movimentos: [],
        };
      });

      const extractMovements = async (page: Page): Promise<string[]> => {
        const movements = await page.evaluate(() => {
          const rows = document.querySelectorAll(
            'table#j_id134\\:processoEvento tbody tr',
          );
          return Array.from(rows)
            .map((row) => {
              const dateElement = row.querySelector(
                'td.rich-table-cell.text-break.text-left span',
              );
              return dateElement ? dateElement.textContent?.trim() : null;
            })
            .filter((text): text is string => text !== null);
        });
        return movements;
      };

      const delay = (ms: number) =>
        new Promise((resolve) => setTimeout(resolve, ms));

      const changeMovementPage = async (page: Page, pageIndex: number) => {
        await page.evaluate((index) => {
          const input = document.querySelector<HTMLInputElement>(
            'input#j_id134\\:j_id531\\:j_id532Input',
          );
          if (input) {
            input.value = index.toString();
            input.dispatchEvent(new Event('change', { bubbles: true }));
          }
        }, pageIndex);
        await page.waitForSelector('span#j_id134\\:processoEventoMessages', {
          hidden: true,
        });
      };

      const totalPages = await newPage.evaluate(() => {
        const rightNumElement = document.querySelector(
          'td.rich-inslider-right-num',
        );
        return rightNumElement
          ? parseInt(rightNumElement.textContent || '1', 10)
          : 1;
      });

      const allMovements: string[] = [];
      for (let i = 1; i <= totalPages; i++) {
        const movements = await extractMovements(newPage);
        allMovements.push(...movements);
        if (i < totalPages) {
          await delay(2000);
          await changeMovementPage(newPage, i + 1);
        }
      }

      processDetails.movimentos = allMovements.sort((a, b) => {
        const dateA = new Date(a.split(' - ')[0]);
        const dateB = new Date(b.split(' - ')[0]);
        return dateB.getTime() - dateA.getTime();
      });

      return processDetails;
    } catch (error) {
      Logger.error((error as Error).message);
      return null;
    } finally {
      if (this.browser) {
        await this.browser.close();
        Logger.info('Navegador fechado');
      }
    }
  }
}

export default CrawlerService;
