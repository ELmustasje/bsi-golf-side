import React, { useState } from "react";

const AdminComponent: React.FC = () => {
  const [inputValue, setInputValue] = useState<number | "">("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [response, setResponse] = useState<any>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Update state only if the input is a number or empty
    if (value === "" || /^\d+$/.test(value)) {
      setInputValue(value === "" ? "" : parseInt(value));
    }
  };

  const handleButtonClick = async () => {
    if (inputValue === "") {
      alert("Please enter a number before clicking the button.");
      return;
    }

    const apiUrl = `https://bsi-golf-api.vercel.app/generate-random-groups/?sim_amount=${inputValue}`;
    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const res = await fetch(apiUrl);
      if (!res.ok) {
        throw new Error(`Error: ${res.status} ${res.statusText}`);
      }
      const data = await res.json();
      setResponse(data);
      alert("Grupper laget, vent i typ 5 sek og last siden på nytt");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "400px", margin: "0 auto" }}>
      <h2>Admin Panel</h2>
      <label htmlFor="numberInput" style={{ display: "block", marginBottom: "8px" }}>
        Hvor mange Sim?
      </label>
      <input
        id="numberInput"
        type="text"
        value={inputValue === "" ? "" : inputValue}
        onChange={handleInputChange}
        style={{
          padding: "8px",
          width: "100%",
          marginBottom: "16px",
          borderRadius: "4px",
          border: "1px solid #ccc",
        }}
      />
      <button
        onClick={handleButtonClick}
        style={{
          padding: "10px 20px",
          backgroundColor: loading ? "#ccc" : "#007bff",
          color: "#fff",
          border: "none",
          borderRadius: "4px",
          cursor: loading ? "not-allowed" : "pointer",
        }}
        disabled={loading}
      >
        {loading ? "Lager..." : "Lag grupper"}
      </button>
      {error && (
        <div style={{ marginTop: "16px", color: "red" }}>
          <strong>Error:</strong> {error}
        </div>
      )}
    </div>
  );
};

export default AdminComponent;
