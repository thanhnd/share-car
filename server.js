const express = require('express')
const mongoose = require('mongoose')
const passport = require('passport')

mongoose.connect('mongodb://localhost:27017/fs02-xedike', {useNewUrlParser: true})
    .then(console.log("Connect to the database"))
    .catch(console.log)

const app = express()

app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use('/uploads', express.static('uploads'))

app.use(passport.initialize())
require('./config/passport')(passport)

// Config routes
app.use('/api/users', require('./routes/api/users'))

const port = process.env.PORT || 5000
app.listen(port, () => {
    console.log(`Server running on port ${port}`)
})