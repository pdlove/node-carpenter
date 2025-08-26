import { h, render, Fragment } from '/vendor/preact/preact.mjs';
import { useEffect, useMemo, useRef, useState } from '/vendor/preact/hooks.mjs';

export default function ExecutionForm({ template, onSave }) {
  const [formData, setFormData] = useState({
    priority: 0,
    configuration: {},
  });

  const handleConfigChange = (key, value) => {
    setFormData({
      ...formData,
      configuration: {
        ...formData.configuration,
        [key]: value,
      },
    });
  };

  return (
    <form className="space-y-4">
      <div className="bg-blue-50 p-4 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">
          Running: {template?.name}
        </h4>
        <p className="text-sm text-blue-700">{template?.description}</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Priority
        </label>
        <input
          type="number"
          value={formData.priority}
          onChange={(e) =>
            setFormData({
              ...formData,
              priority: parseInt(e.target.value) || 0,
            })
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          min="0"
          max="100"
          placeholder="0 = normal priority"
        />
        <p className="text-xs text-gray-500 mt-1">Higher numbers run first</p>
      </div>

      {/* Configuration Section */}
      {template && template.configurationSchema && (
        <div className="border-t pt-4">
          <h4 className="text-sm font-medium text-gray-900 mb-3">
            Job Configuration
          </h4>
          <div className="space-y-3">
            {Object.entries(template.configurationSchema).map(
              ([key, config]) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {config.display || key}
                    {!config.allowNull && (
                      <span className="text-red-500 ml-1">*</span>
                    )}
                  </label>
                  {config.type === "BOOLEAN" ? (
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={
                          formData.configuration[key] ||
                          config.defaultValue ||
                          false
                        }
                        onChange={(e) =>
                          handleConfigChange(key, e.target.checked)
                        }
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        {config.description ||
                          `Enable ${config.display || key}`}
                      </span>
                    </label>
                  ) : config.type === "INTEGER" ? (
                    <input
                      type="number"
                      value={
                        formData.configuration[key] || config.defaultValue || ""
                      }
                      onChange={(e) =>
                        handleConfigChange(
                          key,
                          parseInt(e.target.value) || null
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder={config.description}
                    />
                  ) : config.type === "TEXT" ? (
                    <textarea
                      value={
                        formData.configuration[key] || config.defaultValue || ""
                      }
                      onChange={(e) => handleConfigChange(key, e.target.value)}
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder={config.description}
                    />
                  ) : (
                    <input
                      type="text"
                      value={
                        formData.configuration[key] || config.defaultValue || ""
                      }
                      onChange={(e) => handleConfigChange(key, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder={config.description}
                    />
                  )}
                  {config.description && (
                    <p className="text-xs text-gray-500 mt-1">
                      {config.description}
                    </p>
                  )}
                </div>
              )
            )}
          </div>
        </div>
      )}

      <div className="bg-yellow-50 p-4 rounded-lg">
        <div className="flex items-start">
          <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 mr-2" />
          <div>
            <h4 className="font-medium text-yellow-800">Immediate Execution</h4>
            <p className="text-sm text-yellow-700 mt-1">
              This job will be queued for immediate execution. A server will
              pick it up and run it as soon as possible.
            </p>
          </div>
        </div>
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
          className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 flex items-center space-x-2"
        >
          <Play className="w-4 h-4" />
          <span>Run Job</span>
        </button>
      </div>
    </form>
  );
}
