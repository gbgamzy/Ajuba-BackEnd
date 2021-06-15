const path=require('path');
var {admin}=require('./config')

const express=require('express');
const router=express.Router();
const mysql=require('mysql');
var fs = require("fs");

const base=path.resolve('.')

var db_config = {
  host:'127.0.0.1',
    port:3306,
    user:'ajuba1',
    password:'Y;FZEgFWi77#',
     database:'ajuba'
};
var db;
var error;

var logger = require('../logger').createLogger(); // logs to STDOUT
var logger = require('../logger').createLogger('development.log'); // logs to a file


function handleDisconnect() {
  db = mysql.createPool(db_config); // Recreate the connection, since
                                                  // the old one cannot be reused.

                                   // If you're also serving http, display a 503 error.
  db.on('error', function(err) {
    console.log('db error', err);
    // Connection to the MySQL server is usually
    handleDisconnect();                         // lost due to either server restart, or a
    error=err;
  });
  var d="";
  db.query(`INSERT INTO logs(log,date) VALUES("AJUBA ${error}",NOW())`,(result,err)=>{
      if(err){
          console.log(err)
          
      }
      
  });
  
}

handleDisconnect();







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
    try{admin.messaging().send(message).then((response)=>{
        console.log("response:"+response);
        console.log(response);
        return response;
    }).catch((err)=>{

        return err;
    })}
    catch(err){
        console.log(err);
    }
}


function notificationAdmin(title,body){
    db.query(`SELECT * FROM admin WHERE ADMINID=0`,(err,result)=>{
        
        const m={
            
            data:{
                title:title,
                body:body
            },
            token:result[0].registrationToken
               
        };
        for(i=0;i<5;i++){
            console.log("notify admin");
            var x=sendPushNotification(m);
        console.log(x);
        }
        
        
    })
    
}

function notifyPhone(title,body,phone){
    try{
        db.query(`SELECT * FROM customer WHERE phone ="${phone}"`,(err,result)=>{
            if(err){
                console.log("ERROR1");
                console.log(err);
                
                return err;
            }
            else{
                var x = notifyCustomer(title,body,result[0].registrationToken);
               
                return x;
            }
        })
    }
    catch(err){
        console.log("ERROR2");
        console.log(err);
        return err;
        
    }
}
function notifyCustomer(title,body,token){
    try{
    

    const m={
        data:{
            title:title,
            body:body
        },
        token:token
        
    };
    sendPushNotification(m);
        
    }
    catch(err){
        return err;
    }

}
function notifyRider(p){
    try{
        
        db.query(`SELECT registrationToken FROM delivery_boy WHERE phone=${p}`,(err,result)=>{
            
            const title="New Order to accept"
            const body="There's a new order to accept"
            if(err) console.log(err);
            else{

                const m={
                data:{
                        title:title,
                        body:body
                    },
                    token:result[0].registrationToken
                };
        
        sendPushNotification(m);
            }
        })
    }
    catch(err){
        console.log(err);
    }
}
function notifyRiders(){
    try{const title="New Order to accept"
    const body="There's a new order to accept"
    db.query(`SELECT * FROM delivery_boy`,(err,result)=>{
        if(err) res.send({error:err});
        else{
            
        
        var reg=[];
        result.forEach(element=>{
            if(element.registrationToken!=null){
            reg.push(element.registrationToken);
            const m={
                data:{
                        title:title,
                        body:body
                    },
                    token:element.registrationToken
                };
        for(i=0;i<5;i++){
            console.log("notify rider");
            var x=sendPushNotification(m);
            console.log(x);
        }
        
            }
        
        
        
        
            
        });
        
        
        
             /*admin.messaging().sendMulticast(m)
                .then((response) => {
                    console.log(response.successCount + ' messages were sent successfully');
                });*/
        return "m"; 
        
        }
        
        
    })}
    catch(err){
        return err;
    }
}
router.post('/notifyRider',async(req,res)=>{
    notifyRider(req.body.phone);
})
router.post('/notifyPhone',(req,res)=>{
    try{
        
        var x=notifyPhone(req.body.title,req.body.body,req.body.phone)
        res.send(x)
        
        
        
        
    }
    catch(err){
        res.send({error:err});
    }
    
    
    
});
router.post('/notifyCustomer',(req,res)=>{
    try{
        
        
        var x=notifyCustomer(req.body.title,req.body.body,req.body.token)
        res.send(x)
        
        
        
        
    }
    catch(err){
        res.send({error:err});
    }
    
    
    
})



