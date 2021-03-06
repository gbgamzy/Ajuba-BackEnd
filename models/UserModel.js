var mongoose = require('mongoose');
const { ImageSchema } = require("./SchoolSchema");


const FoodUnitSchema=mongoose.Schema({

        name:{type:String},
        price:Number,
        image:{type:mongoose.Schema.Types.ObjectId,
            ref:'Images'},
        quantity:Number

});
const FoodSchema=mongoose.Schema({
    category:String,
    list:[{type:mongoose.Schema.Types.ObjectId,
        ref:'FoodUnit',
    index:{unique:true,
    sparse:true}}]
});
const OrderSchema=mongoose.Schema({
    contents:String,
    price:Number,
    address:{
        houseName:String,
        streetAddress:String,
        latitude:String,
        longitude:String
    },
    date:String,
    customerPhone:String,
    preDeliveryBoy:{name:String,
        phone:String},
    
    deliveryBoy:{name:String,
    phone:String},
    status:String

})

const AdminSchema=mongoose.Schema({
    registrationToken:String,

        address:{streetAddress:String,
            latitude:Number,
            longitude:Number},
    prices:{
        dist1:Number,
        price1:Number,
        dist2:Number,
        price2:Number,
        dist3:Number,
        price3:Number
    },

    
    phone:{type:String,
    index:{
        required:true,
        unique:true
    }}
})
const RiderSchema=mongoose.Schema({
    registrationToken:String,
    name:String,
    phone:{type:String,
        index:{
            unique:true
        }
    },
    latitude:Number,
    longitude:Number,
    preAcceptedOrder:[{type:mongoose.Schema.Types.ObjectId,
        ref:'Orders'}],

    orders:[{type:mongoose.Schema.Types.ObjectId,
        ref:'Orders'}]
})
const CustomerSchema=mongoose.Schema({
    
    
    phone:{type:String},
    registrationToken:[{type:String}
    ],

    orders:[{type:mongoose.Schema.Types.ObjectId,
    ref:'Orders'}]

})

const mydb=mongoose.connection.useDb('db');
const mydb1=mongoose.connection.useDb('db1');


var order={
    OID :0 ,
phone :0000000000,
contents :"",
price :0 ,
address :0,
date :"",
predeliveryBoy:0,
deliveryBoy:0,
status:""
}
const customers=mydb1.model('Customers',CustomerSchema);
const admin=mydb1.model('Admin',AdminSchema);
const rider=mydb1.model('Rider',RiderSchema);
const food=mydb1.model('Food',FoodSchema)


const foodUnit=mydb1.model('FoodUnit',FoodUnitSchema)




module.exports= {
   
    Order:order,
    Customer:customers,
    Food:food,
    Admin:admin,
    Rider:rider,
    
    FoodUnit:foodUnit

    

};
