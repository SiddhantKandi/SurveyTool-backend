class ApiError extends Error {
    constructor(
        statusCode,
        data,
        message = "Something went wrong",
        error = []
    ) {
        super(message);
        this.statusCode = statusCode;
        this.data = data;
        this.message = message;
        this.success = false;
        this.error = error;
    }
}



export { ApiError }