const express = require("express");

const router = express.Router();

const crashloopScenario = require("../data/scenarios/crashloop");
const imagepullScenario = require("../data/scenarios/imagepull");
const highcpuScenario = require("../data/scenarios/highcpu");
const incompleteScenario = require("../data/scenarios/incomplete");

const statusData = require("../data/status");
const logsData = require("../data/logs");
const eventsData = require("../data/events");
const metricsData = require("../data/metrics");

const scenarios = {
    crashloop: crashloopScenario,
    imagepull: imagepullScenario,
    highcpu: highcpuScenario,
    incomplete: incompleteScenario
};

// System status
router.get("/status", (req, res) => {
    res.json(statusData);
});

// Application logs
router.get("/logs", (req, res) => {
    res.json(logsData);
});

// Kubernetes/system events
router.get("/events", (req, res) => {
    res.json(eventsData);
});

// System metrics
router.get("/metrics", (req, res) => {
    res.json(metricsData);
});

// Individual scenario
router.get("/scenario/:name", (req, res) => {

    const scenario = scenarios[req.params.name];

    if (!scenario) {
        return res.status(404).json({
            error: "Scenario not found",
            availableScenarios: Object.keys(scenarios)
        });
    }

    res.json(scenario);
});

// Complete diagnostic package
router.get("/diagnostics/:name", (req, res) => {

    const scenario = scenarios[req.params.name];

    if (!scenario) {
        return res.status(404).json({
            error: "Scenario not found",
            availableScenarios: Object.keys(scenarios)
        });
    }

    res.json({
        timestamp: new Date().toISOString(),

        scenario: scenario.scenario,

        service: scenario.service,

        status: statusData,

        logs: scenario.logs,

        events: scenario.events,

        metrics: scenario.metrics,

        probableCause: scenario.probableCause,

        recommendedActions: scenario.recommendedActions,

        dataQuality: scenario.dataQuality || {
            complete: true,
            missing: []
        }
    });
});

// List all available scenarios
router.get("/scenarios", (req, res) => {

    res.json({
        scenarios: [
            {
                id: "crashloop",
                name: "CrashLoopBackOff",
                description:
                    "Service repeatedly crashes because of a database connection failure."
            },
            {
                id: "imagepull",
                name: "ImagePullBackOff",
                description:
                    "Container cannot start because the requested image tag does not exist."
            },
            {
                id: "highcpu",
                name: "High CPU Usage",
                description:
                    "Service is experiencing high CPU usage because of heavy request load."
            },
            {
                id: "incomplete",
                name: "Incomplete DevOps Data",
                description:
                    "Diagnostic information is incomplete and additional data is required."
            }
        ]
    });
});

module.exports = router;