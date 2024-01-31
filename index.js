const express = require("express")
const cors = require("cors")
const port = process.env.PORT ||5001
const app = express()


//middleware
app.use(cors())
app.use(express.json())


//server testing
app.get("/", (req, res) => {
    res.send("Car Doctor server is running...");
})



app.listen(port, () => {
    console.log(`The Car Doctor Server is running on Port:  ${port}`)
})