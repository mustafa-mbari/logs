import React, { useState } from "react";

const LogAnalyzer = () => {
  const [logContent, setLogContent] = useState("");
  const [exceptions, setExceptions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedExceptions, setExpandedExceptions] = useState({});

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      setLogContent(text);
      analyzeLog(text);
    };
    reader.readAsText(file);
  };

  const analyzeLog = (text) => {
    const lines = text.split("\n");
    const extractedExceptions = [];
    let currentException = null;

    lines.forEach((line, index) => {
      if (line.startsWith("####")) {
        return; // Ignore unimportant lines
      }
      if (line.startsWith("com.swisslog")) {
        if (currentException) {
          extractedExceptions.push(currentException);
        }
        currentException = {
          message: line,
          stackTrace: [],
          lineNumber: index + 1,
        };
      } else if (line.includes("at") && currentException) {
        currentException.stackTrace.push(line);
      } else if (line.startsWith("Caused by") && currentException) {
        currentException.causedBy = line;
        extractedExceptions.push(currentException);
        currentException = null;
      }
    });

    if (currentException) {
      extractedExceptions.push(currentException);
    }

    setExceptions(extractedExceptions);
  };

  const toggleStackTrace = (index) => {
    setExpandedExceptions((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#282c34", color: "white", padding: "10px 20px", borderRadius: "8px" }}>
        <h1>Log Analyzer</h1>
        <input 
          type="text" 
          placeholder="Search logs..." 
          value={searchTerm} 
          onChange={(e) => setSearchTerm(e.target.value)} 
          style={{ padding: "5px", borderRadius: "4px", border: "1px solid #ddd" }}
        />
      </header>
      <div style={{ marginTop: "20px" }}>
        <h2>Exceptions Found:</h2>
        <ul>
          {exceptions.map((ex, index) => (
            <li key={index} style={{ color: "red", marginBottom: "10px" }}>
              <strong>
                {ex.message} (Line: {ex.lineNumber})
              </strong>
              <button 
                onClick={() => toggleStackTrace(index)}
                style={{ marginLeft: "10px", padding: "3px 8px", border: "none", background: "#007bff", color: "white", borderRadius: "4px", cursor: "pointer" }}
              >
                {expandedExceptions[index] ? "Hide Stack Trace" : "Show Stack Trace"}
              </button>
              {expandedExceptions[index] && (
                <pre style={{ color: "gray", background: "#f8f8f8", padding: "5px", borderRadius: "5px" }}>{ex.stackTrace.join("\n")}</pre>
              )}
              <p style={{ color: "blue" }}>{ex.causedBy}</p>
            </li>
          ))}
        </ul>
      </div>
      <h2>Full Log:</h2>
      <pre style={{ backgroundColor: "#f4f4f4", padding: "10px", whiteSpace: "pre-wrap", overflowX: "auto" }}>
        {logContent.split("\n").map((line, index) => (
          <div key={index} style={{ color: searchTerm && line.includes(searchTerm) ? "blue" : "black" }}>
            <strong>{index + 1}:</strong> {line}
          </div>
        ))}
      </pre>
    </div>
  );
};

export default LogAnalyzer;
