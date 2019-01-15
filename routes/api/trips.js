const express = require('express')
const passport = require('passport')

//load middleware
const {authorizing} = require('../../middleware/auth')

const router = express.Router()

// Load models
const {User} = require('../../models/users')
const {Trip} = require('../../models/trips')

router.post('/create-trip',
    passport.authenticate('jwt', {session: false}),
    authorizing('driver'),
    (req, res) => {
        const userId = req.user.id
        console.log("req.body: ", req.body)
        const {locationFrom, locationTo, startTime, wifi, pet, food, availableSeats, fee} = req.body
        User.findById(userId)
            .then(user => {
                if(!user) return res.status(404).json({error: "User not found"})

                const options = {wifi, pet, food}
                const newTrip = new Trip({
                    userId,
                    locationFrom, locationTo,
                    startTime, options,
                    availableSeats, fee
                })
                newTrip.save()
                    .then(newTrip => res.status(200).json(newTrip))
                    .catch(console.log)
            } )
    }
)

router.post('/book-trip/:tripId',
    passport.authenticate('jwt', {session: false}),
    authorizing('passenger'),
    (req, res) => {
        console.log("body: ", req.body)
        const userId = req.user.id
        const tripId = req.params.tripId
        const passenger = {...req.body, userId}
        const {numberOfBookingSeats} = req.body

        Trip.findById(tripId)
            .then(trip => {
                if(!trip) return res.status(404).json({error: "Trip not found"})

                if(!numberOfBookingSeats > trip.availableSeats) return res.status(404).json({error: "Not available number"})

                trip.availableSeats = trip.availableSeats - numberOfBookingSeats
                trip.passengers.push(passenger)
                trip.save().then(trip => res.status(200).json(trip))
            })
    }
)

router.post('/finish-trip/:tripId',
    passport.authenticate('jwt', {session: false}),
    authorizing('passenger'),
    (req, res) => {
        const tripId = req.params.tripId
        Trip.findById(tripId)
            .then(trip => {
                if(!trip) return res.status(404).json({error: "Trip not found"})

                trip.isFinished = true
                trip.save().then(trip => res.status(200).json(trip))
            })
    }
)

module.exports = router