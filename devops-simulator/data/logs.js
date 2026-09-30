module.exports = {
    service: "payment-service",

    logs: [
        {
            timestamp: "2026-09-30T15:42:10Z",
            level: "INFO",
            message: "Payment service starting..."
        },
        {
            timestamp: "2026-09-30T15:42:12Z",
            level: "INFO",
            message: "Loading application configuration..."
        },
        {
            timestamp: "2026-09-30T15:42:13Z",
            level: "ERROR",
            message: "Database connection failed"
        },
        {
            timestamp: "2026-09-30T15:42:13Z",
            level: "ERROR",
            message: "ECONNREFUSED: Connection refused to database at 10.0.0.15:5432"
        },
        {
            timestamp: "2026-09-30T15:42:14Z",
            level: "ERROR",
            message: "Application startup failed"
        },
        {
            timestamp: "2026-09-30T15:42:14Z",
            level: "INFO",
            message: "Container shutting down"
        }
    ]
};