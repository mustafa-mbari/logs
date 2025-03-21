import React, { useState } from "react";
import "tailwindcss/tailwind.css";

const LogAnalyzer = ({ logData }) => {
  const lines = logData.split("\n");
  const [selectedLine, setSelectedLine] = useState(null);
  
  const exceptions = [];
  let currentException = null;

  lines.forEach((line, index) => {
    if (line.startsWith("com.swisslog")) {
      if (currentException) exceptions.push(currentException);
      currentException = { startLine: index + 1, message: line, details: [line] };
    } else if (currentException && line.includes("at")) {
      currentException.details.push(line);
    } else if (currentException && line.startsWith("Caused by")) {
      currentException.details.push(line);
      exceptions.push(currentException);
      currentException = null;
    }
  });

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold">Log Analyzer</h1>
      <div className="grid grid-cols-2 gap-4">
        {/* Exception List */}
        <div>
          <h2 className="text-xl font-bold mb-2">Exception List</h2>
          <ul className="border p-2 bg-gray-100">
            {exceptions.map((ex, idx) => (
              <li
                key={idx}
                className="cursor-pointer text-red-600 hover:underline"
                onClick={() => setSelectedLine(ex.startLine)}
              >
                Exception at line {ex.startLine}: {ex.message}
              </li>
            ))}
          </ul>
        </div>
        {/* Full Log */}
        <div className="border p-2 overflow-auto max-h-[400px]">
          <h2 className="text-xl font-bold mb-2">Full Log</h2>
          <pre className="text-sm">
            {lines.map((line, idx) => (
              <div
                key={idx}
                id={`line-${idx + 1}`}
                className={`py-1 ${idx + 1 === selectedLine ? "bg-yellow-200" : ""}`}
              >
                <span className="text-gray-500">[{idx + 1}]</span> {" "}
                <span
                  className={
                    line.startsWith("com.swisslog")
                      ? "text-red-600 font-bold"
                      : line.startsWith("Caused by")
                      ? "text-blue-600 font-bold"
                      : "text-black"
                  }
                >
                  {line}
                </span>
              </div>
            ))}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default LogAnalyzer;
