import { config } from 'dotenv';
import express from 'express';
import { Router } from './api/Router.js';
import bodyParser from 'body-parser';
import cors from 'cors';
import ngrok from 'ngrok';

const init = async () => {
  config();

  const app = express();
  app.use(bodyParser.json());
  app.use(cors());
  app.use('/', Router);
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

  // let url = await ngrok.connect(port);
  // console.log('Public url:', url);

  // Handle server shutdown gracefully
  process.on('SIGTERM', () => {
    // console.log('Received SIGTERM. Shutting down gracefully...');
    server.close(() => {
      process.exit(0);
    });
  });

  process.on('SIGINT', () => {
    // console.log('Received SIGINT. Shutting down gracefully...');
    server.close(() => {
      process.exit(0);
    });
  });
};

init();
