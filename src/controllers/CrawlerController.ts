import CrawlerService from '../services/CrawlerService';
import Logger from '../utils/Logger';
import { Request, Response } from 'express';

class CrawlerController {
    private crawlerService: CrawlerService;

    constructor() {
        this.crawlerService = new CrawlerService();
    }

    public async getProcessDetails(req: Request, res: Response) {
        try {
            const processNumber = req.params.processNumber;
            const details = await this.crawlerService.fetchProcessDetails(processNumber);
            if (details) {
                res.status(200).json(details);
            } else {
                res.status(404).json({ message: 'Detalhes do processo não encontrados' });
            }
        } catch (error) {
            Logger.error(error);
            res.status(500).json({ message: 'Erro interno no servidor' });
        }
    }
}

export default CrawlerController;
