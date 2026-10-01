module.exports = {
    service: "payment-service",

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
    ]
};