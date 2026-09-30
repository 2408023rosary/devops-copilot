const highCpuData = {
  scenario: "High CPU Usage",

  service: {
    name: "order-service",
    namespace: "production",
    pod: "order-service-5f8c7d6b9-rq43p",
    status: "Running",
    restarts: 0,
    age: "2h 15m"
  },

  logs: [
    {
      timestamp: "2026-09-30T10:30:01Z",
      level: "INFO",
      message: "order-service started successfully."
    },
    {
      timestamp: "2026-09-30T10:31:15Z",
      level: "INFO",
      message: "Processing incoming order requests."
    },
    {
      timestamp: "2026-09-30T10:32:41Z",
      level: "WARN",
      message: "CPU usage exceeded 80% threshold."
    },
    {
      timestamp: "2026-09-30T10:33:02Z",
      level: "WARN",
      message: "Request processing time increased to 4.8 seconds."
    },
    {
      timestamp: "2026-09-30T10:34:17Z",
      level: "WARN",
      message: "CPU usage reached 94%."
    },
    {
      timestamp: "2026-09-30T10:34:45Z",
      level: "WARN",
      message: "High number of concurrent order-processing requests detected."
    }
  ],

  events: [
    {
      type: "Warning",
      reason: "HighCPU",
      message: "Container CPU usage is above the configured threshold."
    },
    {
      type: "Normal",
      reason: "Running",
      message: "Pod order-service-5f8c7d6b9-rq43p remains in Running state."
    }
  ],

  metrics: {
    cpuUsage: "94%",
    memoryUsage: "71%",
    cpuLimit: "1000m",
    cpuRequest: "250m",
    memoryLimit: "512Mi",
    memoryRequest: "256Mi",
    restartCount: 0,
    uptime: "2h 15m",
    requestsPerSecond: 185
  },

  probableCause:
    "The order-service is experiencing unusually high CPU consumption due to a large number of concurrent order-processing requests. The CPU usage has reached 94%, which is causing increased request processing time.",

  recommendedActions: [
    "Check the application for CPU-intensive operations.",
    "Review the number of concurrent requests reaching the service.",
    "Inspect recent application changes that may have increased CPU consumption.",
    "Consider temporarily increasing the CPU limit if the workload is legitimate.",
    "Enable horizontal pod autoscaling if high traffic is expected.",
    "Review application performance and optimize CPU-intensive code."
  ]
};

module.exports = highCpuData;