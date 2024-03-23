const express = require("express");
const cors = require("cors");
const port = process.env.PORT || 5001;
const app = express();
require("dotenv").config();
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

//middleware
app.use(
  cors({
    origin: ["http://localhost:5173", "https://your-car-doctor.netlify.app"],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// copied from mongoDBAtlas starts from here
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.toh0ohl.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

// middleware for checking log in or not
const logger = async (req, res, next) => {
  next();
};

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    //   db-collections
    const serviceCollections = client.db("Car-Doctor").collection("Services");
    const productCollections = client.db("Car-Doctor").collection("Products");
    const orderedProductCollections = client
      .db("Car-Doctor")
      .collection("OrderedProducts");
    const bookingCollections = client.db("Car-Doctor").collection("Bookings");
    const reviewCollections = client.db("Car-Doctor").collection("Reviews");
    const blogCollections = client.db("Car-Doctor").collection("Blogs");
    const commentCollections = client
      .db("Car-Doctor")
      .collection("BlogComments");

    //auth related api
    app.post("/jwt", logger, async (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "5h",
      });
      res
        .cookie("token", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        })
        .send({ success: true });
    });

    app.post("/logout", async (req, res) => {
      const user = req.body;
      res
        .clearCookie("token", { maxAge: 0, sameSite: "none", secure: true })
        .send({ success: true });
    });

    //getting product collection
    app.get("/products", async (req, res) => {
      const result = await productCollections.find().toArray();
      res.send(result);
    });

    //getting products details for checkout page
    app.get("/products/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await productCollections.findOne(query);
      res.send(result);
    });

    // getting ordered products by sorting email
    app.get("/orderedProducts", async (req, res) => {
      let query = {};
      if (req.query?.email) {
        query = { email: req.query?.email };
      }
      const result = await orderedProductCollections.find(query).toArray();
      res.send(result);
    });

    //deleting item form Cart
    app.delete("/orderedProducts/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await orderedProductCollections.deleteOne(query);
      res.send(result);
    });

    // storing all ordered products
    app.post("/orderedProducts", async (req, res) => {
      const product = req.body;
      const result = await orderedProductCollections.insertOne(product);
      res.send(result);
    });

    //getting services collection
    app.get("/services", async (req, res) => {
      const page = parseInt(req.query.page);
      const size = parseInt(req.query.size);
      const result = await serviceCollections
        .find()
        .skip(page * size)
        .limit(size)
        .toArray();
      res.send(result);
    });

    // getting total services for the pagination
    app.get("/servicesCount", async (req, res) => {
      const count = await serviceCollections.estimatedDocumentCount();
      res.send({ count });
    });

    //getting service details for checkout page
    app.get("/services/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await serviceCollections.findOne(query);
      res.send(result);
    });

    //getting all bookings for the client side
    app.get("/bookings", async (req, res) => {
      let query = {};
      if (req.query?.email) {
        query = { email: req.query?.email };
      }
      const result = await bookingCollections.find(query).toArray();
      res.send(result);
    });

    // storing all of bookings
    app.post("/bookings", async (req, res) => {
      const booking = req.body;
      const result = await bookingCollections.insertOne(booking);
      res.send(result);
    });

    //updating the bookings
    app.patch("/bookings/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updateBooking = req.body;
      const updateDoc = {
        $set: {
          status: updateBooking.status,
        },
      };
      const result = await bookingCollections.updateOne(filter, updateDoc);
      res.send(result);
    });

    //deleting item form myBookings cart
    app.delete("/bookings/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await bookingCollections.deleteOne(query);
      res.send(result);
    });

    //getting all reviews
    app.get("/reviews", async (req, res) => {
      const result = await reviewCollections.find().toArray();
      res.send(result);
    });

    //storing reviews
    app.post("/reviews", async (req, res) => {
      const review = req.body;
      const result = await reviewCollections.insertOne(review);
      res.send(result);
    });

    //getting all blogs
    app.get("/blogs", async (req, res) => {
      const result = await blogCollections.find().toArray();
      res.send(result);
    });

    //getting blog details
    app.get("/blogs/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await blogCollections.findOne(query);
      res.send(result);
    });

    //storing blogs
    app.post("/blogs", async (req, res) => {
      const blog = req.body;
      const result = await blogCollections.insertOne(blog);
      res.send(result);
    });

    app.get("/blogComments", async (req, res) => {
      const result = await commentCollections.find().toArray();
      res.send(result);
    });

    //getting all blogs comments
    app.get("/blogComments/:id", async (req, res) => {
      const id = req.params.id;
      const cursor = { blogId: id };
      const result = await commentCollections.find(cursor).toArray();
      res.send(result);
    });

    //storing blog comments
    app.post("/blogComments/:id", async (req, res) => {
      const blogComment = req.body;
      const result = await commentCollections.insertOne(blogComment);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);
// copied from mongoDBAtlas ends here

//server testing
app.get("/", (req, res) => {
  res.send("Car Doctor server is running...");
});

app.listen(port, () => {
  console.log(`The Car Doctor Server is running on Port:  ${port}`);
});