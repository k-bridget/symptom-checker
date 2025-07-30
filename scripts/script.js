async function checkSymptoms() {
  const input = document.getElementById("symptomInput").value.trim();
  const alertBox = document.getElementById("alert");
  const resultBox = document.getElementById("result");

  alertBox.textContent = "";
  resultBox.innerHTML = "Checking symptoms...";

  if (!input) {
    resultBox.innerHTML = "";
    alertBox.textContent = "Please enter your symptoms first.";
    return;
  }

  // Check for emergency keywords
  fetch("data/emergency.json")
    .then(res => res.json())
    .then(keywords => {
      const lower = input.toLowerCase();
      const emergencyDetected = keywords.some(keyword => lower.includes(keyword));
      if (emergencyDetected) {
        alertBox.textContent = "⚠ Emergency symptom detected! Please seek urgent care!";
      }
    })
    .catch(() => {
      console.warn("Couldn't load emergency keywords.");
    });

  // API request options
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-RapidAPI-Key': API_KEY,
      'X-RapidAPI-Host': 'ai-doctor-api-ai-medical-chatbot-healthcare-ai-assistant.p.rapidapi.com'
    },
    body: JSON.stringify({
      message: input,
      specialization: "general",
      language: "en"
    })
  };

  try {
    const res = await fetch(
      'https://ai-doctor-api-ai-medical-chatbot-healthcare-ai-assistant.p.rapidapi.com/chat?noqueue=1',
      options
    );

    if (!res.ok) {
      throw new Error(`API error: ${res.status}`);
    }

    const json = await res.json();
    console.log("API Response:", json);

    const data = json.result?.response;
    const meta = json.result?.metadata;

    if (!data) {
      resultBox.innerHTML = "<p>No valid result found. Please try again later.</p>";
      return;
    }

    resultBox.innerHTML = `
      <h3>🧠 Health Insight</h3>
      <p>${data.message}</p>

      ${data.recommendations ? `
        <h4>💡 Recommendations</h4>
        <ul>${data.recommendations.map(r => `<li>${r}</li>`).join("")}</ul>
      ` : ''}

      ${data.warnings ? `
        <h4>⚠ Warnings</h4>
        <ul>${data.warnings.map(w => `<li>${w}</li>`).join("")}</ul>
      ` : ''}

      ${data.followUp ? `
        <h4>🤔 Follow-Up Questions</h4>
        <ul>${data.followUp.map(q => `<li>${q}</li>`).join("")}</ul>
      ` : ''}

      ${data.references ? `
        <h4>📚 References</h4>
        <ul>${data.references.map(ref => `<li>${ref}</li>`).join("")}</ul>
      ` : ''}

      ${meta ? `
        <hr />
        <p><strong>Specialization:</strong> ${meta.specialization}</p>
        <p><strong>Confidence:</strong> ${meta.confidence}</p>
        <p><strong>Emergency Level:</strong> ${meta.emergencyLevel}</p>
        <p><strong>Recommended Specialists:</strong> ${meta.topRelatedSpecialties?.join(", ")}</p>
      ` : ''}
    `;

  } catch (err) {
    console.error("❌ Error:", err);
    resultBox.innerHTML = `<p>⚠ Something went wrong. Please check your API key or try again later.</p>`;
  }
}
