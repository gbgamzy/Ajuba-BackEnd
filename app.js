const express=require('express');
const bodyParser=require('body-parser');
const mysql=require('mysql');
const fs = require('fs');
const path = require('path');


var logger = require('./logger').createLogger(); // logs to STDOUT
var logger = require('./logger').createLogger('development.log'); // logs to a file



process.on('exit', code => {
  // Only synchronous calls
  logger.info('Exiting Server now');
  
})
// ******************************

var db_config = {
  host:'127.0.0.1',
    port:3306,
    user:'ajuba1',
    password:'Y;FZEgFWi77#'
};
var db;

function handleDisconnect() {
  db = mysql.createConnection(db_config); // Recreate the connection, since
                                                  // the old one cannot be reused.

  db.connect(function(err) {              // The server is either down
    if(err) {                                     // or restarting (takes a while sometimes).
      console.log('error when connecting to db:', err);
      setTimeout(handleDisconnect, 2000); // We introduce a delay before attempting to reconnect,
    }                                     // to avoid a hot loop, and to allow our node script to
  });                                     // process asynchronous requests in the meantime.
                                          // If you're also serving http, display a 503 error.
  db.on('error', function(err) {
      
    console.log('db error', err);
    if(err.code === 'PROTOCOL_CONNECTION_LOST') { // Connection to the MySQL server is usually
      handleDisconnect();                         // lost due to either server restart, or a
    } else {                                      // connnection idle timeout (the wait_timeout
      throw err;                                  // server variable configures this)
    }
  });
}

handleDisconnect();



// ******************************
fs.mkdir(path.join(__dirname, 'uploads'), (err) => {
    if (err) {
        console.log("directory exists");
    }
    else{
    console.log('Directory created successfully!');}
});


// ******************************




// ******************************
const app=express();

app.use(bodyParser.json());

// ******************************

//const postRoute=require('./routes/School1');
const ajubaRoute=require('./routes/Ajuba');
createTables();

app.use('/Ajuba',ajubaRoute);








app.listen(50087,function(err){
    console.log('Connected');
});

process.on('SIGTERM', signal => {
  logger.info(`Process ${process.pid} received a SIGTERM signal`)
  //process.exit(0)
});
process.on('unhandledRejection', (reason, promise) => {
  logger.info('Unhandled rejection at ', promise, `reason: ${err.message}`)
  //process.exit(1)
})

process.on('SIGINT', signal => {
  logger.info(`Process ${process.pid} has been interrupted`)
  //process.exit(0)
});
process.on('uncaughtException', err => {
  logger.info(`Uncaught Exception: ${err.message}`)
  //process.exit(1)
});
function endConnection(){
     db.end(err=>{
        if(err)console.log(err)
        else
        console.log("Connection closed for app.js")
    })
}

function createTables(){
    db.query(`CREATE DATABASE ajuba `,(err,result)=>{
        if(err) console.log(err+"Table already exist");
        else
        console.log("Created");
        

    });
    db.query(`USE ajuba`);
    let sql="CREATE TABLE orders (OID int PRIMARY KEY AUTO_INCREMENT,name varchar(40),phone varchar(12),houseName varchar(255),streetAddress varchar(255),latitude float ,longitude float,contents varchar(255),price int ,date varchar(25),deliveryBoy varchar(12),status varchar(3) )";
    db.query(sql,(err,result)=>{
        if(err)
        console.log(err);
        else
        console.log("Created");
    });
    

    sql="CREATE TABLE delivery_boy (DbID int PRIMARY KEY AUTO_INCREMENT,name VARCHAR(255),registrationToken varchar(255),phone varchar(12) UNIQUE ,latitude float ,longitude float)";
    db.query(sql,(err,result)=>{
        if(err)
        console.log("Table already exist");
        else
        console.log("Created");
    });
    sql="CREATE TABLE logs (ID int PRIMARY KEY AUTO_INCREMENT,log VARCHAR(999),date VARCHAR(30))";
    db.query(sql,(err,result)=>{
        if(err)
        console.log(err);
        else
        console.log("LOGs Created");
    });
    sql="CREATE TABLE food_unit (FUID int PRIMARY KEY AUTO_INCREMENT,name varchar(255),price int,image VARCHAR(255) ,category varchar(255),available int)"
    db.query(sql,(err,result)=>{
        if(err)
        console.log("Table already exist")
        else
        console.log("Created")
    })
    sql="CREATE TABLE food_menu (FMID int PRIMARY KEY AUTO_INCREMENT,category varchar(255) UNIQUE)"
    db.query(sql,(err,result)=>{
        if(err)
        console.log("Table already exist")
        else
        console.log("Created")
    })
    sql="CREATE TABLE admin (ADMINID INT PRIMARY KEY DEFAULT 0 ,registrationToken varchar(255),phone varchar(12),latitude float,longitude float,dist1 float,dist2 float ,dist3 float,price1 float,price2 float,price3 float,minimumDistance float,minimumPrice float )"
    db.query(sql,(err,result)=>{
        if(err)
        console.log("Table already exist")
        else
        console.log("Created")
    })
    sql="CREATE TABLE customer (CustID int PRIMARY KEY AUTO_INCREMENT,name varchar(40),registrationToken varchar(255),phone varchar(12),successCount int,successPrice int,failureCount int,failurePrice int)"
    db.query(sql,(err,result)=>{
        if(err)
        console.log("Table already exist")
        else
        console.log("Created")
    })
    sql="CREATE TABLE images (ImgID int PRIMARY KEY AUTO_INCREMENT,name varchar(255))"
    db.query(sql,(err,result)=>{
        if(err)
        console.log("Table already exist")
        else
        console.log("Created")
    });
    endConnection();

}


