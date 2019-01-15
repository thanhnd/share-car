function authenticating() {

}

function authorizing(userType) {

    return (req, res, next) => {
        console.log(req.user)
        if(req.user.userType === userType) return next()

        return res.status(400).json({error: "Not authorizing"})
    }
    
}

module.exports = {
    authenticating, authorizing
}