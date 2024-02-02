const express = require("express")
const cors = require("cors")
const port = process.env.PORT ||5001
const app = express()
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config()


//middleware
app.use(cors())
app.use(express.json())


// copied from mongoDBAtlas starts from here
const uri =
  `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.toh0ohl.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    //   db-collections
    const serviceCollections = client.db("Car-Doctor").collection("Services");
    const bookingCollections = client.db("Car-Doctor").collection("Bookings");

    //getting services collection
    app.get("/services", async (req, res) => {
      const cursor = serviceCollections.find();
      const result = await cursor.toArray();
      res.send(result);
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
      console.log(booking);
      const result = await bookingCollections.insertOne(booking);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
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
})


app.listen(port, () => {
    console.log(`The Car Doctor Server is running on Port:  ${port}`)
})