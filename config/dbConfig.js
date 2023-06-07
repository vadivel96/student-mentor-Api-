const dbName='studentTeacherMng';
require('dotenv').config();
const dbUrl = `mongodb+srv://vadivel:${process.env.Password}@cluster0.kmcide7.mongodb.net/${dbName}`;

module.exports={dbUrl,dbName};