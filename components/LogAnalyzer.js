import React, { useState } from "react";

const LogAnalyzer = () => {
  const [logContent, setLogContent] = useState("");
  const [exceptions, setExceptions] = useState([]);
  const [expanded, setExpanded] = useState({});

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
    let lineNumber = 1;

    lines.forEach((line) => {
      if (line.startsWith("####")) {
        lineNumber++;
        return; // Ignore unimportant lines
      }
      if (line.startsWith("com.swisslog")) {
        if (currentException) {
          extractedExceptions.push(currentException);
        }
        currentException = {
          message: line,
          stackTrace: [],
          lineNumber: lineNumber,
        };
      } else if (line.includes("at") && currentException) {
        currentException.stackTrace.push(line);
      } else if (line.startsWith("Caused by") && currentException) {
        currentException.causedBy = line;
        extractedExceptions.push(currentException);
        currentException = null;
      }
      lineNumber++;
    });

    if (currentException) {
      extractedExceptions.push(currentException);
    }

    setExceptions(extractedExceptions);
  };

  const toggleExpand = (index) => {
    setExpanded((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Log Analyzer</h1>
      <input type="file" accept=".log" onChange={handleFileUpload} />
      <div style={{ marginTop: "20px" }}>
        <h2>Exceptions Found:</h2>
        <ul>
          {exceptions.map((ex, index) => (
            <li key={index} style={{ color: "red" }}>
              <strong>
                <a
                  href={`#line-${ex.lineNumber}`}
                  style={{ textDecoration: "none", color: "red" }}
                >
                  {ex.message} (Line: {ex.lineNumber})
                </a>
              </strong>
              <button
                onClick={() => toggleExpand(index)}
                style={{ marginLeft: "10px", cursor: "pointer" }}
              >
                {expanded[index] ? "Hide Stack Trace" : "Show Stack Trace"}
              </button>
              {expanded[index] && (
                <pre style={{ color: "gray" }}>{ex.stackTrace.join("\n")}</pre>
              )}
              <p style={{ color: "blue" }}>{ex.causedBy}</p>
            </li>
          ))}
        </ul>
      </div>
      <h2>Full Log:</h2>
      <pre
        style={{ backgroundColor: "#f4f4f4", padding: "10px" }}
      >
        {logContent.split("\n").map((line, idx) => (
          <div key={idx} id={`line-${idx + 1}`}>
            <span style={{ color: "gray" }}>{idx + 1}:</span> {line}
          </div>
        ))}
      </pre>
    </div>
  );
};

export default LogAnalyzer;
