const path=require('path');
var {admin}=require('./config')

const express=require('express');
const router=express.Router();
const mysql=require('mysql');
var fs = require("fs");

const base=path.resolve('.')

const db=mysql.createConnection({
    host:'127.0.0.1',
    port:3306,
    user:'ajuba1',
    password:'Y;FZEgFWi77#',
     database:'ajuba'
 });




const multer  = require('multer');

const storage=multer.diskStorage({
    destination: function (req, file, cb) {
         cb(null,base+"/uploads");
       }
})
const upload=multer({

    
    
   storage:storage,
    
    
    limits:{
        fileSize:2000000
    },
    fileFilter(req,file,cb){
        if(!file.originalname.match(/\.(jpg|png|JPG|PNG|JPEG|jpeg|png)$/)){
            cb(new Error('Incorrect file format'));
        }
        cb(undefined,true);

    }

})
function sendPushNotification(message){
    admin.messaging().send(message).then((response)=>{
        console.log("sent")
        console.log(response)
    }).catch((err)=>{

        console.log(err)
    })
}
function notificationAdmin(title,body){
    db.query(`SELECT * FROM admin WHERE ADMINID=0`,(err,result)=>{
        console.log(result[0].registrationToken)
        const m={
            
            data:{
                title:title,
                body:body
            },
            token:result[0].registrationToken
               
        };
        sendPushNotification(m);
    })
    
}
function notifyCustomer(title,body,token){
    console.log("notifyCutomer Token")
    console.log(token)

    const m={
        data:{
            title:title,
            body:body
        },
        token:token
        
    };
    sendPushNotification(m);

}
function notifyRiders(){
    const title="New Order to accept"
    const body="There's a new order to accept"
    db.query(`SELECT * FROM delivery_boy`,(err,result)=>{
        if(err) console.log(err);
        else{
            result.forEach(element => {
                const m={
                    data:{
                        title:title,
                        body:body
                    },
                    token:element.registrationToken,
                       android: {
                        notification: {
                            sound: "alert.mp3",
                            channel_id:'AjubaRider_notification_id'
                        }
                    }
                };
                sendPushNotification(m);
            
                
            });
        }
    })
}

router.post('/addAdmin',async (req,res)=>{
    console.log(req.body);
    db.query(`INSERT INTO admin (phone,latitude,longitude) VALUES ("${req.body.phone}",${req.body.latitude},${req.body.longitude})`,(err,result)=>{
        if(err)
        {
            
        console.log(err)}
        else{
        console.log(result)
        res.send("SUCCESS")}
    })
    
    
})
router.post('/deleteAdmin',async(req,res)=>{
    db.query(`DELETE FROM admin WHERE ADMINID =0`,(err,result)=>{
        if(!err){
            res.send({message:"SUCCESS"})
        }
        else{
            res.send({message:"ERROR"})
        }
    })
})


router.post('/images',upload.single('upload'), async (req,res)=>{
    console.log(req.file);
    console.log(req.body.id);
    console.log(req.file.filename);
    res.send({message:req.file.filename})
    
})

router.delete('/images/:id',async(req,res)=>{
    db.query(`DELETE FROM images WHERE name="${req.params.id}" `,(err,result)=>{
        if(err) res.send({message:"ERROR"});
        else{
            try{fs.unlinkSync(base+"/uploads/"+req.params.id)
                res.send({message:"SUCCESS"})
        }
            catch(err1){
                console.log(err1);
                res.send({message:"ERROR"})
            } 
        }
    })

    console.log("delete"+req.params.id)
})
router.get('/images/:img_id',async (req,res)=>{


    
    const p=fs.readFileSync(base+"/uploads/"+req.params.img_id)
    res.set('Content-Type','image/jpg');


    res.send(p);
    

    
})
router.post('/query',async (req,res)=>{
    db.query(req.body.query,(err,result)=>{
        if(!err){
            res.send(result);
        }
        else{
            res.send(err);
        }
    })
})



//    message_notification.notification.title="New Order"
//    message_notification.notification.body="You have a new Order to Accept"

//    notifyAdmin(message_notification)
//     res.send({message:"SUCCESS"});}
   


// CustomerSide
router.get('/getAdmin',async(req,res)=>{
    try{
        db.query("SELECT * FROM admin",(err,result,fields)=>{
            if(err) console.log(err);
            console.log(result[0])
            res.send(result[0])
        })
    }

    catch(err){

    }
})

