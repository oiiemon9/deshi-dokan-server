const express = require('express');
require('dotenv').config();
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
const app = express();
const prot = process.env.PORT || 3000;

const admin = require('firebase-admin');
const serviceAccount = require('./deshi-deals-172bd-firebase-adminsdk.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

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

const verifyIDToken = async (req, res, next) => {
  if (!req.headers.authorization) {
    return res.status(401).send({ message: 'Unauthorize access' });
  }
  const token = req.headers.authorization.split(' ')[1];
  try {
    const decoded = await admin.auth().verifyIdToken(token);
    req.verify_email = decoded.email;
    next();
  } catch (error) {
    return res.status(401).send({ message: 'Unauthorize access' });
  }
};

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

    app.post('/products', verifyIDToken, async (req, res) => {
      const product = req.body;
      const result = await productsCollection.insertOne(product);
      res.send(result);
    });

    app.get('/products', verifyIDToken, async (req, res) => {
      const product = productsCollection.find();
      const result = await product.toArray();
      res.send(result);
    });

    app.get('/popular/products', async (req, res) => {
      const product = productsCollection.find().limit(6);
      const result = await product.toArray();
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
