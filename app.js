const express = require('express');
const morgan = require('morgan');
// const cors = require('cors');
const helmet = require('helmet');
require("dotenv").config()
const app = express();

const cookiePareser = require('cookie-parser')
const fileUpload = require('express-fileupload')


app.use(helmet())
//for swagger documentation
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");
const swaggerDocument = YAML.load("./swagger.yaml");
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

//test check middleware
// app.set("view engine", "ejs");

//cookie and file middleware
app.use(cookiePareser())
app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: '/tmp/'
}))


//morgan middleware
app.use(morgan("tiny"));
//regular docs
app.use(express.json());
app.use(express.urlencoded({extended:true}));



//import all routes
const home = require('./routes/home');
const user = require('./routes/user');
const product = require('./routes/product');
const payment = require('./routes/payment');
const order = require('./routes/order');
//injecting middleware
app.use("/api/v1",home);
app.use("/api/v1",user);
app.use("/api/v1",product);
app.use("/api/v1",payment);
app.use("/api/v1",order);
app.get("/signuptest",(req,res)=>{
    res.render("signuptest")
})

//export app js
module.exports = app;