router.post('/images',upload.single('upload'), async (req,res)=>{
    
    res.send({message:req.file.filename})
    
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


router.delete('/images/:id',async(req,res)=>{
    db.query(`DELETE FROM images WHERE name="${req.params.id}" `,(err,result)=>{
        if(err) res.send({message:"ERROR"});
        else{
            try{fs.unlinkSync(base+"/uploads/"+req.params.id)
                res.send({message:"SUCCESS"})
        }
            catch(err1){
                
                res.send({message:"ERROR"})
            } 
        }
    })

    
})
router.get('/images/:img_id',(req,res)=>{


    
    const p=fs.readFileSync(base+"/uploads/"+req.params.img_id)
    res.set('Content-Type','image/jpg');


    res.send(p);

    
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
            console.log("getAdmin");
            res.send(result[0])
        })
    }

    catch(err){

    }
})

router.post('/customer/:phone/:registrationToken/:name',async(req,res)=>{
    try{
        
        
       db.query(`SELECT * FROM customer WHERE phone="${req.params.phone}"`,(err,result)=>{
           if(result.length>0){
               db.query(`UPDATE customer SET registrationToken="${req.params.registrationToken}",name="${req.params.name}" WHERE phone="${req.params.phone}"`,(err1,result1)=>{
                   if(!err1){
                       
                       res.send({message:"SUCCESS"})
                   }
               })
           }
           else{
               db.query(`INSERT INTO customer (name,phone,registrationToken,successCount,successPrice,failureCount,failurePrice)
                VALUES("${req.params.name}","${req.params.phone}","${req.params.registrationToken}",0,0,0,0)`,(err2,result2)=>{
                if(err2) {res.send({message:"ERROR"})
                    console.log(err2)
            }
                else{
                    
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
        db.query(`SELECT * FROM orders WHERE phone = "${req.params.phone}"`,(err,result)=>{
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

            
            res.send(result[0])
        })
    }
    catch(err){
        console.log(err)
    }
})


router.post('/placeOrder/:phone',async(req,res)=>{



            console.log("order");
            console.log(req.body);
            db.query(`INSERT INTO orders(contents,name,phone,price,date,status,houseName,streetAddress,latitude,longitude)
             VALUES ("${req.body.contents}","${req.body.name}","${req.params.phone}",
             ${req.body.price},
             "${req.body.date}","A","${req.body.houseName}","${req.body.streetAddress}",
             ${req.body.latitude},${req.body.longitude})`,(err1,result1)=>{
                if(err1) res.send({message:"ERROR"});
                else{
                    console.log(req.body);
                    notificationAdmin("New Order","A Pending order containing "+req.body.contents);
                res.send({message:"SUCCESS"});}
            })
            
    
   



})


// Admin Side

router.post('/admin/:phone/:registrationToken',async(req,res)=>{
    
    try{
        
        
        db.query(`SELECT * FROM admin WHERE ADMINID=0`,(e,r)=>{
            if(e) {
                console.log(e)
                res.send({message:"ERROR"});
            }
            
            
            else{
                
            
            
            if(r[0].phone==req.params.phone){
                db.query(`UPDATE admin SET registrationToken="${req.params.registrationToken}" WHERE phone = "${req.params.phone}"`,(err,result)=>{
                    if(err) console.log(err);
            
                    else  res.send({message:"SUCCESS"});
            
                })
                
            }
            else{
                res.send({message:"ERROR"});
            }
                
            }
                
            

        })

    }
    catch(err){
        res.json({message:"ERROR"});
        console.log(err)
    }

})
router.post('/admin/logout',async(req,res)=>{
    
    db.query(`UPDATE admin SET registrationToken="" WHERE ADMINID=0`,(err,result)=>{
                    if(err) console.log(err);
            
                    else  res.send({message:"SUCCESS"});
            
                })
})
router.post('/admin/phone',async(req,res)=>{
    try{
    db.query(`UPDATE admin SET phone = ${req.body.phone} WHERE phone = ${req.body.oldPhone} `,(err,result)=>{
        if(err) console.log(err);
            
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
        db.query(`UPDATE orders SET status="B",deliveryBoy="${req.body.deliveryBoy}" WHERE OID = ${req.params.id}`,(err,result)=>{
            if(err){
                res.send({message:"ERROR"})
            }
            else {
                db.query(`SELECT * FROM orders WHERE OID=${req.params.id}`,(err1,result1)=>{
                    if(err) res.send({message:"ERROR"})
                    else{
                        
                        
                            
                            notifyPhone("Out for delivery.",`Your order containing ${result1[0].contents} is out for delivery. `,result1[0].phone)
                            
                        
                        
                        
                    }
                })
                
                
                
                }
    })}
    catch(err){

        console.log(err);
        res.send({message:"ERROR"});
    }
})
router.post('/setRider/:id',async(req,res)=>{
    try{
        db.query(`UPDATE orders SET deliveryBoy="${req.body.deliveryBoy}" WHERE OID = ${req.params.id}`,(err,result)=>{
            
            notifyRider(req.body.deliveryBoy);
            if(err){
                
                res.send({message:"ERROR"})
            }
            else{
                res.send({message:"SUCCESS"});
            }
    })}
    catch(err){

        console.log(err);
        res.send({message:"ERROR"});
    }
})
router.post('/processOrder/:id',(req,res)=>{
    try{
        db.query(`UPDATE orders SET status="A2" WHERE OID = ${req.params.id}`,(err,result)=>{
            if(err){
                res.send({message:"ERROR"})
            }
            else {
                db.query(`SELECT * FROM orders WHERE OID=${req.params.id}`,(err1,result1)=>{
                    if(err) res.send({message:"ERROR"})
                    else{
                        
                        
                            
                            notifyPhone("Order has been accepted.",`Your order containing ${result1[0].contents} has been accepted. `,result1[0].phone);
                            
                            res.send({message:"SUCCESS"});
                            
                            
                       
                        
                        
                    }
                })
                
                
                
                
                
                }
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
        

       
                


                        db.query(`SELECT * FROM orders WHERE OID=${req.params.id}`,(err,result)=>{
                            if(err) {
                                console.log(err)
                                res.send({message:"ERROR"})}
                            else{
                                
                                db.query(`DELETE FROM orders WHERE OID=${req.params.id}`,(err1,result1)=>{
                                    if(err1){
                                    res.send({message:"ERROR"})
                                    }
                                })
                                    
                                
                                         
                                         notifyPhone("Order Rejected.",`Your order containing ${result[0].contents} has not been accepted. `,result[0].phone);
                                     
                                 
                                
                            }
                        })
                        
                        res.send({message:"SUCCESS"})
                    
                
            
        
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
        console.log("getProcessing Orders");
        db.query(`SELECT * FROM orders
        WHERE status="A2"`,(err,result)=>{
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
});
router.get('/admin/getDispatchedOrders',async(req,res)=>{


    try{
        db.query(`SELECT * FROM orders
        WHERE status="B"`,(err,result)=>{
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
router.get('/admin/orders/:day/:month/:year',async(req,res)=>{
    try{
        var date="" 
        
        date=req.params.day+" "+req.params.month+" "+req.params.year;
        console.log(date)
        db.query(`SELECT * FROM orders WHERE date LIKE '${date}%' AND (status='C' OR status='D')  `,(err,result)=>{
            if(err){
                console.log(err)
                
            }
            
            res.send(result);
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
router.post('/admin/foodMenu/:fuid/1',(req,res)=>{
    
   db.query(`UPDATE food_unit SET available=1 WHERE FUID=${req.params.fuid}`) 
});
router.post('/admin/foodMenu/:fuid/0',(req,res)=>{
    
   db.query(`UPDATE food_unit SET available=0 WHERE FUID=${req.params.fuid}`) 
});
router.post('/admin/foodMenu/:category/food',async(req,res)=>{

    try{
        

        db.query(`INSERT INTO food_unit(name,price,image,category,available) VALUES (
            "${req.body.name}",${req.body.price},"${req.body.image}","${req.params.category}"
        ,1)`,(err,result)=>{
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
            if(r.length==0){
                res.send({message:"ERROR"});
                return;
            }
            else if(r[0].phone!=null){
                db.query(`UPDATE delivery_boy SET registrationToken="${req.params.registrationToken}" WHERE phone = "${req.params.phone}"`,(err,result)=>{
                    if(err) console.log(err);
            
                    else  res.send({message:r[0].DbID});
                    
            
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
        console.log("getOrders");
        db.query(`SELECT * FROM orders
        WHERE orders.deliveryBoy=${req.params.phone}`,(err,result)=>{
            if(err){
                console.log(err);
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
    
    db.query(`UPDATE orders SET deliveryBoy=${req.params.phone} WHERE OID = ${req.params.id}`,(err,result)=>{
        if(err) console.log(err);
        else res.send({message:"SUCCESS"})
        
    })
})
router.post('/rider/phone/:phone/id/:id/delivered',async(req,res)=>{
    try{

        db.query(`SELECT * FROM orders WHERE OID= ${req.params.id}`,(err,result)=>{
            db.query(`UPDATE customer SET successCount=successCount+1,successPrice=successPrice+${result[0].price} WHERE phone=${result[0].phone}`)
        
        db.query(`UPDATE orders SET status="C" WHERE OID= ${req.params.id}`,(err,result1)=>{
            
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
        

        db.query(`UPDATE orders SET status="D" WHERE OID= ${req.params.id}`,(err2,result2)=>{
            if(err2) res.send({message:"ERROR"})
            else {
                notificationAdmin("Order Failed",`Order by ${result[0].name} was fake.`);
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