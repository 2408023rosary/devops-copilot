const express = require("express");
const cors = require("cors");

const devopsRoutes = require("./routes/devops");

const app = express();
const PORT = 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Home route
app.get("/", (req, res) => {
    res.json({
        message: "DevOps Simulation Service is running",
        availableEndpoints: {
            status: "/api/devops/status",
            logs: "/api/devops/logs",
            events: "/api/devops/events",
            metrics: "/api/devops/metrics",
            crashloop: "/api/devops/scenario/crashloop",
            imagepull: "/api/devops/scenario/imagepull",
            highcpu: "/api/devops/scenario/highcpu"
        }
    });
});

// DevOps API routes
app.use("/api/devops", devopsRoutes);

// Handle unknown routes
app.use((req, res) => {
    res.status(404).json({
        error: "Route not found",
        message: "The requested API endpoint does not exist."
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`DevOps Simulation Service running on http://localhost:${PORT}`);
});