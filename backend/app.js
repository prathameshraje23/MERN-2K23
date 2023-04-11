const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const app = express();

dotenv.config();
require('./db/conn.js');

app.use(express.json());

//we link the router files to make our route easy
app.use(require('./router/auth.js'));


const port = process.env.PORT;



//Middleware

// const middleware = (req, res, next) => {
//    console.log("Hello MiddleWare");
//    next();
// }


// app.get('/', (req, res) => {
//       res.send("Hello World");
// })

// app.get('/about', middleware, (req, res) => {
//     res.send("Hello World");
// })

// app.get('/contact', (req, res) => {
//     res.cookie("token","raje");
//     res.send("Hello World");
// })

// app.get('/signin', (req, res) => {
//     res.send("Hello World");
// })

// app.get('/signup', (req, res) => {
//     res.send("Hello World");
// })

app.listen(port, () => {
    console.log(`Server is running at port ${port}`);
})