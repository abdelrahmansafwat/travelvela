require("dotenv").config();
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const AutoIncrement = require('mongoose-sequence')(mongoose);
mongoose.connect(process.env.MONGO_URI, { useUnifiedTopology: true, useNewUrlParser: true });
mongoose.set('useFindAndModify', false);

let reservationSchema = new Schema({
    passengers: { type: [Schema.Types.Mixed], required: true },
    selectedGoingTicket: { type: [Schema.Types.Mixed], required: true },
    selectedReturningTicket: { type: [Schema.Types.Mixed], required: true },
    oneWay: { type: Boolean, required: true },
    departureDate: { type: Date, required: true },
    arrivalDate: { type: Date, required: true },
    reservationId: { type: String, required: true },
    ref: { type: Number },
    reservationDate: { type: Date, default: Date.now },
    details: { type: [Schema.Types.Mixed] },
    total: { type: Number, required: true },
    numberOfTickets: { type: Number, required: true },
    status: { type: String },
    pnr: { type: String },
});

reservationSchema.plugin(AutoIncrement, {inc_field: 'ref', start_seq: 1});

let reservationModel = mongoose.model("reservation", reservationSchema);

module.exports = reservationModel;