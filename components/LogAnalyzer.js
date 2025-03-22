import React, { useState } from "react";

const LogAnalyzer = () => {
  const [logContent, setLogContent] = useState("");
  const [exceptions, setExceptions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

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

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      {/* Header with Search Bar */}
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "#333", color: "white", padding: "10px 20px", borderRadius: "5px" }}>
        <h1 style={{ margin: 0 }}>Log Analyzer</h1>
        <input
          type="text"
          placeholder="Search logs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ padding: "5px", borderRadius: "5px", border: "none" }}
        />
      </header>

      <input type="file" accept=".log" onChange={handleFileUpload} style={{ margin: "20px 0" }} />
      <div>
        <h2>Exceptions Found:</h2>
        <ul>
          {exceptions.map((ex, index) => (
            <li key={index} style={{ color: "red" }}>
              <strong>
                {ex.message} (Line: {ex.lineNumber})
              </strong>
              <pre style={{ color: "gray" }}>{ex.stackTrace.join("\n")}</pre>
              <p style={{ color: "blue" }}>{ex.causedBy}</p>
            </li>
          ))}
        </ul>
      </div>
      <h2>Full Log:</h2>
      <pre style={{ backgroundColor: "#f4f4f4", padding: "10px", whiteSpace: "pre-wrap" }}>{logContent}</pre>
    </div>
  );
};

export default LogAnalyzer;
