const validator = require('validator')

const validateRegisterInput = (data) => {
    let errors= {}

    if(validator.isEmpty(data.email)) {
        errors.email = "Email require"
    }

    if(!validator.isEmail(data.email)) {
        errors.email = "Email invalid"
    }

    return {
        errors,
        isValid: Object.keys(errors).length === 0
    }
}

module.exports = {
    validateRegisterInput
}