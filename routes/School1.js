const express=require('express');
const router=express.Router();
var mongoose = require('mongoose');
mongoose.set('useFindAndModify', false);


const {User}=require('../models/UserModel');
const {Teacher}=require('../models/UserModel');
const {Driver}=require('../models/UserModel');
const {Student}=require('../models/UserModel');
const {Course}=require('../models/UserModel');
const {Image}=require('../models/UserModel');
const {Test}=require('../models/UserModel');
const {HOD}=require('../models/UserModel');
const multer  = require('multer');
const upload=multer({
    
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




router.post('/student',async (req,res)=>{
    var post=new User({
        userId:req.body.userId,
        name:req.body.name,
        phone:req.body.phone,
        token:req.body.token,
        dateOfBirth:req.body.dateOfBirth,
        

    });
    
    const post1=new Student({
        
        details:post._id
    });
    post.otherId=post1._id
    try{
    await post.save() ;
    await post1.save();
    res.send({message:"SUCCESS"});}
    catch(err){
        res.send({message:"ERROR"});
    }

});

router.get('/student',async (req,res)=>{
    try{
        const posts=await Student.find().populate('details');
        res.json(posts);
    }
    catch(err){
        res.send({message:"ERROR"});
    }                                                                        
} );
router.delete('/student',async (req,res)=>{
    try{
        await User.findById(req.body.user_id).exec().then(async ele=>{
            
            await Student.findByIdAndDelete(ele.otherId);
            ele.delete();
            
        })
        res.send({message:"SUCCESS"});
    }
    catch(err){
        res.send({message:"ERROR"});

    }
});
router.put('/student',async (req,res)=>{
    
    try{
        
        await User.updateOne({userId:req.body.userId},{
            name:req.body.name,
            phone:req.body.phone,
            dateOfBirth:req.body.dateOfBirth});
        res.send({message:"SUCCESS"});
    }
    catch(err){
        res.send({message:"ERROR"});
    }
    

});
// ****************************************************************************************************************

router.post('/teacher',async (req,res)=>{
    const post=new User({
        userId:req.body.userId,
        name:req.body.name,
        phone:req.body.phone,
        token:req.body.token,
        dateOfBirth:req.body.dateOfBirth

    });
    
    const post1=new Teacher({
        
        details:post._id
    });
    post.otherId=post._id;
    try{
    await post.save() ;
    await post1.save();
    res.send({message:"SUCCESS"});}
    catch(err){
        res.send({message:"ERROR"});
    }

});

router.get('/teacher',async (req,res)=>{
    try{
        const posts=await Teacher.find().populate('details');
        res.json(posts);
    }
    catch(err){
        res.send({message:"ERROR"});
    }                                                                        
} );
router.delete('/teacher',async (req,res)=>{
    try{
        await User.findById(req.body.user_id).exec().then(async ele=>{
            
            await Teacher.findByIdAndDelete(ele.otherId);
            ele.delete();
            
        })
        res.send({message:"SUCCESS"});
    }
    catch(err){
        res.send({message:"ERROR"});

    }
});
router.put('/teacher',async (req,res)=>{
    
    try{
        
        await User.updateOne({userId:req.body.userId},{
            name:req.body.name,
            phone:req.body.phone,
            dateOfBirth:req.body.dateOfBirth});
        res.send({message:"SUCCESS"});
    }
    catch(err){
        res.send({message:"ERROR"});
    }
    

});

// ****************************************************************************************************************
router.post('/teacher/courses',async (req,res)=>{
     
        
    try{
        
        var post=new Course({
            teacher_id:req.body.teacher_id,
            courseId:req.body.courseId,
            courseTitle:req.body.courseTitle

        })
        post.userList.push(req.body.user_id);
        await post.save();
        
        await Teacher.findByIdAndUpdate(req.body.teacher_id,
            {$push:{
                courses:post._id
            }
        });
        res.json({message:"SUCCESS"});


        
    
    
        
        
    }
    catch(err){
        res.json({message:"ERROR"});
    };
});
router.get('/teacher/courses',async (req,res)=>{
    try{
        const post= await Teacher.findById(req.body.teacher_id);
        post.toJSON().courses.forEach(async element => {
            try {
                // var id=mongoose.Types.ObjectId(element);
                await Course.findById(element).exec().then(async ele=>{
                    
                    
                    if( !ele.toJSON().userList.includes(req.body.user_id)){
                        await Teacher.findById(req.body.teacher_id).exec().then(async el=>{
                            el.courses.pull(element);
                            await el.save();
                            
                        })
                    }
                    
                });
                
                
            
            
            
           
                
            } catch (error) {
                var id=mongoose.Types.ObjectId(element);
                var post1=await Course.findById(id);
                res.send(post1);
                
            }
            

            
        });

        
        const post2=await Teacher.findById(req.body.teacher_id).populate("courses");
        res.json(post2);
        
    }
    catch(err){
        
    }

});


router.delete('/teacher/courses',async (req,res)=>{
    
    try{
        await Course.findByIdAndDelete(req.body.course_id)
        res.send({message:"SUCCESS"});
    }
    catch(err){
        res.send({message:"ERROR"});
    };
});
// ***********************************************************************************************************************************





router.put('/teacher/courses/teacher', async (req,res)=>{
    try{
        await Course.findById(req.body.course_id).exec().then(async ele=>{
            ele.userList.push(req.body.user_id);
            ele.save();
        })
        await Teacher.findById(req.body.teacher_id).exec().then(async element=>{
            element.courses.push(req.body.course_id);
            element.save();
        })
            
        
        res.json({message:"SUCCESS"});
        
    }
    catch(err){
        res.json({message:"ERROR"});
    }

});




router.put('/teacher/courses/student', async (req,res)=>{
    try{
        await Course.findById(req.body.course_id).exec().then(async ele=>{
            ele.userList.push(req.body.user_id);
            ele.save();
        })
        await Student.findById(req.body.student_id).exec().then(async element=>{
            element.courses.push(req.body.course_id);
            element.save();
        })  
        
        res.json({message:"SUCCESS"});
        
    }
    catch(err){
        res.json({message:"ERROR"});
    }

});






router.delete('/teacher/courses/User', async (req,res)=>{
    try{
        await Course.findById(req.body.course_id).exec().then(async ele=>{
            ele.userList.pull(req.body.user_id);
            await ele.save();
        })
       
           
        
        res.json({message:"SUCCESS"});
        
    }
    catch(err){
        res.json({message:"ERROR"});
    }

});
router.get('/teacher/courses/User', async (req,res)=>{
    try{
        const post=await Course.find({_id:req.body.course_id}).populate('userList');
        res.json(post.userList);
        
        
    }
    catch(err){
        res.send("ERROR");
    }

});
router.put('/teacher/courses/announcements',upload.single('upload'), async (req,res)=>{
    
    try{
        var img=new Image();
        img.image=req.file.buffer;
        img.save();
        
    
    await Course.findById(req.body.course_id).exec().then(async ele=>{
        ele.announcements.push({
            date:req.body.date,
            announcement:req.body.announcement,
            link:req.body.link,
            image:img._id
        })
        ele.save();
    })
    
        res.send({message:"SUCCESS"});  
    }

    catch(err){
        res.send({message:"ERROR"});
    }
},(err,req,res,next)=>
res.send({message:err}));


router.get('/images/:img_id',async (req,res)=>{
      

    await Image.findById(req.params.img_id).exec().then(async ele=>{
        
        res.set('Content-Type','image/jpg');
        res.send(ele.image);   
    })
})
router.post('/images',upload.single('upload'), async (req,res)=>{
    
    try{
        var img=new Image();
        img.image=req.file.buffer;
        img.save();
        
    
    
    
        res.send({message:"SUCCESS"});  
    }

    catch(err){
        res.send({message:"ERROR"});
    }
},(err,req,res,next)=>
res.send({message:err}));

router.get('/test',async (req,res)=>{
    res.send({message:"Heloo"});
})



router.post('/teacher/courses/tests',async (req,res)=>{

    try{
    Course.findById(req.body.course_id).exec().then(async ele=>{
        var post1=new Test({
            teacher_id:ele.teacher_id,
            student_id:ele.userList,
            not_attempted:ele.userList,
            end_date:req.body.end_date,
            accepting:true,
            questions:req.body.questions
        });
        await post1.save();
        ele.push(post1._id);
        await ele.save();
        res.json({message:"SUCCESS"});
        
    })}
    catch(err){
        res.json({message:"ERROR"});
    }

    
});


router.get('/teacher/courses/tests',async (req,res)=>{
    try
   { await Test.findById(req.body.test_id).populate('marks.user_id').exec().then(async ele=>{
        res.json(ele);

    })}
    catch(err){
        res.json({message:"ERROR"});
    }
});

router.post('/student/courses/tests',async (req,res)=>{
    try{
        await Test.findById(req.body.test_id).exec().then(async ele=>{
            ele.marks.push({user_id:req.body.user_id,
            marks:req.body.marks});
            ele.not_attempted.pull(req.body.user_id);
            ele.save();

        })
        res.json({message:"SUCCESS"});
    }
    catch(err){
        res.json({message:"ERROR"});
    }
});


router.get('/student/courses/tests',async (req,res)=>{
    try{
        var post=[];
        await Course.findById(req.body.course_id).exec().then(async ele=>{
            ele.toJSON().tests.forEach(async element => {
                await Test.findById(element).exec().then(async ele=>{
                    if(ele.toJSON().not_attempted.includes(req.body.user_id))
                    post.push(element);
                })
                
            });
            res.json(post);
        })
    }
    catch(err)
    {res.json({message:"ERROR"})}
})





router.post('/hod',async (req,res)=>{
    const post=new User({
        userId:req.body.userId,
        name:req.body.name,
        phone:req.body.phone,
        token:req.body.token,
        dateOfBirth:req.body.dateOfBirth

    });

})



router.get('/hod/getTeachers',async (req,res)=>{
    try{
        await Teacher.find().populate('details').exec().then(async ele=>{
            res.json(ele);
        })

    }
    catch(err){
        res.json({message:"ERROR"});
    }
});









router.get('/:postId',async (req,res)=>{
    try{
    const post=await Post.findById(req.params.postId);
    res.json(post);}
    catch(err){
        res.json({message:err});
    }
});

router.get('/specific',(req,res)=>{
    res.send('We are on specific');
});

module.exports= router;
