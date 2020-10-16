const express = require('express');
require('dotenv').config();


const bodyParser = require('body-parser');
const cors = require('cors');

const fileUpload = require('express-fileupload');

const MongoClient = require('mongodb').MongoClient;
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.xu8lv.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

const app = express()

app.use(bodyParser.json());
app.use(cors());

app.use(express.static('images'));
app.use(fileUpload());

const port = 5000

app.get('/',(req,res)=>{
  res.send("WELCOME TO Creative Agency")
})


const client = new MongoClient(uri, { useNewUrlParser: true,useUnifiedTopology:true });
client.connect(err => {
  //console.log(err);
  const serviceCollection = client.db("CreativeAgent").collection("services");
  const reviewCollection = client.db("CreativeAgent").collection("reviews");
  const OrderCollection = client.db("CreativeAgent").collection("orders");
  const adminCollection = client.db("CreativeAgent").collection("admin");
 
 console.log('database connected')

 app.post('/addService',(req,res)=>{
    const newService=req.body;
    console.log(newService);
   serviceCollection.insertMany(newService)
        .then(result=>{
          //console.log(result)
          res.send(result.insertedCount);
        })
   
  })

  app.post('/addReview',(req,res)=>{
    const title = req.body.title;
    const designation = req.body.designation;
    const description = req.body.description;
   
    reviewCollection.insertOne({ title, designation, description })
        .then(result => {
            res.send(result.insertedCount > 0);
        })
  })

  


  app.post('/addOrder', (req, res) => {
    const file = req.files.file;
    const name = req.body.name;
    const email = req.body.email;
    const service = req.body.service;
    const description = req.body.description;
    // console.log(file,name,email,service,description)
    const newImg = file.data;
    const encImg = newImg.toString('base64');

    var image = {
        contentType: file.mimetype,
        size: file.size,
        img: Buffer.from(encImg, 'base64')
    };

    OrderCollection.insertOne({ name, email,service, description, image })
        .then(result => {
            res.send(result.insertedCount > 0);
        })
})



app.post('/addAdmin', (req, res) => {
  const email = req.body.email;
  console.log(email);
  adminCollection.insertOne({email})
      .then(result => {
          res.send(result.insertedCount > 0)
      })
});





app.get('/admin', (req, res) => {
  adminCollection.find({})
  .toArray((err, documents) => {
      res.send(documents);
  })
})

  app.get('/addService', (req, res) => {
    serviceCollection.find({})
    .toArray( (err, documents) => {
        res.send(documents);
    })
  })

  app.get('/addReview', (req, res) => {
    reviewCollection.find({})
    .toArray( (err, documents) => {
        res.send(documents);
    })
  })

  


  app.get('/orders',(req,res)=>{
    OrderCollection.find({})//email:req.query.email
    .toArray((err,documents)=>{
      res.send(documents);
    })
  })


});
app.listen(process.env.PORT||port)