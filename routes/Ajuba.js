const path=require('path');

const express=require('express');
const router=express.Router();
const mysql=require('mysql');
var fs = require("fs");

const base=path.resolve('.')



const db=mysql.createConnection({
    host:'127.0.0.1',
    port:3306,
     user:'root',
     password:'',
     database:'ajuba'
 });






const multer  = require('multer');

const storage=multer.diskStorage({
    destination: function (req, file, cb) {
         cb(null,base+"\\uploads");
       }
})
const upload=multer({

    
    
   storage:storage,
    
    
    limits:{
        fileSize:7000000
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
    }).catch((err)=>{

        console.log(err)
    })
}
router.post('/addAdmin',async (req,res)=>{
    let sql=`INSERT INTO admin (phone,latitude,longitude) VALUES ("${req.body.phone}",${req.body.latitude},${req.body.longitude})`
    db.query(sql,(err,result)=>{
        if(err)
        throw err
        else
        console.log(result)
    })
    
    res.send("SUCCESS")
})


router.post('/images',upload.single('upload'), async (req,res)=>{
    
    try{

    console.log(req.file);
    console.log(req.body.id);
    console.log(req.file.filename);
    res.send({message:req.file.filename})

   
    
    
        
    }

    catch(err){
        console.log(err)
        
    }
},(err,req,res,next)=>
res.send({message:err}));

router.delete('/images/:id',async(req,res)=>{
    db.query(`DELETE FROM images WHERE name="${req.params.id}" `,(err,result)=>{
        if(err) throw err;
        else{
            try{fs.unlinkSync(base+"\\uploads\\"+req.params.id)}
            catch(err1){
                console.log(err1);
            } 
        }
    })

    console.log("delete"+req.params.id)
})
router.get('/images/:img_id',async (req,res)=>{


    
    const p=fs.readFileSync(base+"\\uploads\\"+req.params.img_id)
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
            if(err) throw err;
            console.log(result[0])
        })
    }
    catch(err){

    }
})

