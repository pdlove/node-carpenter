import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Play, 
  Pause, 
  Square, 
  Edit, 
  Trash2, 
  Plus, 
  Settings, 
  Clock, 
  Server, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  RotateCcw,
  Eye,
  Save,
  X,
  Code,
  Terminal,
  Zap
} from 'lucide-react';

const JobManagementApp = () => {
  const [activeTab, setActiveTab] = useState('templates');
  const [templates, setTemplates] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [executions, setExecutions] = useState([]);
  const [executionLogs, setExecutionLogs] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);


  // API utility function
  const apiCall = async (endpoint, options = {}) => {
    try {
      const response = await fetch(`/api/data/${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      });
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }
      
      return await response.json();
    } catch (err) {
      console.error(`API call failed for ${endpoint}:`, err);
      throw err;
    }
  };

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
        serversData
      ] = await Promise.all([
        apiCall('JobTemplate'),
        apiCall('JobSchedule'),
        apiCall('JobExecution'),
        apiCall('JobExecutionLog'),
        apiCall('JobServer')
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
    setModalType('');
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'running': return <Zap className="w-4 h-4 text-blue-500 animate-pulse" />;
      case 'failed': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'paused': return <Pause className="w-4 h-4 text-yellow-500" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
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
              <h1 className="text-3xl font-bold text-gray-900">Job Management System</h1>
              <p className="text-gray-600">Manage job templates, schedules, and executions</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => openModal('template')}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>New Template</span>
              </button>
              <button
                onClick={() => openModal('schedule')}
                className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-green-700 transition-colors"
              >
                <Calendar className="w-4 h-4" />
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
              onClick={() => setActiveTab('templates')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'templates'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Code className="w-4 h-4" />
                <span>Job Templates ({templates.length})</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('schedules')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'schedules'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span>Job Schedules ({schedules.length})</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('executions')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'executions'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Terminal className="w-4 h-4" />
                <span>Executions ({executions.length})</span>
              </div>
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Job Templates Tab */}
        {activeTab === 'templates' && (
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Template</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Language</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Capabilities</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {templates.map((template) => (
                  <tr key={template.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{template.name}</div>
                      <div className="text-sm text-gray-500">{template.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 font-mono">{template.className}</div>
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
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        template.isEnabled 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {template.isEnabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button 
                        onClick={() => openModal('execution', template)}
                        className="text-green-600 hover:text-green-700"
                        title="Run Now"
                      >
                        <Play className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => openModal('schedule', { templateId: template.id, templateName: template.name })}
                        className="text-purple-600 hover:text-purple-700"
                        title="Create Schedule"
                      >
                        <Calendar className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => openModal('template', template)}
                        className="text-blue-600 hover:text-blue-700"
                        title="Edit Template"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="text-red-600 hover:text-red-700" title="Delete Template">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Job Schedules Tab */}
        {activeTab === 'schedules' && (
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Schedule</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Template</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Next Run</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Executions</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {schedules.map((schedule) => {
                  const template = templates.find(t => t.id === schedule.templateId);
                  return (
                    <tr key={schedule.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{schedule.name}</div>
                        <div className="text-sm text-gray-500">
                          {schedule.scheduleType === 'recurring' && 
                            `Every ${schedule.interval} ${schedule.intervalUnits}`
                          }
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{template?.name || 'Unknown'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {schedule.scheduleType}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {schedule.nextExecution ? formatDate(schedule.nextExecution) : 'Not scheduled'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {schedule.timesExecuted}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          schedule.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {schedule.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button 
                          onClick={() => openModal('execution', template)}
                          className="text-green-600 hover:text-green-700"
                        >
                          <Play className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => openModal('schedule', schedule)}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="text-red-600 hover:text-red-700">
                          <Trash2 className="w-4 h-4" />
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
        {activeTab === 'executions' && (
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Job</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progress</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Started</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {executions.map((execution) => {
                  const template = templates.find(t => t.id === execution.templateId);
                  const schedule = schedules.find(s => s.id === execution.scheduleId);
                  const duration = execution.endTime 
                    ? Math.round((new Date(execution.endTime) - new Date(execution.startTime)) / 1000)
                    : execution.startTime 
                    ? Math.round((new Date() - new Date(execution.startTime)) / 1000)
                    : 0;
                  
                  return (
                    <tr key={execution.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{template?.name || 'Unknown'}</div>
                        <div className="text-sm text-gray-500">
                          {schedule ? `Schedule: ${schedule.name}` : 'Ad-hoc execution'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(execution.status)}
                          <span className="text-sm text-gray-900 capitalize">{execution.status}</span>
                        </div>
                        {execution.progressMessage && (
                          <div className="text-xs text-gray-500 mt-1">{execution.progressMessage}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                            style={{ width: `${execution.progress}%` }}
                          ></div>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">{execution.progress}%</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {execution.startTime ? formatDate(execution.startTime) : 'Not started'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {duration > 0 ? `${duration}s` : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button 
                          onClick={() => openModal('logs', execution)}
                          className="text-blue-600 hover:text-blue-700"
                          title="View Logs"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {execution.status === 'running' && template?.supportsPause && (
                          <button className="text-yellow-600 hover:text-yellow-700">
                            <Pause className="w-4 h-4" />
                          </button>
                        )}
                        {execution.status === 'paused' && (
                          <button className="text-green-600 hover:text-green-700">
                            <Play className="w-4 h-4" />
                          </button>
                        )}
                        {(execution.status === 'running' || execution.status === 'paused') && template?.supportsCancel && (
                          <button className="text-red-600 hover:text-red-700">
                            <Square className="w-4 h-4" />
                          </button>
                        )}
                        {execution.status === 'failed' && (
                          <button className="text-blue-600 hover:text-blue-700">
                            <RotateCcw className="w-4 h-4" />
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
                {modalType === 'template' && (selectedItem ? 'Edit Job Template' : 'Create Job Template')}
                {modalType === 'schedule' && (selectedItem ? 'Edit Job Schedule' : 'Create Job Schedule')}
                {modalType === 'execution' && 'Run Job'}
                {modalType === 'logs' && `Execution Logs - ${selectedItem?.id}`}
              </h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="py-4">
              {modalType === 'template' && <TemplateForm template={selectedItem} onSave={closeModal} />}
              {modalType === 'schedule' && <ScheduleForm schedule={selectedItem} templates={templates} onSave={closeModal} />}
              {modalType === 'execution' && <ExecutionForm template={selectedItem} onSave={closeModal} />}
              {modalType === 'logs' && <ExecutionLogsViewer execution={selectedItem} logs={executionLogs} onClose={closeModal} />}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Template Form Component
const TemplateForm = ({ template, onSave }) => {
  const [formData, setFormData] = useState({
    name: template?.name || '',
    className: template?.className || '',
    description: template?.description || '',
    startType: template?.startType || 'adhoc-user',
    jobLanguage: template?.jobLanguage || 'jsclass',
    jobCommand: template?.jobCommand || '',
    isEnabled: template?.isEnabled || false,
    supportsPause: template?.supportsPause || false,
    supportsCancel: template?.supportsCancel || false,
    supportsUndo: template?.supportsUndo || false
  });

  return (
    <form className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Template Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Class Name</label>
          <input
            type="text"
            value={formData.className}
            onChange={(e) => setFormData({...formData, className: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({...formData, description: e.target.value})}
          rows="3"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Start Type</label>
          <select
            value={formData.startType}
            onChange={(e) => setFormData({...formData, startType: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="adhoc-user">Ad-hoc User</option>
            <option value="adhoc-system">Ad-hoc System</option>
            <option value="scheduled">Scheduled</option>
            <option value="service">Service</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Job Language</label>
          <select
            value={formData.jobLanguage}
            onChange={(e) => setFormData({...formData, jobLanguage: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="jsclass">JS Class</option>
            <option value="javascript">JavaScript</option>
            <option value="powershell">PowerShell</option>
            <option value="sh">Shell Script</option>
          </select>
        </div>
      </div>

      {formData.jobLanguage !== 'jsclass' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Job Command</label>
          <textarea
            value={formData.jobCommand}
            onChange={(e) => setFormData({...formData, jobCommand: e.target.value})}
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
            onChange={(e) => setFormData({...formData, isEnabled: e.target.checked})}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="ml-2 text-sm text-gray-700">Enabled</span>
        </label>
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={formData.supportsPause}
            onChange={(e) => setFormData({...formData, supportsPause: e.target.checked})}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="ml-2 text-sm text-gray-700">Pausable</span>
        </label>
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={formData.supportsCancel}
            onChange={(e) => setFormData({...formData, supportsCancel: e.target.checked})}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="ml-2 text-sm text-gray-700">Cancelable</span>
        </label>
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={formData.supportsUndo}
            onChange={(e) => setFormData({...formData, supportsUndo: e.target.checked})}
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
};

// Schedule Form Component
const ScheduleForm = ({ schedule, templates, onSave }) => {
  const [formData, setFormData] = useState({
    name: schedule?.name || '',
    templateId: schedule?.templateId || (schedule?.templateId || ''),
    description: schedule?.description || '',
    scheduleType: schedule?.scheduleType || 'immediate',
    startTime: schedule?.startTime || '',
    interval: schedule?.interval || 1,
    intervalUnits: schedule?.intervalUnits || 'h',
    runCount: schedule?.runCount || 1,
    priority: schedule?.priority || 0,
    isActive: schedule?.isActive !== undefined ? schedule.isActive : true,
    configuration: schedule?.configuration || {}
  });

  const selectedTemplate = templates.find(t => t.id === formData.templateId);

  const handleConfigChange = (key, value) => {
    setFormData({
      ...formData,
      configuration: {
        ...formData.configuration,
        [key]: value
      }
    });
  };

  return (
    <form className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Schedule Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="My Daily Job"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Job Template</label>
          <select
            value={formData.templateId}
            onChange={(e) => setFormData({...formData, templateId: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select a template...</option>
            {templates.filter(t => t.isEnabled).map(template => (
              <option key={template.id} value={template.id}>{template.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({...formData, description: e.target.value})}
          rows="2"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Optional description of this schedule"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Schedule Type</label>
          <select
            value={formData.scheduleType}
            onChange={(e) => setFormData({...formData, scheduleType: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="immediate">Run Immediately</option>
            <option value="delayed">Run Once (Delayed)</option>
            <option value="recurring">Recurring</option>
            <option value="cron">Cron Expression</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
          <input
            type="number"
            value={formData.priority}
            onChange={(e) => setFormData({...formData, priority: parseInt(e.target.value) || 0})}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            min="0"
            max="100"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Run Count</label>
          <input
            type="number"
            value={formData.runCount}
            onChange={(e) => setFormData({...formData, runCount: parseInt(e.target.value) || 1})}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            min="0"
            placeholder="0 = infinite"
          />
        </div>
      </div>

      {(formData.scheduleType === 'delayed' || formData.scheduleType === 'recurring') && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
            <input
              type="datetime-local"
              value={formData.startTime}
              onChange={(e) => setFormData({...formData, startTime: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {formData.scheduleType === 'recurring' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Interval</label>
                <input
                  type="number"
                  value={formData.interval}
                  onChange={(e) => setFormData({...formData, interval: parseInt(e.target.value) || 1})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Units</label>
                <select
                  value={formData.intervalUnits}
                  onChange={(e) => setFormData({...formData, intervalUnits: e.target.value})}
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

      {formData.scheduleType === 'cron' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Cron Expression</label>
          <input
            type="text"
            value={formData.cronExpression || ''}
            onChange={(e) => setFormData({...formData, cronExpression: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
            placeholder="0 0 * * *"
          />
          <p className="text-xs text-gray-500 mt-1">
            Format: minute hour day month day-of-week (e.g., "0 2 * * *" for daily at 2 AM)
          </p>
        </div>
      )}

      {/* Configuration Section */}
      {selectedTemplate && selectedTemplate.configurationSchema && (
        <div className="border-t pt-4">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Job Configuration</h4>
          <div className="space-y-3">
            {Object.entries(selectedTemplate.configurationSchema).map(([key, config]) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {config.display || key}
                  {!config.allowNull && <span className="text-red-500 ml-1">*</span>}
                </label>
                {config.type === 'BOOLEAN' ? (
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.configuration[key] || config.defaultValue || false}
                      onChange={(e) => handleConfigChange(key, e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      {config.description || `Enable ${config.display || key}`}
                    </span>
                  </label>
                ) : config.type === 'INTEGER' ? (
                  <input
                    type="number"
                    value={formData.configuration[key] || config.defaultValue || ''}
                    onChange={(e) => handleConfigChange(key, parseInt(e.target.value) || null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={config.description}
                  />
                ) : config.type === 'TEXT' ? (
                  <textarea
                    value={formData.configuration[key] || config.defaultValue || ''}
                    onChange={(e) => handleConfigChange(key, e.target.value)}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={config.description}
                  />
                ) : (
                  <input
                    type="text"
                    value={formData.configuration[key] || config.defaultValue || ''}
                    onChange={(e) => handleConfigChange(key, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={config.description}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={formData.isActive}
            onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
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
          <Save className="w-4 h-4" />
          <span>Save Schedule</span>
        </button>
      </div>
    </form>
  );
};

// Execution Form Component
const ExecutionForm = ({ template, onSave }) => {
  const [formData, setFormData] = useState({
    priority: 0,
    configuration: {}
  });

  const handleConfigChange = (key, value) => {
    setFormData({
      ...formData,
      configuration: {
        ...formData.configuration,
        [key]: value
      }
    });
  };

  return (
    <form className="space-y-4">
      <div className="bg-blue-50 p-4 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">Running: {template?.name}</h4>
        <p className="text-sm text-blue-700">{template?.description}</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
        <input
          type="number"
          value={formData.priority}
          onChange={(e) => setFormData({...formData, priority: parseInt(e.target.value) || 0})}
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
          <h4 className="text-sm font-medium text-gray-900 mb-3">Job Configuration</h4>
          <div className="space-y-3">
            {Object.entries(template.configurationSchema).map(([key, config]) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {config.display || key}
                  {!config.allowNull && <span className="text-red-500 ml-1">*</span>}
                </label>
                {config.type === 'BOOLEAN' ? (
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.configuration[key] || config.defaultValue || false}
                      onChange={(e) => handleConfigChange(key, e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      {config.description || `Enable ${config.display || key}`}
                    </span>
                  </label>
                ) : config.type === 'INTEGER' ? (
                  <input
                    type="number"
                    value={formData.configuration[key] || config.defaultValue || ''}
                    onChange={(e) => handleConfigChange(key, parseInt(e.target.value) || null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={config.description}
                  />
                ) : config.type === 'TEXT' ? (
                  <textarea
                    value={formData.configuration[key] || config.defaultValue || ''}
                    onChange={(e) => handleConfigChange(key, e.target.value)}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={config.description}
                  />
                ) : (
                  <input
                    type="text"
                    value={formData.configuration[key] || config.defaultValue || ''}
                    onChange={(e) => handleConfigChange(key, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={config.description}
                  />
                )}
                {config.description && (
                  <p className="text-xs text-gray-500 mt-1">{config.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-yellow-50 p-4 rounded-lg">
        <div className="flex items-start">
          <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 mr-2" />
          <div>
            <h4 className="font-medium text-yellow-800">Immediate Execution</h4>
            <p className="text-sm text-yellow-700 mt-1">
              This job will be queued for immediate execution. A server will pick it up and run it as soon as possible.
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
};

// Execution Logs Viewer Component
const ExecutionLogsViewer = ({ execution, logs, onClose }) => {
  const [logLevel, setLogLevel] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  const executionLogs = logs.filter(log => log.executionId === execution.id);
  
  const filteredLogs = executionLogs.filter(log => {
    const matchesLevel = logLevel === 'all' || log.level === logLevel;
    const matchesSearch = !searchTerm || 
      log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      JSON.stringify(log.data || {}).toLowerCase().includes(searchTerm.toLowerCase());
    return matchesLevel && matchesSearch;
  });

  const getLevelIcon = (level) => {
    switch (level) {
      case 'error': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'warn': return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'info': return <CheckCircle className="w-4 h-4 text-blue-500" />;
      case 'debug': return <Settings className="w-4 h-4 text-gray-500" />;
      default: return <CheckCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getLevelColor = (level) => {
    switch (level) {
      case 'error': return 'bg-red-50 border-red-200';
      case 'warn': return 'bg-yellow-50 border-yellow-200';
      case 'info': return 'bg-blue-50 border-blue-200';
      case 'debug': return 'bg-gray-50 border-gray-200';
      default: return 'bg-gray-50 border-gray-200';
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
              Status: <span className="font-medium capitalize">{execution.status}</span>
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
                <span className="text-sm text-gray-600">{execution.progress}%</span>
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
              <div key={log.id || index} className={`p-3 ${getLevelColor(log.level)}`}>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    {getLevelIcon(log.level)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        log.level === 'error' ? 'bg-red-100 text-red-800' :
                        log.level === 'warn' ? 'bg-yellow-100 text-yellow-800' :
                        log.level === 'info' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {log.level.toUpperCase()}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatTimestamp(log.timestamp)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-900 font-medium">{log.message}</p>
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
};

export default JobManagementApp;