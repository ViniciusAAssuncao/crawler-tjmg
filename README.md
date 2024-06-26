## Crawler TJMG API

### Introdução
Esta é uma API Node.js usando TypeScript que realiza o web scraping de detalhes de processos do site TJMG. Utiliza Puppeteer para o scraping e Express para criar a API. A API também oferece funcionalidades como geração de arquivos Excel a partir dos detalhes dos processos e paginação dos movimentos dos processos.

### Tecnologias Utilizadas
- Node.js: Ambiente de execução JavaScript server-side.
- TypeScript: Superset de JavaScript que adiciona tipagem estática.
- Express: Framework web para Node.js.
- Puppeteer: Biblioteca para controle de browsers headless.
- XLSX: Biblioteca para manipulação de arquivos Excel.
- ts-node: Executor de scripts TypeScript.

### Arquitetura
A arquitetura do projeto é baseada em uma estrutura modular que separa a lógica de scraping da API. Utilizamos um padrão de camadas que inclui controladores, serviços e utilitários.

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
    - services
        - CrawlerService.ts
    - utils
        - Logger.ts
    - index.ts
- .gitignore
- package.json
- tsconfig.json

### Descrição dos Arquivos
- PuppeteerConfig.ts: Configurações para o Puppeteer.
- ApiController.ts: Controlador para endpoints da API relacionados a operações com os dados do processo.
- CrawlerController.ts: Controlador para o endpoint de scraping.
- ProcessDetails.ts: Interface que define a estrutura dos detalhes do processo.
- ApiService.ts: Serviço que contém a lógica para criar arquivos Excel e paginar movimentos.
- CrawlerService.ts: Serviço que contém a lógica de scraping.
- Logger.ts: Utilitário para logging.
- index.ts: Ponto de entrada da aplicação.

### Instalação e Configuração

#### Clone o Repositório
```
git clone [URL_DO_REPOSITORIO](https://github.com/ViniciusAAssuncao/crawler-tjmg)
cd crawler-tjmg
```

#### Instale as Dependências
```
npm install
```

#### Inicie o Servidor
```
npm start
```

### Endpoints

#### Buscar Detalhes do Processo
- Método: GET
- URL: /process/:processNumber
- Descrição: Busca os detalhes de um processo pelo número.
- Exemplo de Requisição: http://localhost:3000/process/5002739-49.2023.8.13.0604
- Resposta: JSON com os detalhes do processo.

#### Gerar Arquivo Excel
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

#### Paginar Movimentos
- Método: POST
- URL: /paginate-movements
- Descrição: Pagina os movimentos de um processo.
- Corpo da Requisição:
```json
{
    "movements": ["Movimento 1 - 01/01/2023", "Movimento 2 - 02/01/2023", "Movimento 3 - 03/01/2023"],
    "page": 1,
    "pageSize": 2
}
```
- Resposta: Movimentos paginados.

### Testando com Postman

#### Buscar Detalhes do Processo
1. Abra o Postman e crie uma nova requisição.
2. Selecione o método GET.
3. Insira a URL: http://localhost:3000/process/5002739-49.2023.8.13.0604.
4. Clique em "Send".
5. Verifique a resposta no formato JSON com os detalhes do processo.

#### Gerar Arquivo Excel
1. Abra o Postman e crie uma nova requisição.
2. Selecione o método POST.
3. Insira a URL: http://localhost:3000/generate-excel.
4. Vá para a aba "Body" e selecione "raw" e "JSON".
5. Insira o seguinte JSON no corpo da requisição:
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
6. Clique em "Send".
7. Verifique se a resposta é um arquivo Excel para download.

#### Paginar Movimentos
1. Abra o Postman e crie uma nova requisição.
2. Selecione o método POST.
3. Insira a URL: http://localhost:3000/paginate-movements.
4. Vá para a aba "Body" e selecione "raw" e "JSON".
5. Insira o seguinte JSON no corpo da requisição:
```json
{
    "movements": ["Movimento 1 - 01/01/2023", "Movimento 2 - 02/01/2023", "Movimento 3 - 03/01/2023"],
    "page": 1,
    "pageSize": 2
}
```
6. Clique em "Send".
7. Verifique a resposta com os movimentos paginados.