import path from "path";

export { modelList, modelSeedOrder } from './models/index.js';
export * as routes from './routes/index.js';
export const jobs = [];
export const publicPath= path.join(import.meta.dirname,'public');
export const componentPath = path.join(import.meta.dirname,'components');
export async function dbInitFunction(carpenterServer){
    const modelMenuItem = carpenterServer.models.MenuItem;
    await modelMenuItem.ensureMenuPath('Dashboard', { icon_class: 'bi bi-speedometer2', nav_jsx: 'system/DashboardPanel.jsx', nav_jsx_parameters: {}, nav_jsx_asmodel: false });
//    await modelMenuItem.ensureMenuPath('Devices & Topology', { icon_class: 'bi bi-diagram-3' });
//    await modelMenuItem.ensureMenuPath('Devices & Topology\\All Devices', { icon_class: 'bi bi-pc', nav_jsx: 'DeviceList', nav_jsx_parameters: {"filter":"all"}, nav_jsx_asmodel: false } );
//    await modelMenuItem.ensureMenuPath('Devices & Topology\\Device Groups', { icon_class: 'bi bi-layers', nav_jsx: 'DeviceGroups', nav_jsx_parameters: {}, nav_jsx_asmodel: false } );
//    await modelMenuItem.ensureMenuPath('Devices & Topology\\Add Device', { icon_class: 'bi bi-plus-circle', nav_jsx: 'AddDeviceWizard', nav_jsx_parameters: {}, nav_jsx_asmodel: true });
//    await modelMenuItem.ensureMenuPath('Devices & Topology\\Topology Map', { icon_class: 'bi bi-diagram-3', nav_jsx: 'TopologyMap', nav_jsx_parameters: { "layout": "auto" }, nav_jsx_asmodel: false }  );
//    await modelMenuItem.ensureMenuPath('Devices & Topology\\Discovery Wizard', { icon_class: 'bi bi-geo-alt', nav_jsx: 'DiscoveryWizard', nav_jsx_parameters: { "method": "snmp" }, nav_jsx_asmodel: false } );
//    await modelMenuItem.ensureMenuPath('Devices & Topology\\Config Backups', { icon_class: 'bi bi-file-code', nav_jsx: 'ConfigBackups', nav_jsx_parameters: {}, nav_jsx_asmodel: false } );
  
//    await modelMenuItem.ensureMenuPath('Events & Logs', { icon_class: 'bi bi-clipboard-data' });
//    await modelMenuItem.ensureMenuPath('Events & Logs\\Syslog — Live', { icon_class: 'bi bi-terminal', nav_jsx: 'SyslogSearch', nav_jsx_parameters: { "defaults": { "timeRange": "last_1h" }, "runDefault": true, "autoRefresh": "5 min" }, nav_jsx_asmodel: false } );
//    await modelMenuItem.ensureMenuPath('Events & Logs\\Syslog — Search', { icon_class: 'bi bi-search"', nav_jsx: 'SyslogSearch', nav_jsx_parameters: { "defaults": { "timeRange": "last_24h", "facility": [], "severity": [] } }, nav_jsx_asmodel: false } );
//    await modelMenuItem.ensureMenuPath('Events & Logs\\SNMP Traps', { icon_class: 'bi bi-bell', nav_jsx: 'SnmpTrapViewer', nav_jsx_parameters: { "timeRange": "last_24h" }, nav_jsx_asmodel: false } );
//    await modelMenuItem.ensureMenuPath('Events & Logs\\Event Rules', { icon_class: 'bi bi-sliders', nav_jsx: 'EventRuleEditor', nav_jsx_parameters: {}, nav_jsx_asmodel: false } );
//    await modelMenuItem.ensureMenuPath('Events & Logs\\Log Archives', { icon_class: 'bi bi-archive', nav_jsx: 'LogArchives', nav_jsx_parameters: {}, nav_jsx_asmodel: false } );
    
//    await modelMenuItem.ensureMenuPath('Services', { icon_class: 'bi bi-server' });
//    await modelMenuItem.ensureMenuPath('Services\\DHCP Leases', { icon_class: 'bi bi-person-vcard', nav_jsx: 'DhcpLeases', nav_jsx_parameters: { "scope": "all" }, nav_jsx_asmodel: false } );
//    await modelMenuItem.ensureMenuPath('Services\\DHCP Scopes', { icon_class: 'bi bi-diagram-3', nav_jsx: 'DhcpScopes', nav_jsx_parameters: {}, nav_jsx_asmodel: false } );
//    await modelMenuItem.ensureMenuPath('Services\\DNS Zones', { icon_class: 'bi bi-globe', nav_jsx: 'DnsZones', nav_jsx_parameters: {}, nav_jsx_asmodel: false } );
//    await modelMenuItem.ensureMenuPath('Services\\DNS Records Search', { icon_class: 'bi bi-search', nav_jsx: 'DnsRecordSearch', nav_jsx_parameters: { "preset": "A,AAAA,CNAME,MX" }, nav_jsx_asmodel: false } );
    
//    await modelMenuItem.ensureMenuPath('Monitoring', { icon_class: 'bi bi-graph-up' });
//    await modelMenuItem.ensureMenuPath('Monitoring\\Pollers & Schedules', { icon_class: 'bi bi-clock', icon_text: null, nav_jsx: 'Pollers', nav_jsx_parameters: {}, nav_jsx_asmodal: false, nav_popup_link: '', nav_js_code: '' });
//    await modelMenuItem.ensureMenuPath('Monitoring\\Threshold Profiles', { icon_class: 'bi bi-bullseye', icon_text: null, nav_jsx: 'ThresholdProfiles', nav_jsx_parameters: {}, nav_jsx_asmodal: false, nav_popup_link: '', nav_js_code: '' });
//    await modelMenuItem.ensureMenuPath('Monitoring\\Alert Rules', { icon_class: 'bi bi-exclamation-triangle', icon_text: null, nav_jsx: 'AlertRules', nav_jsx_parameters: {}, nav_jsx_asmodal: false, nav_popup_link: '', nav_js_code: '' });
//    await modelMenuItem.ensureMenuPath('Monitoring\\Active Alerts', { icon_class: 'bi bi-bell', icon_text: null, nav_jsx: 'ActiveAlerts', nav_jsx_parameters: { severity: ['critical', 'warning'] }, nav_jsx_asmodal: false, nav_popup_link: '', nav_js_code: '' });
//    await modelMenuItem.ensureMenuPath('Monitoring\\Maintenance Windows', { icon_class: 'bi bi-tools', icon_text: null, nav_jsx: 'MaintenanceWindows', nav_jsx_parameters: {}, nav_jsx_asmodal: false, nav_popup_link: '', nav_js_code: '' });
    
//    await modelMenuItem.ensureMenuPath('Reports', { icon_class: 'bi bi-file' });
//    await modelMenuItem.ensureMenuPath('Reports\\Availability', { icon_class: 'bi bi-check-circle', icon_text: null, nav_jsx: 'ReportAvailability', nav_jsx_parameters: { period: 'last_30_days' }, nav_jsx_asmodal: false, nav_popup_link: '', nav_js_code: '' });
//    await modelMenuItem.ensureMenuPath('Reports\\Interface Utilization', { icon_class: 'bi bi-arrows-expand', icon_text: null, nav_jsx: 'ReportInterfaceUtilization', nav_jsx_parameters: { period: 'last_24h' }, nav_jsx_asmodal: false, nav_popup_link: '', nav_js_code: '' });
//    await modelMenuItem.ensureMenuPath('Reports\\Top Talkers', { icon_class: 'bi bi-bar-chart', icon_text: null, nav_jsx: 'ReportTopTalkers', nav_jsx_parameters: { period: 'last_24h' }, nav_jsx_asmodal: false, nav_popup_link: '', nav_js_code: '' });
//    await modelMenuItem.ensureMenuPath('Reports\\Inventory Summary', { icon_class: 'bi bi-list', icon_text: null, nav_jsx: 'ReportInventory', nav_jsx_parameters: {}, nav_jsx_asmodal: false, nav_popup_link: '', nav_js_code: '' });
    
//    await modelMenuItem.ensureMenuPath('Tools', { icon_class: 'bi bi-tools' });
//    await modelMenuItem.ensureMenuPath('Tools\\Ping', { icon_class: 'bi bi-activity', icon_text: null, nav_jsx: 'ToolPing', nav_jsx_parameters: {}, nav_jsx_asmodal: false, nav_popup_link: '', nav_js_code: '' });
//    await modelMenuItem.ensureMenuPath('Tools\\Traceroute', { icon_class: 'bi bi-signpost', icon_text: null, nav_jsx: 'ToolTraceroute', nav_jsx_parameters: {}, nav_jsx_asmodal: false, nav_popup_link: '', nav_js_code: '' });
//    await modelMenuItem.ensureMenuPath('Tools\\DNS Lookup', { icon_class: 'bi bi-search', icon_text: null, nav_jsx: 'ToolDnsLookup', nav_jsx_parameters: {}, nav_jsx_asmodal: false, nav_popup_link: '', nav_js_code: '' });
//    await modelMenuItem.ensureMenuPath('Tools\\SNMP Walk', { icon_class: 'bi bi-compass', icon_text: null, nav_jsx: 'ToolSnmpWalk', nav_jsx_parameters: {}, nav_jsx_asmodal: false, nav_popup_link: '', nav_js_code: '' });
//    await modelMenuItem.ensureMenuPath('Tools\\SNMP Get', { icon_class: 'bi bi-hand-index', icon_text: null, nav_jsx: 'ToolSnmpGet', nav_jsx_parameters: {}, nav_jsx_asmodal: false, nav_popup_link: '', nav_js_code: '' });
//    await modelMenuItem.ensureMenuPath('Tools\\MAC Vendor Lookup', { icon_class: 'bi bi-upc', icon_text: null, nav_jsx: 'ToolMacLookup', nav_jsx_parameters: {}, nav_jsx_asmodal: false, nav_popup_link: '', nav_js_code: '' });
    
    await modelMenuItem.ensureMenuPath('Administration', { icon_class: 'bi bi-gear' });
    await modelMenuItem.ensureMenuPath('Administration\\Users & Roles', { icon_class: 'bi bi-shield-lock', icon_text: null, nav_jsx: 'system/OrganizationManager.jsx', nav_jsx_parameters: {}, nav_jsx_asmodal: false, nav_popup_link: '', nav_js_code: '' });
//    await modelMenuItem.ensureMenuPath('Administration\\Credentials (SNMP/SSH)', { icon_class: 'bi bi-key', icon_text: null, nav_jsx: 'AdminCredentials', nav_jsx_parameters: {}, nav_jsx_asmodal: false, nav_popup_link: '', nav_js_code: '' });
//    await modelMenuItem.ensureMenuPath('Administration\\Notification Channels', { icon_class: 'bi bi-envelope', icon_text: null, nav_jsx: 'AdminNotifications', nav_jsx_parameters: {}, nav_jsx_asmodal: false, nav_popup_link: '', nav_js_code: '' });
//    await modelMenuItem.ensureMenuPath('Administration\\Integrations', { icon_class: 'bi bi-plug', icon_text: null, nav_jsx: 'AdminIntegrations', nav_jsx_parameters: { syslog: true, snmp: true, dhcp: true, dns: true }, nav_jsx_asmodal: false, nav_popup_link: '', nav_js_code: '' });
    await modelMenuItem.ensureMenuPath('Administration\\Job Manager', { icon_class: 'bi bi-clipboard-check', icon_text: null, nav_jsx: 'system/jobManagement/page.jsx', nav_jsx_parameters: {}, nav_jsx_asmodal: false, nav_popup_link: '', nav_js_code: '' });
    await modelMenuItem.ensureMenuPath('Administration\\System Settings', { icon_class: 'bi bi-gear', icon_text: null, nav_jsx: 'AdminSettings', nav_jsx_parameters: {}, nav_jsx_asmodal: false, nav_popup_link: '', nav_js_code: '' });
//    await modelMenuItem.ensureMenuPath('Administration\\Backup & Restore', { icon_class: 'bi bi-database', icon_text: null, nav_jsx: 'AdminBackupRestore', nav_jsx_parameters: {}, nav_jsx_asmodal: false, nav_popup_link: '', nav_js_code: '' });
    
//    await modelMenuItem.ensureMenuPath('Help & About', { icon_class: 'bi bi-question-circle' });
//    await modelMenuItem.ensureMenuPath('Help & About\\About', { icon_class: 'bi bi-info-circle', icon_text: null, nav_jsx: 'AboutDialog', nav_jsx_parameters: {}, nav_jsx_asmodal: true, nav_popup_link: '', nav_js_code: '' });
//    await modelMenuItem.ensureMenuPath('Help & About\\Documentation', { icon_class: 'bi bi-book', icon_text: null, nav_jsx: 'MenuLink', nav_jsx_parameters: {}, nav_jsx_asmodal: false, nav_popup_link: 'https://docs.example-nms.local', nav_js_code: '' });
//    await modelMenuItem.ensureMenuPath('Help & About\\Support', { icon_class: 'bi bi-life-preserver', icon_text: null, nav_jsx: 'SupportPanel', nav_jsx_parameters: {}, nav_jsx_asmodal: false, nav_popup_link: '', nav_js_code: '' });
}