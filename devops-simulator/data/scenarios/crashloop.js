const crashLoopData = {
    scenario: "CrashLoopBackOff",

    service: {
        name: "payment-service",
        namespace: "production",
        pod: "payment-service-7f8d9",
        status: "CrashLoopBackOff",
        restarts: 6,
        age: "8m"
    },

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
    ],

    events: [
        {
            type: "Warning",
            reason: "BackOff",
            message: "Back-off restarting failed container payment-service",
            count: 6
        },
        {
            type: "Warning",
            reason: "Unhealthy",
            message: "Liveness probe failed for payment-service",
            count: 4
        },
        {
            type: "Normal",
            reason: "Scheduled",
            message: "Successfully assigned payment-service pod to worker-node-01",
            count: 1
        }
    ],

    metrics: {
        cpuUsage: "12%",
        memoryUsage: "38%",
        restartCount: 6,
        uptime: "0s"
    },

    probableCause:
        "The payment-service cannot establish a connection to the PostgreSQL database. The application exits during startup, causing Kubernetes to repeatedly restart the container.",

    recommendedActions: [
        "Verify that the PostgreSQL database is running.",
        "Check the database hostname and port configuration.",
        "Verify the payment-service database environment variables.",
        "Check network connectivity between payment-service and PostgreSQL.",
        "Restart the deployment after correcting the database configuration."
    ]
};

module.exports = crashLoopData;