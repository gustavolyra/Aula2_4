import express from 'express';
import { accountModel } from '../models/account.js';

const app = express();

app.get('/account', async (req, res) => {
  console.log('GET Request');
  const account = await accountModel.find({});

  try {
    res.send(account);
  } catch (err) {
    res.status(500).send(err);
  }
});

app.post('/account', async (req, res) => {
  const account = new accountModel(req.body);

  try {
    await account.save();
    res.send(account);
  } catch (err) {
    res.status(500).send(err);
  }
});

//deleta uma conta
app.delete('/account/delete', async (req, res) => {
  try {
    let account = await accountModel.findOneAndDelete(req.body);
    if (!account) {
      res.status(404).send('Documento nao encontrado');
    }
    account = await accountModel.find({ agencia: req.body.agencia });
    res.status(200).send('' + account.length);
  } catch (err) {
    res.status(500).send(err);
  }
});

//Deposito em conta
app.patch('/account/deposit', async (req, res) => {
  console.log(req.body.agencia);

  try {
    const account = await accountModel.findOneAndUpdate(
      { $and: [{ agencia: req.body.agencia }, { conta: req.body.conta }] },
      {
        $inc: { balance: req.body.balance },
      },
      { new: 1 }
    );
    if (!account) {
      res.status(404).send('Documento nao encontrado');
    }
    //res.send('hey');
    res.send(account);
  } catch (err) {
    res.status(500).send(err);
  }
});

//Saque em conta
app.patch('/account/withdraw', async (req, res) => {
  console.log(req.body.agencia);

  try {
    let account = await accountModel.findOne(
      { $and: [{ agencia: req.body.agencia }, { conta: req.body.conta }] },
      { balance: 1 }
    );
    if (!account) {
      res.status(404).send('Documento não encontrado');
    }
    if (account.balance < req.body.value + 1) {
      res
        .status(500)
        .send(
          'Account does not have enough money !, your limit is: ' +
            account.balance
        );
    }
    account = await accountModel.findOneAndUpdate(
      { $and: [{ agencia: req.body.agencia }, { conta: req.body.conta }] },
      {
        $inc: { balance: -req.body.value - 1 },
      },
      { new: 1 }
    );
    res.send(account);
  } catch (err) {
    res.status(500).send(err);
  }
});

//transferencia
app.patch('/account/transfer', async (req, res) => {
  try {
    const {
      agenciaDestiny,
      agenciaSource,
      contaDestiny,
      contaSource,
      value,
    } = req.body;
    let accountSource = await accountModel.findOne(
      { $and: [{ agencia: agenciaSource, conta: contaSource }] },
      { balance: 1 }
    );
    let accountDestiny = await accountModel.findOne(
      { $and: [{ agencia: agenciaDestiny, conta: contaDestiny }] },
      { balance: 1 }
    );
    if (!accountSource) {
      res.status(404).send('Conta Origem não encontrada');
    }
    if (!accountDestiny) {
      res.status(404).send('Conta Destino não encontrada');
    }
    let tax = 0;
    if (agenciaSource !== agenciaDestiny) {
      tax = 8;
    }
    if (accountSource.balance < value + tax) {
      res
        .status(500)
        .send(
          'Conta origem não possui esse dinheiro, total da conta : ' +
            accountSource.balance
        );
    }
    accountSource = await accountModel.findOneAndUpdate(
      { $and: [{ agencia: agenciaSource, conta: contaSource }] },
      {
        $inc: { balance: -value - tax },
      },
      { new: 1 }
    );
    accountDestiny = await accountModel.findOneAndUpdate(
      { $and: [{ agencia: agenciaDestiny, conta: contaDestiny }] },
      {
        $inc: { balance: value },
      },
      { new: 1 }
    );
    res
      .status(200)
      .send(
        'origem : ' +
          accountSource.balance +
          '  |  destino: ' +
          accountDestiny.balance
      );
  } catch (err) {
    res.status(500).send(err);
  }
});

//verifica o saldo da conta
app.patch('/account/balance', async (req, res) => {
  try {
    let account = await accountModel.findOne(
      { $and: [{ agencia: req.body.agencia }, { conta: req.body.conta }] },
      { balance: 1 }
    );
    console.log(account.balance);
    res.send(account);
  } catch (err) {
    res.status(500).send(err);
  }
});

//Media de saldos em agencia
app.patch('/account/media', async (req, res) => {
  try {
    let accounts = await accountModel.find({ agencia: req.body.agencia });
    let totalBalance = accounts.reduce((acc, curr) => {
      return acc + curr.balance;
    }, 0);
    let media = totalBalance / accounts.length;
    res.status(200).send('media : ' + media);
  } catch (err) {
    res.status(500).send(err);
  }
});

// Review.find()
//   .sort({_id: -1})
//   .limit(10)
//   .then(reviews => {
//     console.log(reviews)
//   });

//Menor salario
app.patch('/account/lower', async (req, res) => {
  console.log('here');
  try {
    let account = await accountModel
      .find({})
      .sort({ agencia: 1, conta: 1, saldo: 1 })
      .limit(req.body.limit);
    let sortAccount = account.sort((a, b) => a.balance - b.balance);
    console.log(sortAccount);
    res.status(200).send(account);
  } catch (err) {
    res.status(500).send(err);
  }
});
//Maior salario
app.patch('/account/higher', async (req, res) => {
  console.log('here');
  try {
    let account = await accountModel
      .find({})
      .sort({ agencia: 1, conta: 1, saldo: 1 })
      .limit(req.body.limit);
    let sortAccount = account.sort((a, b) => b.balance - a.balance);
    console.log(sortAccount);
    res.status(200).send(account);
  } catch (err) {
    res.status(500).send(err);
  }
});

//Transferencia agencia 99
app.get('/account/99', async (req, res) => {
  try {
    const agenciaDist = await accountModel.find({}).distinct('agencia');
    console.log(agenciaDist);
    let curr = 0;
    for (let x = 0; x < agenciaDist.length; x++) {
      curr = agenciaDist[x];
      console.log(curr);
      let account = await accountModel
        .find({ agencia: curr })
        .sort({ balance: -1 })
        .limit(1);
      console.log(account);
      let update = await accountModel.findOneAndUpdate(
        { _id: account[0].id },
        { $set: { agencia: 99 } },
        { new: 1 }
      );

      console.log(update);
    }

    const agenciaPrivate = await accountModel.find({ agencia: 99 });
    res.status(200).send(agenciaPrivate);
  } catch (err) {
    res.status(500).send(err);
  }
});

export { app as accountRouter };