router.post('/customer/:phone/:registrationToken',async(req,res)=>{
    try{
        
        
       db.query(`UPDATE customer SET registrationToken = "${req.body.registrationToken}" WHERE phone = "${req.body.phone}"`,
       (err,result,fields)=>{
        if(err) {
            
            db.query(`INSERT INTO customer (phone,registrationToken) VALUES("${req.body.phone}","${req.body.registrationToken}")`,(err1,result1)=>{
                if(err1) res.send({message:"ERROR"})
                else{
                    res.send({message:"SUCCESS"})
                }
            })
        }
        else{
            res.send({message:"SUCCESS"})
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
            if(err) throw err;
            res.send(result);
        })
    }
    catch(err){
        res.status(400).json({message:"Some error occurred from our end"});
    }
})

router.get('/customer/food',async(req,res)=>{
    db.query(`SELECT * FROM food_unit`,(err,result)=>{
        if(err) throw err;
        res.send(result);
    })
})
router.get('/customer/:phone/orders',async(req,res)=>{
    try{
        db.query(`SELECT *FROM orders WHERE phone = "${req.params.phone}"`,(err,result)=>{
            if(err) throw err;
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
            if(err) throw err;

            console.log([result[0]])
        })
    }
    catch(err){
        console.log(err)
    }
})


router.post('/placeOrder/:phone',async(req,res)=>{



       
    
            db.query(`INSERT INTO orders(contents,phone,price,address,date,status,deliveryBoy,predeliveryBoy,houseName,streetAddress,latitude,longitude)
             VALUES ("${req.body.contents}","${req.params.phone}",
             ${req.body.price},"${result.insertId}",
             "${req.body.date}","A",${req.body.deliveryBoy},
             ${req.body.predeliveryBoy},"${req.body.address.houseName}","${req.body.address.streetAddress}",
             ${req.body.address.latitude},${req.body.address.longitude})`,(err1,result1)=>{
                if(err1) res.send({message:"ERROR"});
                else
                res.send({message:"SUCCESS"});
            })
            
    
   



})


// Admin Side

router.post('/admin/:phone/:registrationToken',async(req,res)=>{
    try{
    db.query(`UPDATE admin SET registrationToken="${req.params.registrationToken}" WHERE phone = "${req.params.phone}"`,(err,result)=>{
        if(err) throw err;

        else  res.send({message:"SUCCESS"});

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
        if(err) throw err;
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
        db.query(`SELECT * FROM orders WHERE phone="${req.params.phone}"`,(err,result)=>{
            if(err){
                res.send({message:"ERROR"})

            }
            else{
                res.send(result);
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
            else res.send({message:"SUCCESS"});
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
            else res.send({message:"SUCCESS"});
        })
        
        
    }
    catch(err){
        console.log(err);
        res.send({message:err});
    }
})
router.get('/admin/getOrder/:id',async(req,res)=>{
    try{
        db.query(`SELECT orders.OID AS OID,orders.phone AS phone,orders.contents AS contents,orders.price AS price,
        orders.date AS date,orders.status As status,orders.streetAddress AS streetAddress,
        delivery_boy.name AS deliveryBoyName,delivery_boy.phone AS deliveryBoyPhone FROM orders 
        
        INNER JOIN delivery_boy ON orders.deliveryBoy=delivery_boy.DbID WHERE order.OID=${req.params.id}`,(err,result)=>{
            if(err){
                res.send({message:"ERROR"})
            }
            else
            res.send(result)
        })}
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

       
                db.query(`DELETE FROM orders WHERE OID=${req.params.id}`,(err1,result1)=>{
                    if(err1){
                        res.send({message:"ERROR"})
                    }
                    else{
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
        WHERE order.status="A"`,(err,result)=>{
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
router.get('/admin/getProcessingOrders',async(req,res)=>{


    try{
        db.query(`SELECT orders.OID AS OID,orders.phone AS phone,orders.contents AS contents,orders.price AS price,
        orders.date AS date,orders.status As status,orders.streetAddress AS streetAddress,
        delivery_boy.name AS deliveryBoyName,delivery_boy.phone AS deliveryBoyPhone FROM orders 
        
        INNER JOIN delivery_boy ON orders.deliveryBoy=delivery_boy.DbID
        WHERE orders.status="A2"`,(err,result)=>{
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

router.post('/admin/foodMenu/category/:category',async(req,res)=>{

    try{
        db.query(`INSERT INTO food_menu(category) VALUES
         ("${req.params.category}")`,(err,result)=>{
            if(err) throw err;
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
            if(err) throw err;
            else{
                db.query(`SELECT images FROM food_unit WHERE category="${req.params.category}"`,(err2,result2)=>{
                    if(err2) throw err;
                    else{try{
                        result.toJSON().forEach(element => {
                            fs.unlinkSync('../upload/'+element.image)
                            
                        });}
                        catch(err3){
                            console.log(err3);
                        }
                    }
                })
                db.query(`DELETE FROM food_unit WHERE category="${req.params.category}"`,(err1,result1)=>{
                    if(err1) throw err1;
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
            if(err) throw err;
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
            if(err) throw err;
            else{res.send({message:"SUCCESS"});
            }
        })

    }
    catch(err){
        res.send({message:"SUCCESS"})
        console.log(err);
    }
})

router.get('/admin/prices',async(req,res)=>{
    db.query(`SELECT * FROM admin `,(err,result)=>{
        if(err) throw err;
        else{res.send(result[0])}
    })
})

router.post('/admin/prices',async(req,res)=>{
    db.query(`UPDATE admin SET dist1=${req.body.dist1},dist2=${req.body.dist2},dist3=${req.body.dist3},
    price1=${req.body.price1},price2=${req.body.price2},price3=${req.body.price3},minimumDistance=${req.body.minimumDistance}
    ,minimumPrice=${req.body.minimumPrice} WHERE ADMINID = 0`,(err,result)=>{
        if(err) throw err;
        else{res.send({message:"SUCCESS"})}
    })
    
})

router.get('/admin/getRidersList',async(req,res)=>{
   db.query(`SELECT name AS deliveryBoyName,phone AS deliveryBoyPhone FROM delivery_boy `,(err,result)=>{
       if(err) throw err;
       else{res.send(result);}
   })

})
router.get('/admin/rider/:id/getOrders',async(req,res)=>{
    db.query(`SELECT * FROM orders WHERE deliveryBoy=${req.params.id}`,(err,result)=>{
        if(err) throw err;
        else{
            res.send(result);
        }
    })
})
router.post('/admin/getRidersList',async(req,res)=>{
    db.query(`INSERT INTO delivery_boy(name,phone) VALUES ("${req.body.deliveryBoyName}","${req.body.deliveryBoyPhone}")`,(err,result)=>{
        if(err) throw err;
        else{res.send({message:"SUCCESS"});}
    })
    

})
router.delete('/admin/getRidersList/:phone',async(req,res)=>{
    try{
        db.query(`DELETE FROM delivery_boy WHERE phone="${req.params.phone}"`,(err,result)=>{
            if(err) throw err;
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

        db.query(`UPDATE delivery_boy SET registrationToken="${req.params.registrationToken}" WHERE phone="${req.params.phone}"`,(err,result)=>{
            if(err) res.json({message:"ERROR"});
            else{
            db.query(`SELECT DbID FROM delivery_boy WHERE phone="${req.params.phone}"`,(err1,result1)=>{
                if(err1) res.send({message:"ERROR"})
                else res.send({message:result1[0].DbID})
            })}
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
    await Rider.findOne({phone:req.params.phone}).exec().then(async ele=>{
        ele.latitude=req.body.latitude
        ele.longitude=req.body.longitude
        ele.save()
        console.log("ipdate location rider")
        res.send()
        
        
    })
})
router.post('/rider/:phone/id/:id/accepted',async(req,res)=>{
    db.query(`UPDATE orders SET deliveryBoy=${req.params.phone} WHERE OID = ${req.params.id}`,(err,result)=>{
        if(err) res.send({message:"ERROR"})
        else res.send({message:"SUCCESS"})
    })
})
router.post('/rider/phone/:phone/id/:id/delivered',async(req,res)=>{
    try{


        db.query(`UPDATE orders SET status="C" WHERE OID= ${req.params.id}`,(err,result)=>{
            if(err) res.send({message:"ERROR"})
            else res.send({message:"SUCCESS"});
        })
        
        
        
    }
    catch(err){
        res.send({message:"ERROR"})
    }

})
router.post('/rider/:phone/:id/declined',async(req,res)=>{
    try{ 

        db.query(`UPDATE orders SET status="D" WHERE OID= ${req.params.id}`,(err,result)=>{
            if(err) res.send({message:"ERROR"})
            else res.send({message:"SUCCESS"});
        })
       
    }
    catch(err){
        res.send({message:"ERROR"})
    }

})

module.exports= router;