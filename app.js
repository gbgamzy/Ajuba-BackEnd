const express=require('express');
const bodyParser=require('body-parser');
const mysql=require('mysql');
// ******************************

const db=mysql.createConnection({
   host:'127.0.0.1',
   port:3306,
    user:'root',
    password:''
    
});







// ******************************
const app=express();

app.use(bodyParser.json());

// ******************************

const postRoute=require('./routes/School1');
const ajubaRoute=require('./routes/Ajuba');
createTables()

app.use('/Ajuba',ajubaRoute);








app.listen(1234,function(err){
    console.log('Connected')
});


function createTables(){
    db.query(`CREATE DATABASE ajuba `,(err,result)=>{
        if(err) console.log(err+"Table already exist")
        else
        console.log("Created")
        

    })
    db.query(`USE ajuba`)
    let sql="CREATE TABLE orders (OID int PRIMARY KEY AUTO_INCREMENT,phone varchar(12),houseName varchar(255),streetAddress varchar(255),latitude float ,longitude float,contents varchar(255),price int ,date varchar(25),deliveryBoy int,status varchar(3) )"
    db.query(sql,(err,result)=>{
        if(err)
        console.log(err)
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
    sql="CREATE TABLE admin (ADMINID INT PRIMARY KEY DEFAULT 0 ,registrationToken varchar(255),phone varchar(12),latitude float,longitude float,dist1 float,dist2 float ,dist3 float,price1 float,price2 float,price3 float,minimumDistance float,minimumPrice float )"
    db.query(sql,(err,result)=>{
        if(err)
        console.log("Table already exist")
        else
        console.log("Created")
    })
    sql="CREATE TABLE customer (CustID int PRIMARY KEY AUTO_INCREMENT,registrationToken varchar(255),phone varchar(12),successCount int,successPrice int,failureCount int,failurePrice int)"
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


