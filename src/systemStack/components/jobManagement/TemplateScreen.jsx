import { h, render, Fragment } from "/vendor/preact/preact.mjs";
import { useEffect, useMemo, useRef, useState } from "/vendor/preact/hooks.mjs";

export default function TemplateScreen({ templates }) {
  return (
    <div className="bg-white shadow-md rounded-lg overflow-scroll">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Template
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Class Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Start Type
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Language
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Capabilities
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {templates.map((template) => (
            <tr key={template.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">
                  {template.name}
                </div>
                <div className="text-sm text-gray-500">
                  {template.description}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900 font-mono">
                  {template.className}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {template.startType}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  {template.jobLanguage}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex flex-wrap gap-1">
                  {template.supportsPause && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      Pausable
                    </span>
                  )}
                  {template.supportsCancel && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      Cancelable
                    </span>
                  )}
                  {template.supportsUndo && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      Undoable
                    </span>
                  )}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    template.isEnabled
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {template.isEnabled ? "Enabled" : "Disabled"}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                <button
                  onClick={() => openModal("execution", template)}
                  className="text-green-600 hover:text-green-700"
                  title="Run Now"
                >
                  <i
                    className="bi bi-play-fill"
                    style={{ fontSize: "1rem" }}
                  ></i>
                </button>
                <button
                  onClick={() =>
                    openModal("schedule", {
                      templateId: template.id,
                      templateName: template.name,
                    })
                  }
                  className="text-purple-600 hover:text-purple-700"
                  title="Create Schedule"
                >
                  <i
                    className="bi bi-calendar-event"
                    style={{ fontSize: "1rem" }}
                  ></i>
                </button>
                <button
                  onClick={() => openModal("template", template)}
                  className="text-blue-600 hover:text-blue-700"
                  title="Edit Template"
                >
                  <i
                    className="bi bi-pencil-square"
                    style={{ fontSize: "1rem" }}
                  ></i>
                </button>
                <button
                  className="text-red-600 hover:text-red-700"
                  title="Delete Template"
                >
                  <i className="bi bi-trash" style={{ fontSize: "1rem" }}></i>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
