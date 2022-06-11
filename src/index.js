const express = require('express');
const session = require('express-session');
const morgan = require('morgan');
const flash = require('connect-flash');
const fileUpload  = require('express-fileupload');
const path  = require('path');
const config = require('./config');
const routes = require('./routes/route');
const { port } = config;
const app = express()

// Middlewares
app.use(morgan("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//Settings
app.set("port", port); //Mensetup port
app.set("views", path.join(__dirname, "views")); //Mensetup folder views 
app.set("view engine", ".ejs"); //Mesetup templating engine EJS
app.use(express.static(path.join(__dirname, "public")));  //Mendeklarasikan folder public 

//Mendeklarasikan session sehingga daat menggunakan package connect-flash
app.use(
  session({
    secret: "secret",
    cookie:{httpOnly:true},
    resave: false,
    saveUninitialized: false,
    secure:true,
  })
);

app.use(flash()); //MMendeklarasikan flash untuk mengirim pesan

app.use(fileUpload()); 
// Routes
app.use(routes); //GUnakan rute yang dibuat
app.use((req, res, next) => {
  res.status(404).render('error'); //Menampilkan error.ejs jika rute tidak ditemukan
});

//Run Server
app.listen(app.get("port") , () => {
  console.log(`Webserver running on port ${app.get("port")}`);
})