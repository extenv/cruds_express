const { config } = require('dotenv');
 config();
 module.exports = {
   database: {
     connectionLimit: 10,
     host: process.env.DATABASE_HOST || "localhost", //host
     user: process.env.DATABASE_USER || "root", //user
     password: process.env.DATABASE_PASSWORD || "", //password
     database: process.env.DATABASE_NAME || "crud_sederhana", //database
   },
   port: process.env.PORT || 3000, //port
 };