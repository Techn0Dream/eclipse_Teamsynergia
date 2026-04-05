const PROCESS_COMPLAINT_URL = "http://127.0.0.1:8000/api/process-complaint";

export async function processComplaint(complaint, customer_type) {
  const payload = {
    complaint,
    customer_type,
  };

  console.log("Sending request:", payload);

  try {
    const response = await fetch(PROCESS_COMPLAINT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    let parsedResponse;
    try {
      parsedResponse = await response.json();
    } catch (parseError) {
      console.log("API Error:", "Failed to parse response JSON", parseError);
      throw new Error("Invalid JSON response from complaint API.");
    }

    console.log("Received response:", parsedResponse);

    if (!response.ok) {
      const errorMessage =
        parsedResponse?.detail ||
        `Complaint API request failed with status ${response.status}.`;
      console.log("API Error:", errorMessage, parsedResponse);
      throw new Error(errorMessage);
    }

    return parsedResponse;
  } catch (error) {
    console.log("API Error:", error?.message || error);
    throw error;
  }
}
