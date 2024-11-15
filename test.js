const Ina3221 = require('./ina3221');  // Assuming the class is saved in a file called 'ina3221.js'

// Initialize the INA3221 instance
const ina3221 = new Ina3221();


 const current = ina3221.getCurrent(2);
 
    console.log(`Current (Channel 1): ${current} mA`);
    
    /*
setInterval(() => {
    const busVoltage = ina3221.getBusVoltage(2);
    const shuntVoltage = ina3221.getShuntVoltage(2);
    const current = ina3221.getCurrent(2);

    console.log(`Bus Voltage (Channel 1): ${busVoltage} V`);
    console.log(`Shunt Voltage (Channel 1): ${shuntVoltage} mV`);
    console.log(`Current (Channel 1): ${current} mA`);
}, 1000);
*/
