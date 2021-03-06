const express=require('express');
const bodyParser=require('body-parser');
const mysql=require('mysql');
// ******************************

const db=mysql.createConnection({
   host:'127.0.0.1',
   port:3306,
    user:'root',
    password:'',
    database:'ajuba'
});
const db1=mysql.createConnection({
   host:'127.0.0.1',
   port:3306,
    user:'root',
    password:'',
    database:'raj'
});


var mongoose = require('mongoose');
var url = 'mongodb://127.0.0.1:27017/';

// ******************************
const app=express();
app.use(bodyParser.json());
// ******************************

const postRoute=require('./routes/School1');
const ajubaRoute=require('./routes/Ajuba');
createTables()

app.use('/Ajuba',ajubaRoute);


//app.use('/School1',postRoute);



/*mongoose.connect(url,
    {useNewUrlParser:true,
        useUnifiedTopology: true,
        useFindAndModify: false },
    () => 
console.log("Connected to MongoDB")
);*/






app.listen(1234,function(err){
    console.log('Connected')
});


function createTables(){
    let sql="CREATE TABLE orders (OID int PRIMARY KEY AUTO_INCREMENT,phone varchar(12),houseName varchar(255),streetAddress varchar(255),latitude float ,longitude float),contents varchar(255),price int ,address int,date varchar(25),predeliveryBoy int,deliveryBoy int,status varchar(3) )"
    db.query(sql,(err,result)=>{
        if(err)
        console.log("Table already exist")
        else
        console.log("Created")
    })
    

    sql="CREATE TABLE delivery_boy (DbID int PRIMARY KEY AUTO_INCREMENT,name VARCHAR(255),registrationToken varchar(255),phone varchar(12) UNIQUE ,latitude float ,longitude float)"
    db.query(sql,(err,result)=>{
        if(err)
        console.log("Table already exist")
        else
        console.log("Created")
    })
    sql="CREATE TABLE food_unit (FUID int PRIMARY KEY AUTO_INCREMENT,name varchar(255) UNIQUE,price int,image VARCHAR(255) ,category varchar(255))"
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
    sql="CREATE TABLE admin (ADMINID int PRIMARY KEY  ,registrationToken varchar(255),phone varchar(12),latitude float,longitude float,dist1 float,dist2 float ,dist3 float,price1 float,price2 float,price3 float,minimumDistance float,minimumPrice float )"
    db.query(sql,(err,result)=>{
        if(err)
        console.log("Table already exist")
        else
        console.log("Created")
    })
    sql="CREATE TABLE customer (CustID int PRIMARY KEY AUTO_INCREMENT,registrationToken varchar(255),phone varchar(12))"
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
    })

}