router.post('/customer/:phone/:registrationToken',async(req,res)=>{
    try{
        console.log(req.params)
        
       db.query(`SELECT * FROM customer`,(err,result)=>{
           if(result.length>0){
               db.query(`UPDATE customer SET registrationToken="${req.params.registrationToken}" WHERE phone="${req.params.phone}"`,(err1,result1)=>{
                   if(!err1){
                       console.log(result1+req.params.phone)
                       res.send({message:"SUCCESS"})
                   }
               })
           }
           else{
               db.query(`INSERT INTO customer (phone,registrationToken,successCount,successPrice,failureCount,failurePrice)
                VALUES("${req.params.phone}","${req.params.registrationToken}",0,0,0,0)`,(err2,result2)=>{
                if(err2) {res.send({message:"ERROR"})
                    console.log(err2)
            }
                else{
                    console.log(req.params.phone+result2)
                    res.send({message:"SUCCESS"})
                }
            })
           }
       })

        
       
        
        

    }
    catch(err){
        console.log(err);
        res.json({message:"ERROR"});
    }
})



router.get('/customer/menu',async(req,res)=>{
    try{
        
        db.query(`SELECT * FROM food_menu`,(err,result)=>{
            if(err) console.log(err);
            res.send(result);
        })
    }
    catch(err){
        res.status(400).json({message:"Some error occurred from our end"});
    }
})

router.get('/customer/food',async(req,res)=>{
    db.query(`SELECT * FROM food_unit`,(err,result)=>{
        if(err) console.log(err);
        res.send(result);
    })
})
router.get('/customer/:phone/orders',async(req,res)=>{
    try{
        db.query(`SELECT orders.contents AS contents,orders.OID AS OID ,orders.price AS price,orders.date AS date,orders.status AS status,
        delivery_boy.phone AS deliveryBoyPhone FROM orders LEFT JOIN delivery_boy ON orders.deliveryBoy=delivery_boy.DbID
        WHERE orders.phone = "${req.params.phone}"`,(err,result)=>{
            if(err) console.log(err);
            res.send(result)
        })

        
    }
    catch(err){
        res.status(400).json({message:"Some error occurred from our end"});
    }
})
router.get('/customer/rider/:phone',async (req,res)=>{
    try{
        db.query(`SELECT *FROM delivery_boy WHERE phone = "${req.params.phone}"`,(err,result)=>{
            if(err) console.log(err);

            console.log(result[0])
            res.send(result[0])
        })
    }
    catch(err){
        console.log(err)
    }
})


router.post('/placeOrder/:phone',async(req,res)=>{



            
    
            db.query(`INSERT INTO orders(contents,phone,price,date,status,houseName,streetAddress,latitude,longitude)
             VALUES ("${req.body.contents}","${req.params.phone}",
             ${req.body.price},
             "${req.body.date}","A","${req.body.houseName}","${req.body.streetAddress}",
             ${req.body.latitude},${req.body.longitude})`,(err1,result1)=>{
                if(err1) res.send({message:"ERROR"});
                else{
                    notificationAdmin("New Order","A Pending order containing "+req.body.contents);
                res.send({message:"SUCCESS"});}
            })
            
    
   



})


// Admin Side

router.post('/admin/:phone/:registrationToken',async(req,res)=>{
    try{
        
        db.query(`SELECT * FROM admin WHERE phone = "${req.params.phone}"`,(e,r)=>{
            if(e) {
                console.log(e)
                res,send({message:"ERROR"});
            }
            else if(r[0].phone!=null){
                db.query(`UPDATE admin SET registrationToken="${req.params.registrationToken}" WHERE phone = "${req.params.phone}"`,(err,result)=>{
                    if(err) console.log(err);
            
                    else  res.send({message:"SUCCESS"});
            
                })
                
            }
            else{
                res.send({message:"ERROR"});
            }

        })
    
    
           


        
        

        
    }
    catch(err){
        res.json({message:"ERROR"});
        console.log(err)
    }

})
router.post('/admin/phone',async(req,res)=>{
    try{
    db.query(`UPDATE admin SET phone = ${req.body.phone} WHERE phone = ${req.body.oldPhone} `,(err,result)=>{
        if(err) console.log(err);
            console.log(result)
    })
        res.send({message:"SUCCESS"});
}

    catch(err){
        console.log(err)
        res.json({message:"ERROR"});
    }

})
router.post('/admin/rider',async(req,res)=>{
    try{
        db.query(`INSERT INTO delivery_boy(name,phone) VALUES("${req.body.name}","${req.body.phone}")`,(err,result)=>{
            if(err){
                res.send({message:"ERROR"})
            }

            else{
                res.json({message:"SUCCESS"});
                console.log(result)
            }
            
        })
        
    }
    catch(err){
        res.json("Error");
    }
});
router.delete('/admin/rider',async(req,res)=>{
    try{
        
        await Rider.findOneAndDelete({userId:req.body.userId});
        res.json({message:"SUCCESS"});
    }
    catch(err){
        res.json("Error");
    }
});




