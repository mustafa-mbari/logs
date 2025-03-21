import React, { useState } from "react";

export default function LogAnalyzer() {
  const [logFile, setLogFile] = useState(null);
  const [logs, setLogs] = useState([]);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target.result;
        processLogs(text);
      };
      reader.readAsText(file);
      setLogFile(file.name);
    }
  };

  const processLogs = (text) => {
    const lines = text.split("\n");
    const parsedLogs = [];
    let currentException = null;

    lines.forEach((line) => {
      if (line.startsWith("####")) {
        return; // Ignore lines starting with ####
      }
      
      if (line.includes("com.swisslog")) {
        if (currentException) {
          parsedLogs.push(currentException);
        }
        currentException = { type: "error", details: [line] };
      } else if (line.includes("at") && currentException) {
        currentException.details.push(line);
      } else if (line.startsWith("Caused by") && currentException) {
        currentException.details.push(line);
        parsedLogs.push(currentException);
        currentException = null;
      } else {
        parsedLogs.push({ type: "info", details: [line] });
      }
    });

    setLogs(parsedLogs);
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-xl font-bold mb-4">Log Analyzer</h1>
      <input type="file" onChange={handleFileUpload} className="mb-4" />
      {logFile && <p>Analyzing: {logFile}</p>}
      <div className="bg-white p-4 shadow rounded mt-4">
        {logs.map((log, index) => (
          <pre
            key={index}
            className={
              log.type === "error" ? "text-red-500" : "text-gray-700"
            }
          >
            {log.details.join("\n")}
          </pre>
        ))}
      </div>
    </div>
  );
}
