module.exports = {
    service: "payment-service",
    environment: "production",

    deployment: {
        name: "payment-service",
        replicas: 3,
        readyReplicas: 0,
        status: "CrashLoopBackOff"
    },

    pods: [
        {
            name: "payment-service-7f8d9",
            status: "CrashLoopBackOff",
            restarts: 6
        },
        {
            name: "payment-service-6ab21",
            status: "CrashLoopBackOff",
            restarts: 4
        },
        {
            name: "payment-service-9cd31",
            status: "CrashLoopBackOff",
            restarts: 5
        }
    ],

    overallStatus: "CRITICAL"
};