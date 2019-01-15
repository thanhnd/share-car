const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const passport = require('passport')
const multer = require('multer')

const {validateRegisterInput} = require('../../validation/register')

//load middleware
const {authorizing} = require('../../middleware/auth')

const router = express.Router()

// Load models
const {User} = require('../../models/users')
const {Driver} = require('../../models/drivers')
const {Car} = require('../../models/cars')

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './uploads/')
    },
    filename: function (req, file, cb) {
        let type = ""
        console.log(file)
        if(file.mimetype === 'application/octet-stream') type = ".jpg"
        cb(null, file.fieldname + '-' + Date.now() + '-' + file.originalname + type)
    }
  })
   
const upload = multer({ storage: storage })

router.get('/test', (req, res) => {
    res.status(200).json({message: "Testing successful"})
})

router.post('/register', (req, res) => {
    console.log(req.body)

    const {errors, isValid} = validateRegisterInput(req.body)
    if(!isValid) return res.status(400).json(errors)

    const {email, password, userType, fullName, phone, dateOfBirth} = req.body

    User.findOne({$or: [{email}, {phone}]})
        .then(user => {
            if(user) return res.status(400).json({error: "Email or phone exists"})

            const newUser = new User({
                email, password, userType, fullName, phone, dateOfBirth
            }) 

            bcrypt.genSalt(10, (err, salt) => {
                bcrypt.hash(newUser.password, salt, (err, hash) => {
                    newUser.password = hash;
                    newUser.save()
                        .then(user => res.status(200).json(user))
                        .catch(console.log)
                    })
            })
            
        })
        .catch(console.log)

})

router.post('/login', (req, res) => {
    const {email, password} = req.body
    User.findOne({email})
        .then(user => {
            if(!user) return res.status(404).json({error: "Email does not exist"})

            bcrypt.compare(password, user.password)
                .then(isMatch => {
                    if(!isMatch) return res.status(400).json({error: "Incorrect password"})

                    console.log(user)
                    const payload = {
                        id: user._id,
                        email: user.email,
                        fullName: user.fullName,
                        userType: user.userType
                    }

                    jwt.sign(payload, 'abcxyz', {expiresIn: '1h'}, (err, token) => {
                        res.status(200).json({
                            success: "Login success",
                            token: "Bearer " + token
                        })
                    })
                })
        })
})


router.post('/upload-avatar', 
    upload.single('avatar'),
    passport.authenticate('jwt', {session: false}),
    (req, res) => {
        User.findById(req.user.id)
            .then(user => {
                if (!user) return res.status(404).json({error: "User not exist"})

                user.avatar = req.file.path
                user.save()
                    .then(user => res.status(200).json(true))
                    .catch(console.log)
            })
            .catch(console.log)
    }
)

router.get('/test-private', 
    [
        passport.authenticate('jwt', {session: false}),
        authorizing("admin")
    ], (req, res) => {
    
        console.log(req.user)
        res.status(200).json(req.user)
})


// routes: /api/users/drivers/create-profile
// desc: create profile
// access: PRIVATE(driver)

router.post('/drivers/create-profile', 
    passport.authenticate('jwt', {session: false}),
    authorizing('driver'),
    (req, res) => {
        const userId = req.user.id
        const {address, passportId, job} = req.body
        Driver.findOne({userId: userId})
            .then(driver => {
                if(driver) return res.status(400).json({error: "Profile exists"})
                const newDriver = new Driver({
                    userId, address, passportId, job
                })
                return newDriver.save()
            })
            .then(driver => res.status(200).json(driver))
            .catch(console.log)
    }
)

// routes: /api/users/drivers/add-car
// desc: add new car
// access: PRIVATE(driver)

router.post('/drivers/add-car', 
    passport.authenticate('jwt', {session: false}),
    authorizing('driver'),
    upload.single('carImage'),
    (req, res) => {
        console.log(req.file)
        const userId = req.user.id
        const {brand, model, manufacturingYear, licensePlate, numberOfSeats} = req.body
        const carImage = req.file.path
        
        Driver.findOne({userId})
            .then(driver => {
                if(!driver) return res.status(400).json({error: "Driver not found"})

                const newCar = new Car({brand, model, manufacturingYear, licensePlate, numberOfSeats, carImage}) 
                driver.carInfo.push(newCar)
                return driver.save()
            })
            .then(driver => res.status(200).json(driver))
            .catch(console.log)
    }

)


module.exports = router