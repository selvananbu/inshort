const express = require("express");
const app = express();
const morgan = require("morgan");
const bodyParser = require("body-parser");
var firebase = require('firebase');

const productRoutes = require("./api/routes/products");
const orderRoutes = require("./api/routes/orders");

var firebaseConfig = {
  apiKey: "AIzaSyCWlu5XUt8epqZ-kIgugmMV_UP46FypV-w",
  authDomain: "inshort-335e8.firebaseapp.com",
  databaseURL: "https://inshort-335e8.firebaseio.com",
  projectId: "inshort-335e8",
  storageBucket: "inshort-335e8.appspot.com",
  messagingSenderId: "357906706631",
  appId: "1:357906706631:web:d9dc8f2a13100ac1"
};

firebase.initializeApp(firebaseConfig);

app.use(morgan("dev"));
app.use('/uploads', express.static('uploads'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Methods", "PUT, POST, PATCH, DELETE, GET");
    return res.status(200).json({});
  }
  next();
});

// Routes which should handle requests
app.use("/products", productRoutes);
app.use("/orders", orderRoutes);
app.use((req, res, next) => {
  res.status(200).json({
      message: 'Welcome to Kis Kisa Back End Services!'
  });
});

app.use((req, res, next) => {
  const error = new Error("Not found");
  error.status = 404;
  next(error);
});

app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.json({
    error: {
      message: error.message
    }
  });
});

module.exports = app;
