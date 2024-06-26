import express from 'express';
import CrawlerController from './controllers/CrawlerController';
import ApiController from './controllers/ApiController';

const app = express();
const port = 3000;

const crawlerController = new CrawlerController();
const apiController = new ApiController();

app.use(express.json());

app.get('/process/:processNumber', (req, res) => crawlerController.getProcessDetails(req, res));
app.post('/generate-excel', (req, res) => apiController.generateExcel(req, res));
app.post('/paginate-movements', (req, res) => apiController.paginateMovements(req, res));

app.listen(port, () => {
    console.log(`API rodando na porta ${port}`);
});
