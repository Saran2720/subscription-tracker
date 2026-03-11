const errorMiddleWare = (err, req, res, next) => {
    try {
        let error = { ...err };

        error.message = err.message;
        console.error(err);

        //mongoose bad objectId
        if (err.name === 'CaseError') {
            const message = 'Resource not found';
            error = new Error(message);
            error.statusCode = 404;
        }

        //mongoose duplicate key 
        if (err.code === 11000) {
            const message = 'Dulicate filed value entered';
            error = new Error(message);
            error.statusCode = 400;
        }

        //validaition error
        if (err.name === 'ValidationError') {
            const message = Object.values(err.errors).map((val) => val.message);
            error = new Error(message.join(', '));
            error.statusCode = 400;
        }

        res.status(error.status || 500).json({
            success: false,
            error: error.message || 'Server Error'
        })

    } catch (error) {
        next(error);
    }
}
export default errorMiddleWare;