router.get('/admin/getDetails/:phone',async(req,res)=>{
    try{
        db.query(`SELECT * FROM customer WHERE phone="${req.params.phone}"`,(err,result)=>{
            if(err){
                res.send({message:"ERROR"})

            }
            else{
                res.send(result[0]);
            }
        })
        
  

    }
    catch(err){
        console.log(err)
    }
})

router.post('/acceptOrder/:id',async(req,res)=>{
    try{
        db.query(`UPDATE orders SET status="B" WHERE OID = ${req.params.id}`,(err,result)=>{
            if(err){
                res.send({message:"ERROR"})
            }
            else {
                db.query(`SELECT * FROM orders WHERE OID=${req.params.id}`,(err1,result1)=>{
                    if(err) res.send({message:"ERROR"})
                    else{
                        
                        db.query(`SELECT * FROM customer WHERE phone="${result1[0].phone}"`,(err2,result2)=>{
                            console.log("result")
                            console.log(result1)
                            console.log(result2)
                            notifyCustomer("Order out for delivery.",`Your order containing ${result1[0].contents} is out for delivery. `,result2[0].registrationToken)
                        })
                        
                    }
                })
                notifyRiders()
                
                res.send({message:"SUCCESS"});}
        })
        
    }
    catch(err){

        console.log(err);
        res.send({message:"ERROR"});
    }
})
router.post('/processOrder/:id',async(req,res)=>{
    try{
        db.query(`UPDATE orders SET status="A2" WHERE OID = ${req.params.id}`,(err,result)=>{
            if(err){
                res.send({message:"ERROR"})
            }
            else {
                
                
                notifyRiders()
                res.send({message:"SUCCESS"});}
        })
        
        
    }
    catch(err){
        console.log(err);
        res.send({message:err});
    }
})
router.get('/admin/getOrder/:id',async(req,res)=>{
    try{
        db.query(`SELECT * FROM orders WHERE OID = ${req.params.id}`,(err,result)=>{
            if(err) console.log(err);
            else{
                res.send(result[0])
            }
        })    
    }
    catch(err){
        console.log(err)
    }

})
router.get('/admin/getRiders',async(req,res)=>{
    db.query(`SELECT name AS deliveryBoyName,phone AS deliveryBoyPhone FROM delivery_boy`,(err,result)=>{
        if(err)
        res.send({message:"ERROR"})
        else
        res.send(result)
    })

})

router.post('/rejectOrder/:id',async(req,res)=>{
    try{
        console.log(req.params)

       
                db.query(`DELETE FROM orders WHERE OID=${req.params.id}`,(err1,result1)=>{
                    if(err1){
                        res.send({message:"ERROR"})
                    }
                    else{


                        db.query(`SELECT * FROM orders WHERE OID=${req.params.id}`,(err,result)=>{
                            if(err) {
                                console.log(err)
                                res.send({message:"ERROR"})}
                            else{
                                console.log(result);
                                // db.query(`SELECT * FROM customer WHERE phone="${result[0].phone}"`,(err2,result2)=>{
                                //     if(!err2){
                                //         console.log(result2)
                                //         notifyCustomer("Order Rejected.",`Your order containing ${result.contents} has not been accepted. `,result2[0].registrationToken);
                                //     }
                                // })
                                
                            }
                        })
                        res.send({message:"SUCCESS"})
                    }
                })
            
        
    }
    catch(err){
        console.log(err);
        res.send({message:"ERROR"});
    }
})

