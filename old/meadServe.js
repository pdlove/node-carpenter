const { hotspring_Initalization, HotspringModel } = require('hotspring-framework');
const fs = require('fs').promises;
const path = require('path');

const os = require('os'); // Used to populate the information of this host.

async function startProgram() {
    let config = null;
    //Load the config File
    try {
        // Check if the file exists
        await fs.access(path.join(__dirname, "config.json"));

        // Read and parse the JSON file
        const data = await fs.readFile(path.join(__dirname, "config.json"), 'utf-8');
        config = JSON.parse(data);


    } catch (error) {
        if (error.code === 'ENOENT') {
            console.log('Config file not found, using default configuration');
        } else {
            console.error('Error reading or parsing the config file:', error);
        }
    }

    if (!config) config={};
    if (!config.appRoot) config.appRoot = __dirname;
    await hotspring_Initalization(config, true);

    await InitializeMEADCoordinatorObject();


    let jobClass =  global.hotspring.stacks['syslog'].jobClasses['SyslogCollector']
    let newJob = new jobClass();
    newJob.runJob();
}
startProgram().then(() => {
    console.log('Program Started');
}).catch((err) => {
    console.error('Error starting program:', err);
});


async function InitializeMEADCoordinatorObject() {
    const interfaces = os.networkInterfaces();
    const results = [];

    let deviceModel =  global.hotspring.stacks['network'].models['device'];
    let baseIPv4 = '';
    let baseIPv6 = '';
    let baseMAC = '';
    let deviceName = '';
    let interfaceList = [];

    for (const [name, iface] of Object.entries(interfaces)) {
        for (const details of iface) {
            if (!details.internal) { // Exclude internal (loopback) interfaces
                results.push({
                    interface: name,
                    mac: details.mac,
                    ip: details.address,
                    family: details.family
                });
            }
        }
    }

    // Find the first value with a family of IPv4
    const firstIPv6 = results.find(result => result.family === 'IPv6');
    if (firstIPv6) {
        baseIPv6 = firstIPv6.ip;
        baseMAC = firstIPv6.mac;
    }
    const firstIPv4 = results.find(result => result.family === 'IPv4');
    if (firstIPv4) {
        baseIPv4 = firstIPv4.ip;
        baseMAC = firstIPv4.mac;
    }

    deviceName = os.hostname();
    
    interfaceList = results;
    let coordinatorHost = null;
    if (baseIPv4&&!coordinatorHost)
        coordinatorHost = await deviceModel.findHostByAddress(baseIPv4, "IPv4");
    if (baseIPv6&&!coordinatorHost)
        coordinatorHost = await deviceModel.findHostByAddress(baseIPv6, "IPv6");
    if (baseMAC&&!coordinatorHost)
        coordinatorHost = await deviceModel.findHostByAddress(baseMAC, "MAC");
    
    
    //If coordinatorHost is null, create an entry for it.
    if (!coordinatorHost)
        coordinatorHost = await deviceModel.createHost({deviceName, baseIPv4, baseIPv6, baseMAC, interfaces: results})
    global.hotspring.coordinatorHost=coordinatorHost;
}

    // interfaceID: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    // deviceID: { type: DataTypes.INTEGER, required: true },
    // vlanID: { type: DataTypes.INTEGER, required: true },
    // interfaceType
    // networkID: { type: DataTypes.INTEGER, required: true },
    // IPv4Address: { type: DataTypes.INET, required: false, defaultValue: null }, //This represents the default address to use.
    // IPv4Subnet: { type: DataTypes.INET, required: false, defaultValue: null }, //This represents the default address to use.
    // IPv6Address: { type: DataTypes.INET, required: false, defaultValue: null }, //This represents the default address to use.
    // IPv6Subnet: { type: DataTypes.INET, required: false, defaultValue: null }, //This represents the default address to use.
    // MACAddress: { type: DataTypes.STRING(255), required: false, defaultValue: null }, //This represents the default address to use.
    // LastDetected: { type: DataTypes.DATE, defaultValue: null }