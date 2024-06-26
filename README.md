# Crawler TJMG API

## Introdução

Esta é uma API Node.js usando TypeScript que realiza o web scraping de detalhes de processos do site TJMG. Utiliza Puppeteer para o scraping e Express para criar a API. A API também oferece funcionalidades como geração de arquivos Excel a partir dos detalhes dos processos e paginação dos movimentos dos processos.

## Tecnologias Utilizadas

- Node.js: Ambiente de execução JavaScript server-side.
- TypeScript: Superset de JavaScript que adiciona tipagem estática.
- Express: Framework web para Node.js.
- Puppeteer: Biblioteca para controle de browsers headless.
- XLSX: Biblioteca para manipulação de arquivos Excel.
- ts-node: Executor de scripts TypeScript.
- winston: Biblioteca de logging para Node.js.

## Arquitetura

A arquitetura do projeto é baseada em uma estrutura modular que separa a lógica de scraping da API. Utilizamos um padrão de camadas que inclui controladores, serviços e utilitários.

```
- src
    - api
        - controllers
            - ApiController.ts
        - services
            - ApiService.ts
    - config
        - PuppeteerConfig.ts
    - controllers
        - CrawlerController.ts
    - interfaces
        - ProcessDetails.ts
        - CustomError.ts
    - routes
        - routes.ts
    - services
        - CrawlerService.ts
    - utils
        - Logger.ts
    - index.ts
```

## Descrição dos Arquivos

- `PuppeteerConfig.ts`: Configurações para o Puppeteer.
- `ApiController.ts`: Controlador para endpoints da API relacionados a operações com os dados do processo.
- `CrawlerController.ts`: Controlador para o endpoint de scraping.
- `ProcessDetails.ts`: Interface que define a estrutura dos detalhes do processo.
- `CustomError.ts`: Interface que define a estrutura dos erros personalizados.
- `ApiService.ts`: Serviço que contém a lógica para criar arquivos Excel e paginar movimentos.
- `CrawlerService.ts`: Serviço que contém a lógica de scraping.
- `Logger.ts`: Utilitário para logging usando a biblioteca winston.
- `routes.ts`: Define as rotas da aplicação.
- `index.ts`: Ponto de entrada da aplicação.

## Instalação e Configuração

### Clone o Repositório

```bash
git clone [URL_DO_REPOSITORIO](https://github.com/ViniciusAAssuncao/crawler-tjmg)
cd crawler-tjmg
```

### Instale as Dependências

```bash
npm install
```

### Inicie o Servidor

```bash
npm start
```

## Endpoints

### Buscar Detalhes do Processo

- Método: GET
- URL: /process/:processNumber
- Descrição: Busca os detalhes de um processo pelo número.
- Exemplo de Requisição: http://localhost:3000/process/5002739-49.2023.8.13.0604
- Resposta: JSON com os detalhes do processo.

### Gerar Arquivo Excel

- Método: POST
- URL: /generate-excel
- Descrição: Gera um arquivo Excel a partir dos detalhes do processo.
- Corpo da Requisição:

```json
{
  "processDetails": {
    "numeroProcesso": "5002739-49.2023.8.13.0604",
    "dataDistribuicao": "01/01/2023",
    "classeJudicial": "Classe Judicial",
    "assunto": "Assunto",
    "jurisdicao": "Jurisdicao",
    "orgaoJulgador": "Orgao Julgador",
    "movimentos": ["Movimento 1", "Movimento 2"]
  }
}
```

- Resposta: Arquivo Excel para download.

### Paginar Movimentos

- Método: POST
- URL: /paginate-movements
- Descrição: Pagina os movimentos de um processo.
- Corpo da Requisição:

```json
{
  "movements": [
    "Movimento 1 - 01/01/2023",
    "Movimento 2 - 02/01/2023",
    "Movimento 3 - 03/01/2023"
  ],
  "page": 1,
  "pageSize": 2
}
```

