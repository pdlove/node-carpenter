import { h, render, Fragment } from "/vendor/preact/preact.mjs";
import { useEffect, useMemo, useRef, useState } from "/vendor/preact/hooks.mjs";

import { apiCall } from "/userStore.js";

export default function ScheduleForm({ schedule, templates, onSave })
{
  const [formData, setFormData] = useState({
    name: schedule?.name || "",
    templateId: schedule?.templateId || schedule?.templateId || "",
    description: schedule?.description || "",
    scheduleType: schedule?.scheduleType || "immediate",
    startTime: schedule?.startTime || "",
    interval: schedule?.interval || 1,
    intervalUnits: schedule?.intervalUnits || "h",
    runCount: schedule?.runCount || 1,
    priority: schedule?.priority || 0,
    isActive: schedule?.isActive !== undefined ? schedule.isActive : true,
    configuration: schedule?.configuration || {},
  });

  const selectedTemplate = templates.find((t) => t.id === formData.templateId);

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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Schedule Name
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="My Daily Job"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Job Template
          </label>
          <select
            value={formData.templateId}
            onChange={(e) =>
              setFormData({ ...formData, templateId: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select a template...</option>
            {templates
              .filter((t) => t.isEnabled)
              .map((template) => (
                <option key={template.id} value={template.id}>
                  {template.name}
                </option>
              ))}
          </select>
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
          rows="2"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Optional description of this schedule"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Schedule Type
          </label>
          <select
            value={formData.scheduleType}
            onChange={(e) =>
              setFormData({ ...formData, scheduleType: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="immediate">Run Immediately</option>
            <option value="delayed">Run Once (Delayed)</option>
            <option value="recurring">Recurring</option>
            <option value="cron">Cron Expression</option>
          </select>
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
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Run Count
          </label>
          <input
            type="number"
            value={formData.runCount}
            onChange={(e) =>
              setFormData({
                ...formData,
                runCount: parseInt(e.target.value) || 1,
              })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            min="0"
            placeholder="0 = infinite"
          />
        </div>
      </div>

      {(formData.scheduleType === "delayed" ||
        formData.scheduleType === "recurring") && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Time
            </label>
            <input
              type="datetime-local"
              value={formData.startTime}
              onChange={(e) =>
                setFormData({ ...formData, startTime: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {formData.scheduleType === "recurring" && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Interval
                </label>
                <input
                  type="number"
                  value={formData.interval}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      interval: parseInt(e.target.value) || 1,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Units
                </label>
                <select
                  value={formData.intervalUnits}
                  onChange={(e) =>
                    setFormData({ ...formData, intervalUnits: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="s">Seconds</option>
                  <option value="m">Minutes</option>
                  <option value="h">Hours</option>
                  <option value="d">Days</option>
                </select>
              </div>
            </>
          )}
        </div>
      )}

      {formData.scheduleType === "cron" && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Cron Expression
          </label>
          <input
            type="text"
            value={formData.cronExpression || ""}
            onChange={(e) =>
              setFormData({ ...formData, cronExpression: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
            placeholder="0 0 * * *"
          />
          <p className="text-xs text-gray-500 mt-1">
            Format: minute hour day month day-of-week (e.g., "0 2 * * *" for
            daily at 2 AM)
          </p>
        </div>
      )}

      {/* Configuration Section */}
      {selectedTemplate && selectedTemplate.configurationSchema && (
        <div className="border-t pt-4">
          <h4 className="text-sm font-medium text-gray-900 mb-3">
            Job Configuration
          </h4>
          <div className="space-y-3">
            {Object.entries(selectedTemplate.configurationSchema).map(
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
                </div>
              )
            )}
          </div>
        </div>
      )}

      <div className="flex items-center">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={formData.isActive}
            onChange={(e) =>
              setFormData({ ...formData, isActive: e.target.checked })
            }
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="ml-2 text-sm text-gray-700">Schedule is active</span>
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
          className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 flex items-center space-x-2"
        >
          <i class="bi bi-floppy-fill "></i>
          <span>Save Schedule</span>
        </button>
      </div>
    </form>
  );
}
