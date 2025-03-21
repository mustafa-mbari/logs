import React, { useState, useRef, useEffect } from "react";

const LogAnalyzer = () => {
  const [logContent, setLogContent] = useState([]);
  const [exceptions, setExceptions] = useState([]);
  const logRef = useRef(null);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const lines = text.split("\n").map((line, index) => ({ number: index + 1, text: line }));
      setLogContent(lines);
      analyzeLog(lines);
    };
    reader.readAsText(file);
  };

  const analyzeLog = (lines) => {
    const extractedExceptions = [];
    let currentException = null;

    lines.forEach((lineObj) => {
      const { number, text } = lineObj;
      if (text.startsWith("####")) {
        return; // Ignore unimportant lines
      }
      if (text.startsWith("com.swisslog")) {
        if (currentException) {
          extractedExceptions.push(currentException);
        }
        currentException = {
          startLine: number,
          message: text,
          stackTrace: [],
        };
      } else if (text.includes("at") && currentException) {
        currentException.stackTrace.push(text);
      } else if (text.startsWith("Caused by") && currentException) {
        currentException.causedBy = text;
        extractedExceptions.push(currentException);
        currentException = null;
      }
    });

    if (currentException) {
      extractedExceptions.push(currentException);
    }

    setExceptions(extractedExceptions);
  };

  const scrollToLine = (lineNumber) => {
    if (logRef.current) {
      const lineElement = document.getElementById(`line-${lineNumber}`);
      if (lineElement) {
        lineElement.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Log Analyzer</h1>
      <input type="file" accept=".log" onChange={handleFileUpload} />
      <div style={{ marginTop: "20px" }}>
        <h2>Exceptions Found:</h2>
        <ul>
          {exceptions.map((ex, index) => (
            <li key={index} style={{ color: "red", cursor: "pointer" }} onClick={() => scrollToLine(ex.startLine)}>
              <strong>Line {ex.startLine}: {ex.message}</strong>
              <pre style={{ color: "gray" }}>{ex.stackTrace.join("\n")}</pre>
              <p style={{ color: "blue" }}>{ex.causedBy}</p>
            </li>
          ))}
        </ul>
      </div>
      <h2>Full Log:</h2>
      <pre ref={logRef} style={{ backgroundColor: "#f4f4f4", padding: "10px", maxHeight: "400px", overflow: "auto" }}>
        {logContent.map((lineObj) => (
          <div key={lineObj.number} id={`line-${lineObj.number}`}>
            <span style={{ color: "blue" }}>{lineObj.number.toString().padStart(4, " ")}: </span>
            <span style={{ color: lineObj.text.startsWith("com.swisslog") ? "red" : "black" }}>{lineObj.text}</span>
          </div>
        ))}
      </pre>
    </div>
  );
};

export default LogAnalyzer;