router.get('/admin/getPendingOrders',async(req,res)=>{


    try{
        db.query(`SELECT * FROM orders
        WHERE orders.status="A"`,(err,result)=>{
            if(err){
                console.log(err)
            }
            else
            res.send(result)
        })

    }
    catch(err){
        console.log(err);
    }
})
router.get('/admin/getProcessingOrders',async(req,res)=>{


    try{
        db.query(`SELECT orders.OID AS OID,orders.phone AS phone,orders.contents AS contents,orders.price AS price,
        orders.date AS date,orders.status As status,orders.streetAddress AS streetAddress,orders.latitude AS latitude,
        orders.longitude AS longitude,

        delivery_boy.name AS deliveryBoyName,delivery_boy.phone AS deliveryBoyPhone FROM orders 
        
        LEFT JOIN delivery_boy ON orders.deliveryBoy=delivery_boy.DbID
        WHERE orders.status="A2"`,(err,result)=>{
            if(err){
                console.log(err);
            }
            else
            {
            res.send(result)}
        })
    }
    catch(err){
        console.log(err);
    }
})

router.post('/admin/foodMenu/category/:category',async(req,res)=>{

    try{
        db.query(`INSERT INTO food_menu(category) VALUES
         ("${req.params.category}")`,(err,result)=>{
            if(err) console.log(err);
            else{
                res.status(200).send("SUCCESS");        
            }
        })
        
    }
    catch(err){
        console.log(err)
        res.status(400).send("error")
    }
})
router.delete('/admin/foodMenu/category/:category',async(req,res)=>{

    try{
        db.query(`DELETE FROM food_menu WHERE category="${req.params.category}"`,(err,result)=>{
            if(err) console.log(err);
            else{
                db.query(`SELECT image FROM food_unit WHERE category="${req.params.category}"`,(err2,result2)=>{
                    if(err2) console.log(err2);
                    else{try{
                        
                        result2.forEach(element => {
                            fs.unlinkSync(base+"/uploads/"+element.image)
                            
                        });}
                        catch(err3){
                            console.log(err3);
                        }
                    }
                })
                db.query(`DELETE FROM food_unit WHERE category="${req.params.category}"`,(err1,result1)=>{
                    if(err1) console.log(err1);
                    else{res.send({message:"SUCCESS"})}
                })
            }
        })


    }
    catch(err){
        res.send({message:"ERROR"})
        console.log(err);
    }
})
router.post('/admin/foodMenu/:category/food',async(req,res)=>{

    try{
        console.log(req.body.image);

        db.query(`INSERT INTO food_unit(name,price,image,category) VALUES (
            "${req.body.name}",${req.body.price},"${req.body.image}","${req.params.category}"
        )`,(err,result)=>{
            if(err) console.log(err);
            else{
                res.status(200).send({message:"SUCCESS"})        
            }
        })

        
        
    }
    catch(err){
        res.status(400).send({message:"ERROR"})
    }
})
router.delete('/admin/foodMenu/:category/food/:name',async(req,res)=>{

    try{
        db.query(`DELETE FROM food_unit WHERE name="${req.params.name}"`,(err,result)=>{
            if(err) res.send({message:"ERROR"});
            else{
                console.log(result);
                res.send({message:"SUCCESS"});
            }
        })

    }
    catch(err){
        res.send({message:"ERROR"})
        console.log(err);
    }
})

router.get('/admin/prices',async(req,res)=>{
    db.query(`SELECT * FROM admin `,(err,result)=>{
        if(err) console.log(err);
        else{res.send(result[0])}
    })
})

router.post('/admin/prices',async(req,res)=>{
    db.query(`UPDATE admin SET dist1=${req.body.dist1},dist2=${req.body.dist2},dist3=${req.body.dist3},
    price1=${req.body.price1},price2=${req.body.price2},price3=${req.body.price3},minimumDistance=${req.body.minimumDistance}
    ,minimumPrice=${req.body.minimumPrice} WHERE ADMINID = 0`,(err,result)=>{
        if(err) console.log(err);
        else{res.send({message:"SUCCESS"})}
    })
    
})

router.get('/admin/getRidersList',async(req,res)=>{
   db.query(`SELECT name AS deliveryBoyName,phone AS deliveryBoyPhone FROM delivery_boy `,(err,result)=>{
       if(err) console.log(err);
       else{res.send(result);}
   })

})
router.get('/admin/rider/:id/getOrders',async(req,res)=>{
    db.query(`SELECT * FROM orders WHERE deliveryBoy=${req.params.id}`,(err,result)=>{
        if(err) console.log(err);
        else{
            console.log(result)
            res.send(result);
        }
    })
})
router.post('/admin/getRidersList',async(req,res)=>{
    db.query(`INSERT INTO delivery_boy(name,phone) VALUES ("${req.body.deliveryBoyName}","${req.body.deliveryBoyPhone}")`,(err,result)=>{
        if(err) console.log(err);
        else{res.send({message:"SUCCESS"});}
    })
    

})
router.delete('/admin/getRidersList/:phone',async(req,res)=>{
    try{
        db.query(`DELETE FROM delivery_boy WHERE phone="${req.params.phone}"`,(err,result)=>{
            if(err) console.log(err);
            else res.send({message:"SUCCESS"});
        })
    }
    catch(err){
        console.log(err)
    }

})








