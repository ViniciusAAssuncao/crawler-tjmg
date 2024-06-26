import express, { Request, Response, NextFunction } from 'express';
import 'express-async-errors';
import morgan from 'morgan';
import cors from 'cors';
import helmet from 'helmet';
import Logger from './utils/Logger';
import { CustomError } from './interfaces/CustomError';
import routes from './routes/routes';

const app = express();
const port = 3000;

app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(
  morgan('combined', {
    stream: { write: (message) => Logger.info(message.trim()) },
  }),
);

app.use('/', routes);

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
