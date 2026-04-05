from pydantic import BaseModel, ConfigDict, Field


class ComplaintRequest(BaseModel):
    complaint: str = Field(
        ...,
        min_length=1,
        max_length=10000,
        description="Customer complaint text describing the reported issue.",
    )
    customer_type: str = Field(
        ...,
        min_length=1,
        max_length=128,
        description="Customer segment or type (for example retail, business, or premium).",
    )

    model_config = ConfigDict(str_strip_whitespace=True)


class ComplaintResponse(BaseModel):
    category: str = Field(
        ...,
        min_length=1,
        max_length=64,
        description="Complaint category (e.g., fraud, transaction_issue, account_issue, general).",
        examples=["fraud", "transaction_issue"],
    )
    sentiment: str = Field(
        ...,
        min_length=1,
        max_length=32,
        description="Detected sentiment: positive, neutral, or negative.",
        examples=["negative"],
    )
    severity: str = Field(
        ...,
        min_length=1,
        max_length=32,
        description="Issue severity: low, medium, or high.",
        examples=["low", "high"],
    )
    priority: str = Field(
        ...,
        min_length=1,
        max_length=10,
        description="Handling priority: CRITICAL, HIGH, MEDIUM, or LOW.",
        examples=["HIGH", "MEDIUM", "CRITICAL", "LOW"],
    )
    priority_color: str = Field(
        ...,
        pattern="^(red|orange|green|purple)$",
        description="Visual color indicator: red (HIGH/CRITICAL), orange (MEDIUM), green (LOW), purple (reserved).",
        examples=["red", "orange"],
    )
    action: str = Field(
        ...,
        min_length=1,
        max_length=64,
        description="Recommended action: human_support or auto_resolve.",
        examples=["human_support", "auto_resolve"],
    )
    resolution: str = Field(
        ...,
        min_length=1,
        max_length=500,
        description="Resolution message to display to the customer.",
    )
    estimated_resolution_time: str = Field(
        ...,
        pattern=r"^\d+(-\d+)?\s+(hours|days)$",
        description="Estimated resolution time (e.g., 2-4 hours, 24 hours).",
        examples=["2-4 hours"],
    )
    confidence_score: float = Field(
        ...,
        ge=0.0,
        le=1.0,
        description="Confidence score (0.0 to 1.0), rounded to 2 decimal places.",
        examples=[0.92],
    )

    model_config = ConfigDict(str_strip_whitespace=True)
