import puppeteer, { Browser, Page, Target } from 'puppeteer';

(async () => {
    const browser: Browser = await puppeteer.launch({ headless: false });
    const processNumber = "5002739-49.2023.8.13.0604"
    console.log('Navegador iniciado');

    const page: Page = await browser.newPage();
    console.log('Nova aba aberta');

    await page.goto('https://pje-consulta-publica.tjmg.jus.br/');
    console.log('Página carregada');

    await page.waitForSelector('#fPP\\:numProcesso-inputNumeroProcessoDecoration\\:numProcesso-inputNumeroProcesso');
    await page.type('#fPP\\:numProcesso-inputNumeroProcessoDecoration\\:numProcesso-inputNumeroProcesso', processNumber);
    console.log('Número do processo inserido');

    await page.waitForSelector('#fPP\\:searchProcessos');
    await page.click('#fPP\\:searchProcessos');
    console.log('Botão "Pesquisar" clicado');

    await page.waitForSelector('td.rich-table-cell');
    console.log('Tabela de resultados carregada');

    await page.evaluate(() => {
        const link = document.querySelector('td.rich-table-cell a[title="Ver Detalhes"]');
        if (link) {
            (link as HTMLElement).click();
        }
    });
    console.log('Link "Ver Detalhes" clicado');

    const newPagePromise: Promise<Page> = new Promise((resolve, reject) => {
        browser.once('targetcreated', async (target: Target) => {
            const newPage = await target.page();
            if (newPage) {
                resolve(newPage);
            } else {
                reject(new Error('Nova página não encontrada'));
            }
        });
    });

    try {
        const newPage: Page = await newPagePromise;
        await newPage.waitForSelector('body');
        console.log('Nova aba carregada');

        const processoDetalhes = await newPage.evaluate(() => {
            const getFieldText = (selector: string) => {
                const element = document.querySelector(selector);
                return element ? element.textContent?.trim() : null;
            };

            return {
                numeroProcesso: getFieldText('span#j_id134\\:processoTrfViewView\\:j_id140 .value .col-sm-12'),
                dataDistribuicao: getFieldText('span#j_id134\\:processoTrfViewView\\:j_id152 .value'),
                classeJudicial: getFieldText('span#j_id134\\:processoTrfViewView\\:j_id163 .value'),
                assunto: getFieldText('span#j_id134\\:processoTrfViewView\\:j_id174 .value .col-sm-12'),
                jurisdicao: getFieldText('span#j_id134\\:processoTrfViewView\\:j_id187 .value'),
                orgaoJulgador: getFieldText('span#j_id134\\:processoTrfViewView\\:j_id211 .value')
            };
        });

        console.log('Número do Processo:', processoDetalhes.numeroProcesso);
        console.log('Data da Distribuição:', processoDetalhes.dataDistribuicao);
        console.log('Classe Judicial:', processoDetalhes.classeJudicial);
        console.log('Assunto:', processoDetalhes.assunto);
        console.log('Jurisdição:', processoDetalhes.jurisdicao);
        console.log('Órgão Julgador:', processoDetalhes.orgaoJulgador);

        const extrairMovimentos = async (page: Page) => {
            const movimentos = await page.evaluate(() => {
                const rows = document.querySelectorAll('table#j_id134\\:processoEvento tbody tr');
                return Array.from(rows).map(row => {
                    const dateElement = row.querySelector('td.rich-table-cell.text-break.text-left span');
                    return dateElement ? dateElement.textContent?.trim() : null;
                }).filter(Boolean);
            });

            console.log('Movimentos:');
            movimentos.forEach(movimento => console.log(movimento));
        };

        const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

        const mudarPaginaMovimentos = async (page: Page, pageIndex: number) => {
            await page.evaluate((index) => {
                const input = document.querySelector<HTMLInputElement>('input#j_id134\\:j_id531\\:j_id532Input');
                if (input) {
                    input.value = index.toString();
                    input.dispatchEvent(new Event('change', { bubbles: true }));
                }
            }, pageIndex);
            await page.waitForSelector('span#j_id134\\:processoEventoMessages', { hidden: true });
        };
        const totalPages = await newPage.evaluate(() => {
            const rightNumElement = document.querySelector('td.rich-inslider-right-num');
            return rightNumElement ? parseInt(rightNumElement.textContent || '1', 10) : 1;
        });

        for (let i = 1; i <= totalPages; i++) {
            await extrairMovimentos(newPage);
            if (i < totalPages) {
                await delay(2000);
                await mudarPaginaMovimentos(newPage, i + 1);
            }
        }

    } catch (error) {
        console.error(error);
    } finally {
        await browser.close();
    }
})();