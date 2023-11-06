const express = require('express');
const app = express();
const cors = require('cors');
const jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;

//* Middleware

app.use(cors(
  {
    origin:[
      'http://localhost:5173'
    ],
    credentials: true
  }
));
app.use(express.json());
app.use(cookieParser());

// console.log(process.env.DB_USER);
// console.log(process.env.DB_PASSWORD);


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
    const commentCollection = client.db('blogDB').collection('comments');
    const wishListCollection = client.db('blogDB').collection('wishList');

// * auth related apis
// *create token
app.post('/jwt', async(req, res)=>{
  const user = req.body;
  console.log('User for token' , user);
  const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, 
  {expiresIn: '1h'})
  
  res.cookie('token', token, {
    httpOnly: true,
    secure: true,
    sameSite: 'none'
  })
  
  res.send({success: true});
})

// * clear token for logout user
app.post('/logout', async (req, res) => {
  const user = req.body;
  console.log('logging out', user);
  res.clearCookie('token', { maxAge: 0 }).send({ success: true })
})





    // * blog related apis
// * all blog
// * add new blog
    app.post('/allBlogs', async (req, res) => {
      const addBlogs = req.body;
      // console.log('addBlogs', addBlogs)
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

// * update blog
app.get('/allBlogs/:id', async (req, res) => {
  const id = req.params.id;
  const query = { _id: new ObjectId(id) }
  const result = await blogCollection.findOne(query)
  res.send(result)
})

app.put('/allBlogs/:id', async (req, res) => {
  const id = req.params.id;
  const filter = { _id: new ObjectId(id) }
  const options = { upsert: true }
  const updatedBlog = req.body;
  const blog = {
    $set: {
      image: updatedBlog.image,
      title: updatedBlog.title,
      category: updatedBlog.category,
      short_description: updatedBlog.short_description,
      long_description: updatedBlog.long_description
    }
  };
  const result = await blogCollection.updateOne(filter, blog, options);
  res.send(result);
});



// * Comments section
// *add comments
app.post('/allComments', async (req, res) => {
  const addComment = req.body;
  // console.log('addComment', addComment)
  const result = await commentCollection.insertOne(addComment);
  res.send(result);
})

// * show comment
app.get('/allComments', async (req, res) => {
  const result = await commentCollection.find().toArray();
  res.send(result)
})


// *wishlist section
app.post('/wishList', async (req, res) => {
  const wishListBlogs = req.body;
  console.log('WishList', wishListBlogs)
 
  const result = await wishListCollection.insertOne(wishListBlogs)
  res.send(result)
})

app.get('/wishList', async (req, res) =>{
  const result = await wishListCollection.find().toArray();
  res.send(result)
})


app.delete('/wishList/:id', async (req, res) => {
  const id = req.params.id;
  console.log('Delete from database', id)
  const query = { _id: new ObjectId(id) }
  const result = await wishListCollection.deleteOne(query)
  res.send(result)

})



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