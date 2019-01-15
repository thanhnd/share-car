const mongoose = require('mongoose')

const DriverSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        require: true
    },
    address: {type: String, required: true},
    passportId: {type: String, required: true},
    job: {type: String, required: true},
    // carInfo
    passengerRates: {
        type:[Number],
        min: 1,
        max: 5 
    }
})

const Driver =  mongoose.model('Driver', DriverSchema)
module.exports = {
    Driver, DriverSchema
}