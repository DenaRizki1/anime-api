const AppError = require("../AppError");

const errorHandler = (error, req, res, next) => {
    console.log(error);

    if (error.name === "ValidationError") {
        return res.status(400).send({
            success: false,
            message: error.details[0].message,
        });
    }

    if (error instanceof AppError) {
        return res.status(error.statusCode).send({
            success: false,
            message: error.message,
        });
    }

    return res.status(500).send({
        success: false,
        message: error.message,
    });
};

module.exports = errorHandler;