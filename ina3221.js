'use strict';
const i2c = require('i2c-bus');  // I2C communication library

// I2C Constants
const INA3221_ADDRESS = 0x40;  // Default I2C address for INA3221
const INA3221_REG_CONFIG = 0x00;
const INA3221_REG_SHUNTVOLTAGE_1 = 0x01;
const INA3221_REG_BUSVOLTAGE_1 = 0x02;

// Configuration constants for INA3221
const INA3221_CONFIG_RESET = 0x8000;
const INA3221_CONFIG_ENABLE_CHAN1 = 0x4000;
const INA3221_CONFIG_ENABLE_CHAN2 = 0x2000;
const INA3221_CONFIG_ENABLE_CHAN3 = 0x1000;
const INA3221_CONFIG_AVG1 = 0x0400;
const INA3221_CONFIG_VBUS_CT2 = 0x0100;
const INA3221_CONFIG_VSH_CT2 = 0x0020;
const INA3221_CONFIG_MODE_2 = 0x0004;
const INA3221_CONFIG_MODE_1 = 0x0002;
const INA3221_CONFIG_MODE_0 = 0x0001;

// Shunt resistor value (in ohms)
const SHUNT_RESISTOR_VALUE = 100;

class INA3221 {

    constructor(address = INA3221_ADDRESS, busNumber = 1) {
        this.address = address;
        this.bus = i2c.openSync(busNumber);
        this.init();
    }

    init() {
        // Combine the config bits as per the datasheet
        const config = INA3221_CONFIG_ENABLE_CHAN1 |
            INA3221_CONFIG_ENABLE_CHAN2 |
            INA3221_CONFIG_ENABLE_CHAN3 |
            INA3221_CONFIG_AVG1 |
            INA3221_CONFIG_VBUS_CT2 |
            INA3221_CONFIG_VSH_CT2 |
            INA3221_CONFIG_MODE_2 |
            INA3221_CONFIG_MODE_1 |
            INA3221_CONFIG_MODE_0;

        // Write the config register to initialize the INA3221
        this.writeRegister(INA3221_REG_CONFIG, config);
    }

    // Write 16-bit data to a register (little endian format)
    writeRegister(register, data) {
        // Mask to ensure the data is 16-bit
        data = data & 0xFFFF;

        // Convert to little-endian byte order
        const lowByte = (data >> 8) & 0xFF;
        const highByte = data & 0xFF;

        const buffer = Buffer.from([lowByte, highByte]);
        this.bus.writeI2cBlockSync(this.address, register, buffer.length, buffer);
    }

    // Read 16-bit register (handle little endian byte order)
    readRegister(register) {
	let result = this.bus.readWordSync(this.address, register) & 0xFFFF
	let lowbyte = (result & 0xFF00)>>8 
        let highbyte = (result & 0x00FF) << 8
	
	//console.log("lowbyte "+lowbyte);
	//console.log("highbyte "+ highbyte);
	let value = lowbyte + highbyte 
        // Convert the two bytes from little endian to the correct value
	
	
        if (value > 32767) {
            return value - 65536; // Convert to signed 16-bit value
        }
        return value;
    }

    // Get the raw bus voltage from a given channel
    getBusVoltageRaw(channel) {
        const register = INA3221_REG_BUSVOLTAGE_1 + (channel - 1) * 2;
        let value =  this.readRegister(register);
	if (value > 32767) {
            return value - 65536; // Convert to signed 16-bit value
        }
        return value;
    }

    // Get the raw shunt voltage from a given channel
    getShuntVoltageRaw(channel) {
        const register = INA3221_REG_SHUNTVOLTAGE_1 + (channel - 1) * 2;
        let value =  this.readRegister(register);
	if (value > 32767) {
            return value - 65536; // Convert to signed 16-bit value
        }
        return value;
    }

    // Convert raw bus voltage to volts (scale factor: 0.001)
    getBusVoltage(channel) {
        const rawVoltage = this.getBusVoltageRaw(channel);
        return rawVoltage * 0.001;
    }

    // Convert raw shunt voltage to millivolts (scale factor: 5mV per bit)
    getShuntVoltage(channel) {
        const rawVoltage = this.getShuntVoltageRaw(channel);
	
        return rawVoltage * 0.005;  // Each raw step is 5mV
    }

    // Calculate the current in milliamps using the shunt resistor value
    getCurrent(channel) {
        const shuntVoltage = this.getShuntVoltage(channel);
        const current = shuntVoltage / SHUNT_RESISTOR_VALUE;  // Current in amps
        return current * 1000;  
    }
}


module.exports = INA3221
