export const defaultSettings = {
  notifications: true,
  autoAnalyze: false,
  showLogs: true,
  rememberChats: true,
  memoryEnabled: true,
  animations: true,
}

export function createDemoWorkspace() {
  return {
    settings: { ...defaultSettings },

    services: [
      {
        id: 'payment-service',
        name: 'payment-service',
        status: 'critical',
        uptime: '98.2%',
        description: 'Payment processing',
        replicas: '1 / 3',
        region: 'ap-south-1',
      },
      {
        id: 'user-service',
        name: 'user-service',
        status: 'healthy',
        uptime: '99.9%',
        description: 'Authentication & accounts',
        replicas: '3 / 3',
        region: 'ap-south-1',
      },
      {
        id: 'order-service',
        name: 'order-service',
        status: 'warning',
        uptime: '99.7%',
        description: 'Order management',
        replicas: '3 / 3',
        region: 'ap-south-1',
      },
      {
        id: 'notification-service',
        name: 'notification-service',
        status: 'critical',
        uptime: '96.4%',
        description: 'Notification delivery',
        replicas: '0 / 2',
        region: 'ap-south-1',
      },
    ],

    incidents: [
      {
        id: 'INC-001',
        service: 'payment-service',
        title: 'Payment service is failing',
        severity: 'critical',
        status: 'investigating',
        error: 'CrashLoopBackOff',
        createdAt: '2026-09-30T14:32:00Z',
        description:
          'The payment container repeatedly restarts after failing to connect to its database.',
        logs: [
          'Database connection refused',
          'Application exited with code 1',
          'Back-off restarting failed container',
        ],
        rootCause: 'Database connection failure',
        recommendations: [
          'Verify database availability.',
          'Check database credentials.',
          'Verify the database host and port.',
          'Review recent configuration changes.',
        ],
        notes: [],
        timeline: [
          {
            text: 'Database connection failure detected',
            at: '2026-09-30T14:32:00Z',
          },
          {
            text: 'Investigation opened',
            at: '2026-09-30T14:35:00Z',
          },
        ],
        analysis: null,
      },

      {
        id: 'INC-002',
        service: 'order-service',
        title: 'Elevated response latency',
        severity: 'warning',
        status: 'monitoring',
        error: 'HighLatency',
        createdAt: '2026-09-30T12:10:00Z',
        description:
          'Order response times increased alongside a traffic spike.',
        logs: [
          'Request latency exceeded threshold',
          'Response time: 2.8s',
          'Traffic spike detected',
        ],
        rootCause: 'Traffic spike or downstream bottleneck',
        recommendations: [
          'Compare request volume with available capacity.',
          'Inspect slow database queries.',
          'Check downstream response times.',
        ],
        notes: [],
        timeline: [
          {
            text: 'Latency threshold exceeded',
            at: '2026-09-30T12:10:00Z',
          },
          {
            text: 'Monitoring started',
            at: '2026-09-30T12:15:00Z',
          },
        ],
        analysis: null,
      },

      {
        id: 'INC-003',
        service: 'user-service',
        title: 'Authentication recovered',
        severity: 'warning',
        status: 'resolved',
        error: 'AuthTimeout',
        createdAt: '2026-09-29T09:00:00Z',
        description:
          'A temporary authentication timeout was resolved following a service restart.',
        logs: [
          'Authentication timeout detected',
          'Service restarted',
          'Authentication requests normal',
        ],
        rootCause: 'Authentication timeout',
        recommendations: [
          'Review timeout logs.',
          'Confirm dependency health.',
          'Monitor authentication success rates.',
        ],
        notes: [],
        timeline: [
          {
            text: 'Authentication timeouts detected',
            at: '2026-09-29T09:00:00Z',
          },
          {
            text: 'Service restarted; incident resolved',
            at: '2026-09-29T09:20:00Z',
          },
        ],
        analysis: null,
      },

      {
        id: 'INC-004',
        service: 'notification-service',
        title: 'Notification service image cannot be pulled',
        severity: 'high',
        status: 'investigating',
        error: 'ImagePullBackOff',
        createdAt: '2026-09-30T10:25:00Z',
        description:
          'The notification-service pod cannot start because Kubernetes cannot pull the configured container image.',
        logs: [
          'Kubernetes is attempting to start notification-service.',
          'Pulling container image registry.example.com/notification-service:2.8.1',
          'Failed to pull image registry.example.com/notification-service:2.8.1',
          'manifest unknown: image tag 2.8.1 not found',
          'Back-off pulling image notification-service:2.8.1',
        ],
        rootCause:
          'The requested container image tag 2.8.1 does not exist in the configured container registry.',
        recommendations: [
          'Verify that the image name is correct.',
          'Check whether image tag 2.8.1 exists in the container registry.',
          'Check the Kubernetes deployment configuration for a typo in the image tag.',
          'Use a valid image tag if 2.8.1 does not exist.',
          'Verify registry access and image pull credentials if the image exists.',
        ],
        notes: [],
        timeline: [
          {
            text: 'Image pull failure detected',
            at: '2026-09-30T10:25:03Z',
          },
          {
            text: 'Kubernetes entered ImagePullBackOff',
            at: '2026-09-30T10:25:04Z',
          },
        ],
        analysis: null,
      },
    ],

    conversations: [],

    memories: [
      {
        id: 'MEM-014',
        incidentId: 'INC-014',
        service: 'payment-service',
        title: 'Database connection failure',
        similarity: 94,
        createdAt: '2026-09-18T09:00:00Z',
        rootCause: 'Incorrect database host configuration',
        resolution:
          'Updated the database host value and restarted the payment deployment.',
      },
      {
        id: 'MEM-009',
        incidentId: 'INC-009',
        service: 'payment-service',
        title: 'Payment container restart loop',
        similarity: 87,
        createdAt: '2026-09-05T09:00:00Z',
        rootCause: 'Expired database credentials',
        resolution:
          'Updated the database credentials in the deployment secret.',
      },
      {
        id: 'MEM-021',
        incidentId: 'INC-021',
        service: 'order-service',
        title: 'Database unavailable',
        similarity: 71,
        createdAt: '2026-09-25T09:00:00Z',
        rootCause: 'Database instance unavailable',
        resolution:
          'Restored database availability and verified connectivity.',
      },
    ],
  }
}