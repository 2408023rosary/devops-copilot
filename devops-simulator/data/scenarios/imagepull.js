const imagePullData = {
  scenario: "ImagePullBackOff",

  service: {
    name: "notification-service",
    namespace: "production",
    pod: "notification-service-6c7d8f9b4-mp72k",
    status: "ImagePullBackOff",
    restarts: 0,
    age: "5m"
  },

  logs: [
    {
      timestamp: "2026-09-30T10:25:01Z",
      level: "INFO",
      message: "Kubernetes is attempting to start notification-service."
    },
    {
      timestamp: "2026-09-30T10:25:02Z",
      level: "INFO",
      message: "Pulling container image registry.example.com/notification-service:2.8.1"
    },
    {
      timestamp: "2026-09-30T10:25:03Z",
      level: "ERROR",
      message: "Failed to pull image registry.example.com/notification-service:2.8.1"
    },
    {
      timestamp: "2026-09-30T10:25:03Z",
      level: "ERROR",
      message: "manifest unknown: image tag 2.8.1 not found"
    },
    {
      timestamp: "2026-09-30T10:25:04Z",
      level: "ERROR",
      message: "Back-off pulling image notification-service:2.8.1"
    }
  ],

  events: [
    {
      type: "Warning",
      reason: "Failed",
      message:
        "Failed to pull image registry.example.com/notification-service:2.8.1"
    },
    {
      type: "Warning",
      reason: "Failed",
      message:
        "Error: manifest unknown: image tag 2.8.1 not found"
    },
    {
      type: "Warning",
      reason: "BackOff",
      message:
        "Back-off pulling image notification-service:2.8.1"
    }
  ],

  metrics: {
    cpuUsage: "0%",
    memoryUsage: "0%",
    restartCount: 0,
    uptime: "0s"
  },

  probableCause:
    "Kubernetes cannot start the notification-service because the requested container image tag 2.8.1 does not exist in the configured container registry.",

  recommendedActions: [
    "Verify that the image name is correct.",
    "Check whether image tag 2.8.1 exists in the container registry.",
    "Check the Kubernetes deployment configuration for a typo in the image tag.",
    "Use a valid image tag if 2.8.1 does not exist.",
    "Verify registry access and image pull credentials if the image exists."
  ]
};

module.exports = imagePullData;