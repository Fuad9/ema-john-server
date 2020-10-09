const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.9ibda.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const MongoClient = require("mongodb").MongoClient;
var admin = require("firebase-admin");

const app = express();
app.use(bodyParser.json());
app.use(cors());

var admin = require("firebase-admin");

var serviceAccount = require("./configs/ema-john-simple-c3f01-firebase-adminsdk-nyvwu-54b7d31fa8.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.DB_URL,
});

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
client.connect((err) => {
  const productsCollection = client
    .db(`${process.env.DB_NAME}`)
    .collection("products");
  const ordersCollection = client
    .db(`${process.env.DB_NAME}`)
    .collection("orders");

  //to add single product
  app.post("/addProduct", (req, res) => {
    const products = req.body;
    productsCollection.insertOne(products).then((result) => {
      res.send(result.insertedCount);
    });
  });

  //to load all products
  app.get("/products", (req, res) => {
    productsCollection.find({}).toArray((err, documents) => {
      res.send(documents);
    });
  });

  //to load single product
  app.get("/product/:key", (req, res) => {
    productsCollection
      .find({ key: req.params.key })
      .toArray((err, documents) => {
        res.send(documents[0]);
      });
  });

  //to load some products
  app.post("/productsByKeys", (req, res) => {
    const productKeys = req.body;
    productsCollection
      .find({ key: { $in: productKeys } })
      .toArray((err, documents) => {
        res.send(documents);
      });
  });

  // to insert order data for shipment
  app.post("/addOrders", (req, res) => {
    const orders = req.body;
    ordersCollection.insertOne(orders).then((result) => {
      res.send(result.insertedCount > 0);
    });
  });

  // to update data
  app.patch("/update/:key", (req, res) => {
    // console.log(req.body.key.key);
    productsCollection
      .updateOne(
        { key: req.params.key.key },
        {
          $set: {
            category: req.body.category.category,
            name: req.body.name.name,
          },
        }
      )
      .then((result) => {
        res.send(result.modifiedCount > 0);
      })
      .catch((err) => {
        console.log(err);
      });
  });
});

app.listen(5000, () => console.log("listening at 5000"));
