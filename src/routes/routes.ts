import { Router, Request, Response } from 'express';
import CrawlerController from '../controllers/CrawlerController';
import ApiController from '../controllers/ApiController';

const router = Router();
const crawlerController = new CrawlerController();
const apiController = new ApiController();

router.get('/process/:processNumber', (req: Request, res: Response) =>
  crawlerController.getProcessDetails(req, res),
);

router.post('/generate-excel', (req: Request, res: Response) =>
  apiController.generateExcel(req, res),
);

router.post('/paginate-movements', (req: Request, res: Response) =>
  apiController.paginateMovements(req, res),
);

export default router;