- Resposta: Movimentos paginados.

## Testando com Postman

### Buscar Detalhes do Processo

- Abra o Postman e crie uma nova requisição.
- Selecione o método GET.
- Insira a URL: http://localhost:3000/process/5002739-49.2023.8.13.0604.
- Clique em "Send".
- Verifique a resposta no formato JSON com os detalhes do processo.

### Gerar Arquivo Excel

- Abra o Postman e crie uma nova requisição.
- Selecione o método POST.
- Insira a URL: http://localhost:3000/generate-excel.
- Vá para a aba "Body" e selecione "raw" e "JSON".
- Insira o seguinte JSON no corpo da requisição:

```json
{
  "processDetails": {
    "numeroProcesso": "5002739-49.2023.8.13.0604",
    "dataDistribuicao": "01/01/2023",
    "classeJudicial": "Classe Judicial",
    "assunto": "Assunto",
    "jurisdicao": "Jurisdicao",
    "orgaoJulgador": "Orgao Julgador",
    "movimentos": ["Movimento 1", "Movimento 2"]
  }
}
```

- Clique em "Send".
- Verifique se a resposta é um arquivo Excel para download.

### Paginar Movimentos

- Abra o Postman e crie uma nova requisição.
- Selecione o método POST.
- Insira a URL: http://localhost:3000/paginate-movements.
- Vá para a aba "Body" e selecione "raw" e "JSON".
- Insira o seguinte JSON no corpo da requisição:

```json
{
  "movements": [
    "Movimento 1 - 01/01/2023",
    "Movimento 2 - 02/01/2023",
    "Movimento 3 - 03/01/2023"
  ],
  "page": 1,
  "pageSize": 2
}
```

- Clique em "Send".
- Verifique a resposta com os movimentos paginados.

## Testes Automatizados

### Configuração do Jest

Adicione o seguinte arquivo `jest.config.js` na raiz do projeto:

```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.ts'],
  moduleFileExtensions: ['ts', 'js', 'json', 'node'],
  testTimeout: 20000,
};
```

### Rodando os Testes

Para rodar os testes, use o comando:

```bash
npm test
```

### Exemplo de Teste

Adicione um arquivo de teste em `tests/routes/routes.test.ts`:

```typescript
import request from 'supertest';
import express from 'express';
import { Server } from 'http';
import routes from '../../src/routes/routes';

let server: Server;

beforeAll(() => {
  const app = express();
  app.use(express.json());
  app.use('/', routes);
  server = app.listen(4000);
});

afterAll((done) => {
  server.close(done);
});

describe('API Routes', () => {
  it('should fetch process details', async () => {
    const response = await request(server).get(
      '/process/5002739-49.2023.8.13.0604',
    );
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('numeroProcesso');
  }, 20000);

  it('should generate an excel file', async () => {
    const response = await request(server)
      .post('/generate-excel')
      .send({
        processDetails: {
          numeroProcesso: '5002739-49.2023.8.13.0604',
          dataDistribuicao: '01/01/2023',
          classeJudicial: 'Classe Judicial',
          assunto: 'Assunto',
          jurisdicao: 'Jurisdicao',
          orgaoJulgador: 'Orgao Julgador',
          movimentos: ['Movimento 1', 'Movimento 2'],
        },
      });

    expect(response.status).toBe(200);
    expect(response.header['content-type']).toBe(
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
  }, 20000);

  it('should paginate movements', async () => {
    const response = await request(server)
      .post('/paginate-movements')
      .send({
        movements: [
          'Movimento 1 - 01/01/2023',
          'Movimento 2 - 02/01/2023',
          'Movimento 3 - 03/01/2023',
        ],
        page: 1,
        pageSize: 2,
      });

    expect(response.status).toBe(200);
    expect(response.body).toEqual([
      'Movimento 1 - 01/01/2023',
      'Movimento 2 - 02/01/2023',
    ]);
  }, 20000);
});
```
