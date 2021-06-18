require("dotenv").config();
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
mongoose.connect(process.env.MONGO_URI, { useUnifiedTopology: true, useNewUrlParser: true });
mongoose.set('useFindAndModify', false);

let couponSchema = new Schema({
    code: { type: String, required: true },
    expiration: { type: Date, required: true },
    fixed: { type: Boolean, required: true },
    value: { type: Number, required: true },
});


let couponModel = mongoose.model("couponModel", couponSchema);

module.exports = couponModel;