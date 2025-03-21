import { useState } from "react";

export default function LogAnalyzer() {
  const [logText, setLogText] = useState("");
  const [exceptions, setExceptions] = useState([]);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      setLogText(text);
      analyzeLog(text);
    };
    reader.readAsText(file);
  };

  const analyzeLog = (text) => {
    const lines = text.split("\n");
    const extractedExceptions = [];
    let currentException = null;
    let startLine = null;

    lines.forEach((line, index) => {
      if (line.includes("com.swisslog")) {
        if (currentException) {
          extractedExceptions.push({ ...currentException, end: index });
        }
        currentException = { message: line, start: index, stack: [] };
        startLine = index;
      } else if (currentException && line.includes("at")) {
        currentException.stack.push(line);
      } else if (currentException && line.includes("Caused by")) {
        currentException.cause = line;
        extractedExceptions.push({ ...currentException, end: index });
        currentException = null;
      }
    });
    if (currentException) {
      extractedExceptions.push({ ...currentException, end: lines.length });
    }
    setExceptions(extractedExceptions);
  };

  return (
    <div className="p-4 font-mono">
      <h1 className="text-2xl font-bold">Log Analyzer</h1>
      <input type="file" onChange={handleFileUpload} className="my-2" />
      <div className="flex gap-4">
        <div className="w-1/3">
          <h2 className="text-xl font-bold">Exception List</h2>
          <ul className="list-disc list-inside">
            {exceptions.map((ex, idx) => (
              <li
                key={idx}
                className="text-red-500 cursor-pointer hover:underline"
                onClick={() => {
                  document.getElementById(`line-${ex.start}`)?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                Line {ex.start}: {ex.message}
              </li>
            ))}
          </ul>
        </div>
        <div className="w-2/3 overflow-auto h-[500px] border p-2 bg-gray-100">
          <h2 className="text-xl font-bold">Full Log</h2>
          <pre>
            {logText.split("\n").map((line, index) => (
              <div key={index} id={`line-${index}`} className="flex gap-2">
                <span className="text-gray-500">{index + 1}:</span>
                <span className={line.includes("com.swisslog") ? "text-red-500" : "text-black"}>{line}</span>
              </div>
            ))}
          </pre>
        </div>
      </div>
    </div>
  );
}
