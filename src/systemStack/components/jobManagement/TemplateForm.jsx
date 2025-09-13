import { h, render, Fragment } from "/vendor/preact/preact.mjs";
import { useEffect, useMemo, useRef, useState } from "/vendor/preact/hooks.mjs";

import { apiCall } from "/userStore.js";

export default function TemplateForm({ template, onSave }) {
  const [formData, setFormData] = useState({
    name: template?.name || "",
    className: template?.className || "",
    description: template?.description || "",
    startType: template?.startType || "adhoc-user",
    jobLanguage: template?.jobLanguage || "jsclass",
    jobCommand: template?.jobCommand || "",
    isEnabled: template?.isEnabled || false,
    supportsPause: template?.supportsPause || false,
    supportsCancel: template?.supportsCancel || false,
    supportsUndo: template?.supportsUndo || false,
  });

  return (
    <form className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Template Name
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Class Name
          </label>
          <input
            type="text"
            value={formData.className}
            onChange={(e) =>
              setFormData({ ...formData, className: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          rows="3"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Start Type
          </label>
          <select
            value={formData.startType}
            onChange={(e) =>
              setFormData({ ...formData, startType: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="adhoc-user">Ad-hoc User</option>
            <option value="adhoc-system">Ad-hoc System</option>
            <option value="scheduled">Scheduled</option>
            <option value="service">Service</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Job Language
          </label>
          <select
            value={formData.jobLanguage}
            onChange={(e) =>
              setFormData({ ...formData, jobLanguage: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="jsclass">JS Class</option>
            <option value="javascript">JavaScript</option>
            <option value="powershell">PowerShell</option>
            <option value="sh">Shell Script</option>
          </select>
        </div>
      </div>

      {formData.jobLanguage !== "jsclass" && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Job Command
          </label>
          <textarea
            value={formData.jobCommand}
            onChange={(e) =>
              setFormData({ ...formData, jobCommand: e.target.value })
            }
            rows="4"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
            placeholder="Enter your script or command here..."
          />
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={formData.isEnabled}
            onChange={(e) =>
              setFormData({ ...formData, isEnabled: e.target.checked })
            }
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="ml-2 text-sm text-gray-700">Enabled</span>
        </label>
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={formData.supportsPause}
            onChange={(e) =>
              setFormData({ ...formData, supportsPause: e.target.checked })
            }
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="ml-2 text-sm text-gray-700">Pausable</span>
        </label>
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={formData.supportsCancel}
            onChange={(e) =>
              setFormData({ ...formData, supportsCancel: e.target.checked })
            }
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="ml-2 text-sm text-gray-700">Cancelable</span>
        </label>
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={formData.supportsUndo}
            onChange={(e) =>
              setFormData({ ...formData, supportsUndo: e.target.checked })
            }
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="ml-2 text-sm text-gray-700">Undoable</span>
        </label>
      </div>

      <div className="flex justify-end space-x-3 pt-4 border-t">
        <button
          type="button"
          onClick={onSave}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 flex items-center space-x-2"
        >
          <Save className="w-4 h-4" />
          <span>Save Template</span>
        </button>
      </div>
    </form>
  );
}
