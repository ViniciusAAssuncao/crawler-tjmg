import request from 'supertest';
import express from 'express';
import { Server } from 'http';
import routes from '../../routes/routes';

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
