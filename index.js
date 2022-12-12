const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const app = express()
const port = process.env.PORT || 5001
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY)

app.use(cors());
app.use(express.json());



const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');



// const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.a2sdt.mongodb.net/?retryWrites=true&w=majority`;
// const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

const uri = "mongodb+srv://computers:tCCfUnBSXhrMD6gB@cluster0.kybxr.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });





app.get('/',(req,res)=>
    res.send('Hello World')
)

async function run() {
    try {
      await client.connect();
      const partsCollection = client.db('computer').collection('parts');
      const orderCollection = client.db('computer').collection('order');
      const blogCollection = client.db('computer').collection('blogs');
      const factureCollection = client.db('computer').collection('facture');
      const reviewCollection = client.db('computer').collection('review');
      const userCollection = client.db('computer').collection('user');
      const businessCollection = client.db('computer').collection('business');
      const paymentCollection = client.db('computer').collection('payment');
    

    app.post('/create-payment-intent',async(req,res)=>{
        const order = req.body;
        const price=  order.totalPrice
        const amount = price*100
        if(amount){
              const paymentIntent = await stripe.paymentIntents.create({
            amount:amount,
            currency:'usd',
            payment_method_types:['card']
        });
        res.send({clientSecret: paymentIntent.client_secret})
        }
    })
    
      app.get('/parts', async(req,res)=>{
          const query = {}
          const result =  await partsCollection.find(query).toArray()
          res.send(result)
      })
      app.get("/parts/:id", async (req, res) => {
        const id = req.params.id;
        const query = { _id: ObjectId(id) };
        const result = await partsCollection.findOne(query);
        res.send(result);
      });
      app.post('/parts', async (req, res) => {
        const query = req.body;
        const result = await orderCollection.insertOne(query);
        res.send(result)        
      });
      // Orders
      app.get('/order',async(req,res)=>{
          const query = {}
          const result = await orderCollection.find(query).toArray()
          res.send(result)
      })
      app.get('/orders',async(req,res)=>{
        const email = req.query.email;
        const query = { email: email };
        const result = await orderCollection.find(query).toArray();
        res.send(result)
      })
      app.get('/orders/:id',async(req,res)=>{
        const id = req.params.id;
        const query ={ _id: ObjectId(id) };
        const result = await orderCollection.findOne(query);
        res.send(result)
      })
      app.post('/order', async (req, res) => {
        const query = req.body;
        const result = await orderCollection.insertOne(query);
        res.send(result)        
      });
      app.patch('/orders/:id',async(req,res)=>{
        const id = req.params.id;
        const payment = req.body;
        const filter ={ _id: ObjectId(id) };
        const updateDoc = {
            $set:{
                paid: true,
                transactionId:payment.transactionId
            }
        }
        const result = await paymentCollection.insertOne(payment)
        const update = await orderCollection.updateOne(filter,updateDoc)
        res.send(updateDoc)
      })
      app.delete("/orders/:id", async (req, res) => {
        const id = req.params.id;
        const query = { _id: ObjectId(id) };
        const result = await orderCollection.deleteOne(query);
        res.send(result);
      });
      // Review
      app.get('/review', async(req,res)=>{
          const query = {}
          const result = await reviewCollection.find(query).toArray()
          res.send(result)
      } )
      app.post('/review', async(req,res)=>{
          const query = req.body
          const result = await reviewCollection.insertOne(query)
          res.send(result)
      })
      // Blogs
      app.get('/blogs', async(req,res)=>{
          const query = {}
          const result  = await blogCollection.find(query).toArray()
          res.send(result)
      })
      // Feature
      app.get('/feature',async(req,res)=>{
          const query = {}
          const result = await factureCollection.find(query).toArray()
          res.send(result)
      })
      // Business
      app.get('/business', async(req,res)=>{
          const query = {}
          const result = await businessCollection.find(query).toArray()
          res.send(result)
      })
      // All user
      app.get('/user', async (req, res) => {
          const query = {}
        const users = await userCollection.find(query).toArray();
        res.send(users);
      });
  
      app.get('/admin/:email', async (req, res) => {
        const email = req.params.email;
        const user = await userCollection.findOne({ email: email });
        const isAdmin = user.role === 'admin';
        res.send({ admin: isAdmin })
      })
  
      app.put('/user/admin/:email', async (req, res) => {
        const email = req.params.email;
        const filter = { email: email };
        const updateDoc = {
          $set: { role: 'admin' },
        };
        const result = await userCollection.updateOne(filter, updateDoc);
        res.send(result);
      })
  
      app.put('/user/:email', async (req, res) => {
        const email = req.params.email;
        const user = req.body;
        const filter = { email: email };
        const options = { upsert: true };
        const updateDoc = {
          $set: user,
        };
        const result = await userCollection.updateOne(filter, updateDoc, options);
        const token = jwt.sign({ email: email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '23h' })
        res.send({ result, token });
      });
      app.put("/update/:email", async (req, res) => {
        const email = req.params.email;
        const filter = {email:email };
        const user = req.body
        const options = { upsert: true };
        const updateDoc = {
          $set: {
            phone:user.phone,
            education:user.education,
            location:user.location
          },
        };
        const result = await userCollection.updateOne(
          filter,
          updateDoc,
          options
        );
  
        res.send(result);
      });
    }
    finally{

    }
}
run().catch(console.dir)

app.listen(port, () => {
    console.log(`Munfacturer Computer  listening on port ${port}`)
  })