const mongoose = require('mongoose')

const TripSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        require: true
    },
    locationFrom: {type: String, required: true},
    locationTo: {type: String, required: true},
    startTime: {type: Date, required: true},
    options: {
        wifi: Boolean,
        pet: Boolean,
        food: Boolean
    },
    availableSeats: {type: Number, required: true},
    fee: {type: Number, required: true},
    passengers: [{
        userId: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
        locationGetIn: {type: String, require: true},
        locationgetOff: {type: String, required: true},
        paymentMethod: {type: String, required: true},
        numberOfBookingSeats: {type: Number, required: true},
        
    }],
    isFinished: false

})

const Trip =  mongoose.model('Trip', TripSchema)
module.exports = {
    Trip, TripSchema
}