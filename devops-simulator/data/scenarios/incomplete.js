const incompleteData = {
    scenario: "Incomplete DevOps Data",

    service: {
        name: "inventory-service",
        namespace: "production",
        pod: "inventory-service-8d7f6",
        status: "Unknown",
        restarts: null,
        age: "12m"
    },

    logs: [
        {
            timestamp: "2026-09-30T16:05:10Z",
            level: "INFO",
            message: "Inventory service starting..."
        },
        {
            timestamp: "2026-09-30T16:05:12Z",
            level: "WARN",
            message: "Unable to retrieve complete application logs."
        }
    ],

    events: [],

    metrics: {
        cpuUsage: null,
        memoryUsage: null,
        restartCount: null,
        uptime: null
    },

    probableCause: null,

    recommendedActions: [
        "Collect additional application logs.",
        "Check pod and container status.",
        "Verify that the monitoring service is available.",
        "Retry the diagnostics after complete system data is available."
    ],

    dataQuality: {
        complete: false,
        missing: [
            "restart count",
            "CPU usage",
            "memory usage",
            "uptime",
            "system events",
            "probable cause"
        ]
    }
};

module.exports = incompleteData;