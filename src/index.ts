import express, { Request, Response, NextFunction } from 'express';
import 'express-async-errors';
import morgan from 'morgan';
import cors from 'cors';
import helmet from 'helmet';
import CrawlerController from './controllers/CrawlerController';
import Logger from './utils/Logger';
import { CustomError } from './interfaces/CustomError';
import ApiController from './controllers/ApiController';

const app = express();
const port = 3000;

const crawlerController = new CrawlerController();
const apiController = new ApiController();

app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(
  morgan('combined', {
    stream: { write: (message) => Logger.info(message.trim()) },
  }),
);

app.get('/process/:processNumber', (req: Request, res: Response) =>
  crawlerController.getProcessDetails(req, res),
);
app.post('/generate-excel', (req: Request, res: Response) =>
  apiController.generateExcel(req, res),
);
app.post('/paginate-movements', (req: Request, res: Response) =>
  apiController.paginateMovements(req, res),
);

app.use(
  (error: CustomError, req: Request, res: Response, _next: NextFunction) => {
    Logger.error(error.message);
    const status = error.status || 500;
    res.status(status).json({ message: 'Erro interno no servidor' });
  },
);

app.listen(port, () => {
  Logger.info(`API rodando na porta ${port}`);
});
