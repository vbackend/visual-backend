import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { config } from 'dotenv';
import { root_router } from './api/root_router.js';
import { initModules } from './initModules.js';

const init = async () => {
  config();
  await initModules();
  const app = express();
  app.use(bodyParser.json());
  app.use(cors());
  app.use('/', root_router);
  app.get('/', (req, res) =>
    res.status(200).send('Hello from visual-backend server!')
  );

  const args = process.argv.slice(2);
  let port = 8080;
  if (args.length > 0) {
    port = parseInt(args[0]);
  }

  const server = app.listen(port, () => {
    console.log(`Server started at http://localhost:${port}`);
  });

  process.on('SIGTERM', () => {
    server.close(() => {
      process.exit(0);
    });
  });

  process.on('SIGINT', () => {
    server.close(() => {
      process.exit(0);
    });
  });
};

init();
