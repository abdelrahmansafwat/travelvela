require("dotenv").config();
const express = require("express");
const cors = require('cors');
const app = express();
const airport = require("./routes/airport")
const reservation = require("./routes/reservation")
const user = require("./routes/user")
const path = require("path");

app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, "client", "build")));
app.use(express.static("public"));

//Initializing routes
app.use('/api/airport', airport);     //Route for all airport related functions
app.use('/api/reservation', reservation);     //Route for all reservation related functions
app.use('/api/user', user);     //Route for all user related functions

//For sending frontend
app.get('*', async (req, res) => {
    res.sendFile(path.join(__dirname, "client", "build", "index.html"));
});


//Uncomment the line below this if testing on local machine
//app.listen(process.env.PORT || 3000, () => console.log("Listening on: " + (process.env.PORT || 3000)));

//Uncomment the line below and comment the line above if deploying to cloud
module.exports = app;
