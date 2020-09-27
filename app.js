/*Imports */
import express from 'express';
import mongoose from 'mongoose';

import { accountRouter } from './routes/accountRoutes.js';

const app = express();

/*Conexao com o MongoDB*/
(async () => {
  try {
    await mongoose.connect(
      'mongodb+srv://glyra:PASSWORD@cluster0.hjh9y.mongodb.net/accounts?retryWrites=true&w=majority',
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
      }
    );
    console.log('Conectado no MongoDB');
  } catch (error) {
    console.log('Erro ao conectar no MongoDB : ' + error);
  }
})();

app.use(express.json());
app.use(accountRouter);

app.listen(3000, () => console.log('Servidor em execucao'));
