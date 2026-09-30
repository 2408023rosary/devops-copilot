from ai.schemas import Diagnosis


def test_diagnosis_schema():
    diagnosis = Diagnosis(
        summary="Payment service cannot connect to database.",
        root_cause="Database connection refused",
        severity="HIGH",
        confidence=0.94,
        evidence=[
            "Pod is in CrashLoopBackOff",
            "Database connection refused appears in logs",
        ],
        recommendations=[
            "Verify database availability",
            "Check database host and port",
        ],
        missing_information=[],
    )

    assert diagnosis.severity == "HIGH"
    assert diagnosis.confidence == 0.94
    assert len(diagnosis.evidence) == 2


def test_missing_information_is_supported():
    diagnosis = Diagnosis(
        summary="Payment service is failing.",
        root_cause="There is not enough information to determine the exact cause.",
        severity="HIGH",
        confidence=0.35,
        evidence=[
            "Service status is CrashLoopBackOff",
        ],
        recommendations=[
            "Collect container logs",
            "Check Kubernetes events",
        ],
        missing_information=[
            "Container logs",
            "Kubernetes events",
        ],
    )

    assert diagnosis.confidence < 0.5
    assert len(diagnosis.missing_information) == 2


def test_conflicting_information_schema():
    diagnosis = Diagnosis(
        summary="Payment service is restarting because of memory exhaustion.",
        root_cause="The container is being killed by the OOM killer.",
        severity="HIGH",
        confidence=0.95,
        evidence=[
            "Container terminated due to out of memory",
            "Container killed due to OOM",
            "Memory usage is 99%",
        ],
        recommendations=[
            "Review memory limits",
            "Investigate application memory consumption",
        ],
        missing_information=[
            "Current memory limit",
        ],
    )

    assert diagnosis.severity == "HIGH"
    assert diagnosis.confidence > 0.9
    assert "OOM" in diagnosis.root_cause