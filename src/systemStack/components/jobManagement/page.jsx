import { h, render, Fragment } from "/vendor/preact/preact.mjs";
import { useEffect, useMemo, useRef, useState } from "/vendor/preact/hooks.mjs";

import { apiCall } from "/userStore.js";
import TemplateScreen from "./TemplateScreen.jsx"
import TemplateForm from "./TemplateForm.jsx"
import ScheduleForm from "./ScheduleForm.jsx"

export function JobManagementApp() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("templates");
  const [templates, setTemplates] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [executions, setExecutions] = useState([]);
  const [executionLogs, setExecutionLogs] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);

  // Load data from API
  const loadData = async () => {
    setLoading(true);
    setError(null);

    try {
      const [
        templatesData,
        schedulesData,
        executionsData,
        logsData,
        serversData,
      ] = await Promise.all([
        apiCall("JobTemplate"),
        apiCall("JobSchedule"),
        apiCall("JobExecution"),
        apiCall("JobExecutionLog"),
        apiCall("JobServer"),
      ]);

      setTemplates(templatesData);
      setSchedules(schedulesData);
      setExecutions(executionsData);
      setExecutionLogs(logsData);
      setServers(serversData);
    } catch (err) {
      setError(`Failed to load data: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  const openModal = (type, item = null) => {
    setModalType(type);
    setSelectedItem(item);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedItem(null);
    setModalType("");
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return (
          <i
            className="bi bi-check-circle-fill text-green-500"
            style={{ fontSize: "1rem" }}
          ></i>
        );
      case "running":
        return (
          <i
            className="bi bi-lightning-charge-fill text-blue-500 animate-pulse"
            style={{ fontSize: "1rem" }}
          ></i>
        );
      case "failed":
        return (
          <i
            className="bi bi-x-circle-fill text-red-500"
            style={{ fontSize: "1rem" }}
          ></i>
        );
      case "paused":
        return (
          <i
            className="bi bi-pause-circle-fill text-yellow-500"
            style={{ fontSize: "1rem" }}
          ></i>
        );
      default:
        return (
          <i
            className="bi bi-clock-fill text-gray-500"
            style={{ fontSize: "1rem" }}
          ></i>
        );
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Job Management System
              </h1>
              <p className="text-gray-600">
                Manage job templates, schedules, and executions
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => openModal("template")}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700 transition-colors"
              >
                <i className="bi bi-plus-lg" style={{ fontSize: "1rem" }}></i>
                <span>New Template</span>
              </button>
              <button
                onClick={() => openModal("schedule")}
                className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-green-700 transition-colors"
              >
                <i
                  className="bi bi-calendar-event"
                  style={{ fontSize: "1rem" }}
                ></i>
                <span>New Schedule</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab("templates")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "templates"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center space-x-2">
                <i
                  className="bi bi-code-slash"
                  style={{ fontSize: "1rem" }}
                ></i>
                <span>Job Templates ({templates.length})</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab("schedules")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "schedules"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center space-x-2">
                <i
                  className="bi bi-calendar-event"
                  style={{ fontSize: "1rem" }}
                ></i>
                <span>Job Schedules ({schedules.length})</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab("executions")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "executions"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center space-x-2">
                <i className="bi bi-terminal" style={{ fontSize: "1rem" }}></i>
                <span>Executions ({executions.length})</span>
              </div>
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Job Templates Tab */}
        {activeTab === "templates" && (<TemplateScreen templates = { templates } />)}

        {/* Job Schedules Tab */}
        {activeTab === "schedules" && (
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Schedule
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Template
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Next Run
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Executions
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
                {schedules.map((schedule) => {
                  const template = templates.find(
                    (t) => t.id === schedule.templateId
                  );
                  return (
                    <tr key={schedule.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {schedule.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {schedule.scheduleType === "recurring" &&
                            `Every ${schedule.interval} ${schedule.intervalUnits}`}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {template?.name || "Unknown"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {schedule.scheduleType}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {schedule.nextExecution
                          ? formatDate(schedule.nextExecution)
                          : "Not scheduled"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {schedule.timesExecuted}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            schedule.isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {schedule.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => openModal("execution", template)}
                          className="text-green-600 hover:text-green-700"
                        >
                          <i className="bi bi-play-fill w-4 h-4"></i>
                        </button>

                        <button
                          onClick={() => openModal("schedule", schedule)}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <i className="bi bi-pencil-fill w-4 h-4"></i>
                        </button>

                        <button className="text-red-600 hover:text-red-700">
                          <i className="bi bi-trash-fill w-4 h-4"></i>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Job Executions Tab */}
        {activeTab === "executions" && (
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Job
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Progress
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Started
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {executions.map((execution) => {
                  const template = templates.find(
                    (t) => t.id === execution.templateId
                  );
                  const schedule = schedules.find(
                    (s) => s.id === execution.scheduleId
                  );
                  const duration = execution.endTime
                    ? Math.round(
                        (new Date(execution.endTime) -
                          new Date(execution.startTime)) /
                          1000
                      )
                    : execution.startTime
                    ? Math.round(
                        (new Date() - new Date(execution.startTime)) / 1000
                      )
                    : 0;

                  return (
                    <tr key={execution.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {template?.name || "Unknown"}
                        </div>
                        <div className="text-sm text-gray-500">
                          {schedule
                            ? `Schedule: ${schedule.name}`
                            : "Ad-hoc execution"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(execution.status)}
                          <span className="text-sm text-gray-900 capitalize">
                            {execution.status}
                          </span>
                        </div>
                        {execution.progressMessage && (
                          <div className="text-xs text-gray-500 mt-1">
                            {execution.progressMessage}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${execution.progress}%` }}
                          ></div>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {execution.progress}%
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {execution.startTime
                          ? formatDate(execution.startTime)
                          : "Not started"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {duration > 0 ? `${duration}s` : "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => openModal("logs", execution)}
                          className="text-blue-600 hover:text-blue-700"
                          title="View Logs"
                        >
                          <i className="bi bi-eye-fill w-4 h-4"></i>
                        </button>
                        {execution.status === "running" &&
                          template?.supportsPause && (
                            <button className="text-yellow-600 hover:text-yellow-700">
                              <i className="bi bi-pause-fill w-4 h-4"></i>
                            </button>
                          )}
                        {execution.status === "paused" && (
                          <button className="text-green-600 hover:text-green-700">
                            <i className="bi bi-play-fill w-4 h-4"></i>
                          </button>
                        )}
                        {(execution.status === "running" ||
                          execution.status === "paused") &&
                          template?.supportsCancel && (
                            <button className="text-red-600 hover:text-red-700">
                              <i className="bi bi-stop-fill w-4 h-4"></i>
                            </button>
                          )}
                        {execution.status === "failed" && (
                          <button className="text-blue-600 hover:text-blue-700">
                            <i className="bi bi-arrow-counterclockwise-fill w-4 h-4"></i>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between pb-3">
              <h3 className="text-lg font-semibold text-gray-900">
                {modalType === "template" &&
                  (selectedItem ? "Edit Job Template" : "Create Job Template")}
                {modalType === "schedule" &&
                  (selectedItem ? "Edit Job Schedule" : "Create Job Schedule")}
                {modalType === "execution" && "Run Job"}
                {modalType === "logs" && `Execution Logs - ${selectedItem?.id}`}
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <i className="bi bi-x-fill w-6 h-6"></i>
              </button>
            </div>

            <div className="py-4">
              {modalType === "template" && (
                <TemplateForm template={selectedItem} onSave={closeModal} />
              )}
              {modalType === "schedule" && (
                <ScheduleForm
                  schedule={selectedItem}
                  templates={templates}
                  onSave={closeModal}
                />
              )}
              {modalType === "execution" && (
                <ExecutionForm template={selectedItem} onSave={closeModal} />
              )}
              {modalType === "logs" && (
                <ExecutionLogsViewer
                  execution={selectedItem}
                  logs={executionLogs}
                  onClose={closeModal}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
