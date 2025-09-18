const handleError = (res, error, message) => {
    console.error(`Error: ${message}:`, error);
    return res.status(500).json({
        success: false,
        message: message,
        error: error.message
    });
};

const handleNotFound = (res, message) => {
    return res.status(404).json({
        success: false,
        message: message
    });
};

const handleBadRequest = (res, message) => {
    return res.status(400).json({
        success: false,
        message: message
    });
};

module.exports = {
    handleError,
    handleNotFound,
    handleBadRequest
};
