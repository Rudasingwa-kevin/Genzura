export const errorHandler = (err, req, res, next) => {
    console.error(`[Error] ${err.message}`);
    const status = err.status || 500;
    const message = err.message || 'Internal Server Error';
    res.status(status).json({
        error: message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
};
//# sourceMappingURL=errorMiddleware.js.map