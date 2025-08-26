import { h, render, Fragment } from '/vendor/preact/preact.mjs';
import { useEffect, useMemo, useRef, useState } from '/vendor/preact/hooks.mjs';

export default function ExecutionLogsViewer({ execution, logs, onClose }) {
  const [logLevel, setLogLevel] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const executionLogs = logs.filter((log) => log.executionId === execution.id);

  const filteredLogs = executionLogs.filter((log) => {
    const matchesLevel = logLevel === "all" || log.level === logLevel;
    const matchesSearch =
      !searchTerm ||
      log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      JSON.stringify(log.data || {})
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
    return matchesLevel && matchesSearch;
  });

  const getLevelIcon = (level) => {
    switch (level) {
      case "error":
        return <XCircle className="w-4 h-4 text-red-500" />;
      case "warn":
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case "info":
        return <CheckCircle className="w-4 h-4 text-blue-500" />;
      case "debug":
        return <Settings className="w-4 h-4 text-gray-500" />;
      default:
        return <CheckCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getLevelColor = (level) => {
    switch (level) {
      case "error":
        return "bg-red-50 border-red-200";
      case "warn":
        return "bg-yellow-50 border-yellow-200";
      case "info":
        return "bg-blue-50 border-blue-200";
      case "debug":
        return "bg-gray-50 border-gray-200";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="space-y-4">
      {/* Execution Info */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-gray-900">Execution Details</h4>
            <p className="text-sm text-gray-600">
              Status:{" "}
              <span className="font-medium capitalize">{execution.status}</span>
              {execution.startTime && (
                <span className="ml-4">
                  Started: {formatTimestamp(execution.startTime)}
                </span>
              )}
              {execution.endTime && (
                <span className="ml-4">
                  Ended: {formatTimestamp(execution.endTime)}
                </span>
              )}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            {execution.progress !== undefined && (
              <div className="flex items-center space-x-2">
                <div className="w-20 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${execution.progress}%` }}
                  ></div>
                </div>
                <span className="text-sm text-gray-600">
                  {execution.progress}%
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-700">Level:</label>
          <select
            value={logLevel}
            onChange={(e) => setLogLevel(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Levels</option>
            <option value="error">Error</option>
            <option value="warn">Warning</option>
            <option value="info">Info</option>
            <option value="debug">Debug</option>
          </select>
        </div>
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search logs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="text-sm text-gray-500">
          {filteredLogs.length} of {executionLogs.length} entries
        </div>
      </div>

      {/* Logs Display */}
      <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg">
        {filteredLogs.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Terminal className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p>No logs found matching your criteria</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredLogs.map((log, index) => (
              <div
                key={log.id || index}
                className={`p-3 ${getLevelColor(log.level)}`}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    {getLevelIcon(log.level)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          log.level === "error"
                            ? "bg-red-100 text-red-800"
                            : log.level === "warn"
                            ? "bg-yellow-100 text-yellow-800"
                            : log.level === "info"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {log.level.toUpperCase()}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatTimestamp(log.timestamp)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-900 font-medium">
                      {log.message}
                    </p>
                    {log.data && Object.keys(log.data).length > 0 && (
                      <details className="mt-2">
                        <summary className="text-xs text-gray-600 cursor-pointer hover:text-gray-800">
                          Additional Data
                        </summary>
                        <pre className="mt-1 text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                          {JSON.stringify(log.data, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Raw Logs (if available) */}
      {execution.logs && (
        <details className="mt-4">
          <summary className="text-sm font-medium text-gray-700 cursor-pointer hover:text-gray-900 mb-2">
            Raw Execution Logs
          </summary>
          <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm overflow-x-auto">
            <pre>{execution.logs}</pre>
          </div>
        </details>
      )}

      <div className="flex justify-end pt-4 border-t">
        <button
          onClick={onClose}
          className="px-4 py-2 bg-gray-600 text-white rounded-md text-sm font-medium hover:bg-gray-700"
        >
          Close
        </button>
      </div>
    </div>
  );
}
