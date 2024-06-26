import { Request, Response } from 'express';
import ApiService from '../services/ApiService';
import Logger from '../utils/Logger';

class ApiController {
  private apiService: ApiService;

  constructor() {
    this.apiService = new ApiService();
  }

  public async generateExcel(req: Request, res: Response) {
    try {
      const { processDetails } = req.body;
      const excelFile = await this.apiService.createExcel(processDetails);
      res.setHeader(
        'Content-Disposition',
        'attachment; filename=processDetails.xlsx',
      );
      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      );
      res.send(excelFile);
    } catch (error) {
      Logger.error((error as Error).message);
      res.status(500).json({ message: 'Erro ao gerar o arquivo Excel' });
    }
  }

  public async paginateMovements(req: Request, res: Response) {
    try {
      const { movements, page, pageSize } = req.body;
      const paginatedMovements = this.apiService.paginateMovements(
        movements,
        page,
        pageSize,
      );
      res.status(200).json(paginatedMovements);
    } catch (error) {
      Logger.error((error as Error).message);
      res.status(500).json({ message: 'Erro ao paginar os movimentos' });
    }
  }
}

export default ApiController;
