const express = require('express');
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, Collection, ObjectId } = require('mongodb');
require('dotenv').config()
const EventEmitter = require('events');
const stripe = require('stripe')

// middleware
app.use(cors())
app.use(express.static("public"))
app.use(express.json())


// uri
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.zmpua4z.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});
async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await
    client.connect();
    // db and Collection


    const userCollection = client.db('SummarCamp').collection('users')
    const classCollection = client.db('SummarCamp').collection('Classes')



    //classes api
    app.post('/all-classes', async (req, res) => {
      const classes = req.body
      const result = await classCollection.insertOne(classes)
      res.send(result)
    })

    //users api
    app.post('/all-users', async (req, res) => {
      const user = req.body;
      const query = { email: user?.email }
      const existingUser = await userCollection.findOne(query);
      if (existingUser) {
        return res.send({})
      }
      const result = await userCollection.insertOne(user)
      res.send(result)
    })
    app.get('/user/admin/:email', async (req, res) => {
      const email = req.params.email;
      const query = { email: email, role: 'admin' }
      console.log(email)
      const admin = await userCollection.findOne(query)
      res.send(admin)
    })
    app.get('/user/instructor/:email', async (req, res) => {
      const email = req.params.email;
      const query = { email: email, role: 'instructor' }
      const instructor = await userCollection.findOne(query)
      res.send(instructor)
    })
    app.get('/user/student/:email', async (req, res) => {
      const email = req.params.email;
      const query = { email: email, role: 'student' }
      const student = await userCollection.findOne(query)
      res.send(student)
    })
    app.get('/current-user', async (req, res) => {
      const email = req.query.email;
      const query = { email: email }
      const result = await userCollection.findOne(query)
      res.send(result)
    })
    app.get('/all-users', async (req, res) => {
      const result = await userCollection.find().toArray()
      res.send(result)
    })
    app.put('/all-users/:id', async (req, res) => {
      const id = req.params.id;
      const role = req.query.role;
      const query = { _id: new ObjectId(id) }
      const updatedDoc = {
        $set: {
          role: role
        }
      }
      const result = await userCollection.updateOne(query, updatedDoc)
      res.send(result)
    })


    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Knowledge want to learn')
})

// Start the server
app.listen(port, () => {
  console.log(`Server listening by me at port ${port}`);
});