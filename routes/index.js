var express = require('express');
var router = express.Router();
var mongoose=require('mongoose');   
var {MongoClient}=require('mongodb');
const {dbUrl, dbName}=require('../config/dbConfig')
mongoose.set('strictQuery', false);

const client=new MongoClient(dbUrl);
// Establish the connection when the application starts
 client.connect()
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.error('Failed to connect to MongoDB:', error);
  });
 

/* get all students */

router.get('/students',async function(req, res, next) {
   
 
    const database = client.db('studentTeacherMng');
    const collection = database.collection('student');
  
    const allStudents = await collection.find().toArray();
   
    res.status(200).send(allStudents)
    
});

/* create students. */
router.post('/createStudents',async function(req, res, next) {
  
    const database = client.db('studentTeacherMng');
    const collection = database.collection('student');
     const alreadyPresent=await collection.findOne({email:req.body.email});
     console.log( alreadyPresent);
     if(alreadyPresent){
      res.status(403).send("already student exists!!");
     }
     else{
            if(req.body.currentMentor == null){
              let data=req.body;
              data.currentMentor="not alloted";
              console.log(data);
              const documents = await collection.insertOne(data);
              res.status(200).send(documents);

            }
            else{
              let data=req.body;
              const documents = await collection.insertOne(data);
              res.status(200).send(documents);
            }
          
      
     }
    
});

/* get all mentors*/

router.get('/mentors',async function(req, res, next) {
  
    const database = client.db('studentTeacherMng');
    const collection = database.collection('mentor');
  
    const documents = await collection.find().toArray();
    console.log(documents);
    res.status(200).send(documents);
    
 

});


/* create mentors. */

router.post('/createMentors',async function(req, res, next) {
  
   const database = client.db('studentTeacherMng');
   const collection = database.collection('mentor');
   const alreadyPresent=await collection.findOne({email:req.body.email});
     console.log( alreadyPresent);
     if(alreadyPresent){
      res.status(403).send("already mentor exists!!");
     }
     else{
     const documents = await collection.insertOne(req.body);
     res.status(200).send(documents);
     await client.close();
     }
});

/* get all students of particular mentor */

router.get('/mentorStudents/:mentorEmail',async function(req,res,next){
       
      const mentorEmail=req.params.mentorEmail;
      console.log(mentorEmail);   
      const db=client.db('studentTeacherMng');
      const studentCollection= db.collection('student');
      const mentorCollection = db.collection('mentor');
      
      const mentor=await mentorCollection.findOne({email:mentorEmail});
      const mentorName=mentor.mentorName;
      const filter={"currentMentor":mentorName};
      console.log(filter);
      const studentList= await  studentCollection.find(filter).toArray();
      
      if(studentList.length>0){
        res.status(200).send(studentList)
      }
      else{
        res.status(400).send("no mentor  available in the name :  "+ req.params.mentor)
      }
     
})

/* all mentor list of particular student */
router.get('/student/mentorList/:studentEmail',async function(req,res,next){

  const studentEmail=req.params.studentEmail;
  const db=client.db('studentTeacherMng');
  const studentCollection=db.collection('student');
  const student=await studentCollection.findOne({email:studentEmail});
  if(!student){
    res.status(404).send('student not created .....!!!!!!')
  }
  
  if(student.mentorList!== undefined && student.mentorList!== null && student.mentorList.length>0){
    const mentorList=student.mentorList;
    res.status(200).send(`mentor list of ${student.name} : ${mentorList.map((mentor,index)=>{
      return `${index+1}) ${mentor}  `;
    })}`)
  }else{
    res.status(404).send("mentor list not found for this student");
  }
  



})

/* change mentor */
router.put('/student/changeMentor/:studentEmail/:newMentor',async function(req,res,next){
  const studentEmail=req.params.studentEmail;
  const newMentor=req.params.newMentor;
  console.log(newMentor);
  console.log(studentEmail);   
  const db=client.db('studentTeacherMng');
  const studentCollection= db.collection('student');
  const mentorCollection = db.collection('mentor');
  const student=await studentCollection.findOne({email:studentEmail});
 
    if( student.mentorList== undefined || student.mentorList<1 ){
      console.log("no old mentor list");
      const oldMentors=student.currentMentor;
      student.mentorList=[];
      student.mentorList.push(oldMentors);
     // student.mentorList={oldMentors:student.currentMentor};
      student.currentMentor=newMentor;
      const filter={email:student.email};
      const update={$set:student};
      const options = {
        returnOriginal: false, 
      };
      const updatedStudent=await studentCollection.findOneAndUpdate(filter,update,options);
      res.status(200).send(`mentor changed from old mentor ${oldMentors}`);
  }
  else{
         
        const oldMentors=student.currentMentor;
        student.mentorList.push(oldMentors);
        student.currentMentor=newMentor;
        const filter={email:student.email};
        const update={$set:student};
        const options = {
          returnOriginal: false, 
        };
        const updatedStudent=await studentCollection.findOneAndUpdate(filter,update,options);
        
        res.status(200).send(`mentor changed from old mentor ${oldMentors}`);
  }
  
 
  
 

  
})
  
module.exports = router;
