// user variables
const device = "/dev/ttyUSB0";
const mqtt_host = "orangepi";
const mqtt_port = 1883;
const mqtt_topic = "rf433";

//
const SerialPort = require('serialport');
const Readline = SerialPort.parsers.Readline;
const Sleep = require('sleep');
const Controller = require('./rfcontroljs/lib/controller');
const Mqtt = require('mqtt');

const port = new SerialPort(device, {
  baudRate: 115200
});

const parser = port.pipe(new Readline({ delimiter: '\r\n' }));
const mqttc = Mqtt.connect('mqtt://' + mqtt_host)

// serial port open handler
port.on('open', function () {
  Sleep.sleep(2);
  port.write('RF receive 0\r\n');
  port.drain();
});

// serial port incoming data handler
parser.on('data', function (data) {
  var str = data.toString();
  var pulses, jsdata;

  if ((pos = str.indexOf('RF receive')) == 0) {

    payload = str.substr(11);

    pulses = Controller.prepareCompressedPulses(payload);
    Controller.fixPulses(pulses.pulseLengths, pulses.pulses);

    jsdata = Controller.decodePulses(pulses.pulseLengths, pulses.pulses);

    //for(i in jsdata) {

      //if (jsdata[i].protocol == "weather13") {

        //console.log(jsdata[i]);
        //mqttc.publish(mqtt_topic + '/' + jsdata[i].values.channel, JSON.stringify(jsdata[i]));
      //}
    //}

    console.log('Data:', str);
    console.log('Payload:', payload);
    console.log('JSON:', jsdata);
  }
});

mqttc.on('connect', function () {
  mqttc.publish('presence', 'Hello mqtt')
})
