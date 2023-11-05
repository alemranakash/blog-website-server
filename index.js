const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion } = require('mongodb');
const port = process.env.PORT || 5000;

//* Middleware

app.use(cors());
app.use(express.json());

console.log(process.env.DB_USER);
console.log(process.env.DB_PASSWORD);


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.ftdzayi.mongodb.net/?retryWrites=true&w=majority`;

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
    // await client.connect();
    const blogCollection = client.db('blogDB').collection('allBlogs');

// * all blog
// * add new blog
    app.post('/allBlogs', async (req, res) => {
      const addBlogs = req.body;
      console.log('addBlogs', addBlogs)
      const result = await blogCollection.insertOne(addBlogs);
      res.send(result);
    })
// *show all blog
app.get('/allBlogs', async (req, res) => {
  const result = await blogCollection.find().toArray();
  res.send(result)
})

// * show recent blogs
app.get('/recentBlogs', async (req, res) => {
  const result = await blogCollection.find().sort({ createdAt: -1 }).limit(6).toArray();
  res.send(result);
});



    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


//to check server is running

app.get('/', (req, res) => {
    res.send('blog server is running');
})

app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
})