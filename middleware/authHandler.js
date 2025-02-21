
const Joi = require("joi");


const authHandler = (req, res, next) => {

    let accessKey = req.headers["access-key"];
    let secretKey = req.headers["secret-key"];

    let validateData = {
        "access-key": accessKey,
        "secret-key": secretKey,
    };

    const schema = Joi.object({
        "access-key": Joi.string().required().custom((value, helpers) => {
            if (value !== process.env.ACCESS_KEY) {
                return helpers.error("any.invalid");
            }
            return value;
        }).message({
            "any.invalid": "\"access-key\" is not valid",
        }),
        "secret-key": Joi.string().required().custom((value, helpers) => {
            if (value !== process.env.SECRET_KEY) {
                return helpers.error("any.invalid");
            }
            return value;
        }).message({
            "any.invalid": "\"secret-key\" is not valid",
        }),
    });

    const { error, value } = schema.validate(validateData);

    if (error) throw error;

    next();
};

module.exports = authHandler;