// RIDER.................................................


router.post('/rider/login/:phone/:registrationToken',async(req,res)=>{
    try{

        db.query(`SELECT * FROM delivery_boy WHERE phone = "${req.params.phone}"`,(e,r)=>{
            if(e) {
                console.log(e)
            
                res.send({message:"ERROR"});
            }
            else if(r[0].phone!=null){
                db.query(`UPDATE delivery_boy SET registrationToken="${req.params.registrationToken}" WHERE phone = "${req.params.phone}"`,(err,result)=>{
                    if(err) console.log(err);
            
                    else  res.send({message:r[0].DbID});
                    console.log(r[0]);
            
                })
                
            }
            else{
                res.send({message:"ERROR"});
            }

        })

    }
    catch(err){
        res.json({message:"ERROR"});
        console.log(err)
    }

})


router.get('/rider/login/:phone',async(req,res)=>{
    try{
        db.query(`SELECT * FROM orders
        WHERE orders.deliveryBoy=${req.params.phone}`,(err,result)=>{
            if(err){
                res.send({message:"ERROR"})
            }
            else
            res.send(result)
        })

    }
    catch(err){
        console.log(err);
        
    }
})
router.post('/rider/:phone/location',async(req,res)=>{
    db.query(`UPDATE delivery_boy SET latitude=${req.body.latitude},longitude=${req.body.longitude} WHERE phone="${req.params.phone}"`,(err,result)=>{
        if(err) console.log(err);
        else{
            res.send({message:"SUCCESS"})
        }
    })
})
router.post('/rider/:phone/id/:id/accepted',async(req,res)=>{
    console.log(req.params)
    db.query(`UPDATE orders SET deliveryBoy=${req.params.phone} WHERE OID = ${req.params.id}`,(err,result)=>{
        if(err) console.log(err);
        else res.send({message:"SUCCESS"})
        console.log(result)
    })
})
router.post('/rider/phone/:phone/id/:id/delivered',async(req,res)=>{
    try{

        db.query(`SELECT * FROM orders WHERE OID= ${req.params.id}`,(err,result)=>{
            db.query(`UPDATE customer SET successCount=successCount+1,successPrice=successPrice+${result[0].price} WHERE phone=${result[0].phone}`)
        
        db.query(`UPDATE orders SET status="C" WHERE OID= ${req.params.id}`,(err,result1)=>{
            console.log(result1)
            if(err) res.send({message:"ERROR"})
            else res.send({message:"SUCCESS"});
        })})
        
        
        
    }
    catch(err){
        res.send({message:"ERROR"})
    }

})
router.post('/rider/:phone/:id/declined',async(req,res)=>{
    try{ 

        db.query(`SELECT * FROM orders WHERE OID= ${req.params.id}`,(err,result)=>{
            db.query(`UPDATE customer SET failureCount=failureCount+1,failurePrice=failurePrice+${result[0].price} WHERE phone=${result[0].phone}`)
        

        db.query(`UPDATE orders SET status="D" WHERE OID= ${req.params.id}`,(err,result)=>{
            if(err) res.send({message:"ERROR"})
            else {
                notificationAdmin("Order Failed",`Order to be delivered by ${req.params.phone} was fake.`);
                res.send({message:"SUCCESS"});}
        })
    })
    }
    catch(err){
        res.send({message:"ERROR"})
    }

})
router.put('/customer/logout/:phone',async(req,res)=>{
    db.query(`UPDATE customer SET registrationToken="" WHERE phone="${req.params.phone}"`)
})

router.put('/rider/logout/:phone',async(req,res)=>{
    db.query(`UPDATE delivery_boy SET registrationToken="" WHERE phone="${req.params.phone}"`)
})

router.put('/admin/logout',async(req,res)=>{
    db.query(`UPDATE admin SET registrationToken="" WHERE ADMINID=0`)
})

module.exports= router;