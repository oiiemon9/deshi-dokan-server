const express = require('express');
require('dotenv').config();
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
const app = express();
const prot = process.env.PORT || 3000;

//middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.gj5u2pw.mongodb.net/?appName=Cluster0`;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

app.get('/', (req, res) => {
  res.send('Hello deshi dokan');
});

app.listen(prot, () => {
  console.log(`example app listening on port ${prot}`);
});

async function run() {
  try {
    await client.connect();

    const deshiDokanDB = client.db('deshiDokanDB');
    const productsCollection = deshiDokanDB.collection('products');

    app.post('/products', async (req, res) => {
      const product = req.body;
      const result = await productsCollection.insertOne(product);

      res.send(result);
    });

    await client.db('admin').command({ ping: 1 });
    console.log(
      'Pinged your deployment. You successfully connected to MongoDB!'
    );
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);
