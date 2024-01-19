const mqtt = require("mqtt");
const ping = require("ping");

const PLUGIN_NAME = 'homebridge-mq-tv';
const PLATFORM_NAME = 'MqttTelevision';

module.exports = (api) => {
    api.registerPlatform(PLATFORM_NAME, TVPlatform);
}

class TVPlatform {

    constructor(log, config, api) {
        this.log = log;
        this.config = config;
        this.api = api;

        this.Service = api.hap.Service;
        this.Characteristic = api.hap.Characteristic;

        // get the name
        const tvName = this.config.name || 'MQTT TV';

        // get mqtt details
        var mqttCfg = config["mqtt"];
        var mqttHost = "mqtt://" + (mqttCfg && mqttCfg['server'] || "127.0.0.1") + ":" + (mqttCfg && mqttCfg['port'] || "1883");
        var mqttUsername = mqttCfg && mqttCfg['username'] || "";
        var mqttPassword = mqttCfg && mqttCfg['password'] || "";
        const inputList = this.config.inputs || [];
        this.pinghost = config.pinghost;

        var mqttOptions = {
            clientId: 'mqtt_tv_' + Math.random().toString(16).substring(2, 8),
            username: mqttUsername,
            password: mqttPassword
        };

        const setActiveTopic = this.config.setActive || "";
        const getActiveTopic = this.config.getActive || "";
        const setActiveInputTopic = this.config.setActiveInput || "";
        const getActiveInputTopic = this.config.getActiveInput || "";
        const setRemoteKeyTopic = this.config.setRemoteKey || "";

        // generate a UUID
        const uuid = this.api.hap.uuid.generate('homebridge:mq-tv-' + tvName);

        // create the accessory
        this.tvAccessory = new api.platformAccessory(tvName, uuid);

        // set the accessory category
        this.tvAccessory.category = this.api.hap.Categories.TELEVISION;

        // add the tv service
        const tvService = this.tvAccessory.addService(this.Service.Television);

        // set the tv name
        tvService.setCharacteristic(this.Characteristic.ConfiguredName, tvName);

        tvService.setCharacteristic(this.Characteristic.ActiveIdentifier, 1);

        // set sleep discovery characteristic
        tvService.setCharacteristic(this.Characteristic.SleepDiscoveryMode, this.Characteristic.SleepDiscoveryMode.ALWAYS_DISCOVERABLE);
        var power = tvService
            .getCharacteristic(Characteristic.Active);
        try {
            this.mqttClient = mqtt.connect(mqttHost, mqttOptions);
            this.mqttClient.publish(getActiveInputTopic, "");
            if (this.pinghost) {
                setInterval(() => {
                    ping.promise.probe(this.pinghost.ip)
                        .then(function (res, err) {
                            var ping_resp = 0;
                            if (res.alive) {
                                ping_resp = 1;
                            }
                            console.log("Ping status " + ping_resp);
                            power.updateValue(this.ping_resp);
                        });
                }, this.pinghost.interval || 30000);
            } else {
                this.mqttClient.subscribe(getActiveTopic);
            }
        } catch (e) {
            this.log.error('Error connecting to MQTT/ping:' + e.toString());
        };

        this.mqttClient.on('message', (topic, message) => {

            if (topic == getActiveTopic) {
                var msg = parseInt(message.toString());
                tvService.updateCharacteristic(this.Characteristic.Active, msg);
            }

            if (topic == getActiveInputTopic) {
                var activeInput = message.toString();
                if (activeInput != "") {
                    for (var i = 0; i < inputList.length; i++) {
                        if (inputList[i]['value'] == activeInput) {
                            tvService.getCharacteristic(this.Characteristic.ActiveIdentifier).updateValue(i + 1);
                            break;
                        }
                    }
                } else {
                    var val_index = tvService.getCharacteristic(this.Characteristic.ActiveIdentifier).value;
                    this.mqttClient.publish(getActiveInputTopic, inputList[val_index - 1]['value']);
                }
            }

        });


        // handle on / off events using the Active(POWER) characteristic
        tvService.getCharacteristic(this.Characteristic.Active)
            .onSet((newValue) => {
                if (newValue != tvService.getCharacteristic(this.Characteristic.Active.value)) {
                    this.mqttClient.publish(setActiveTopic, newValue.toString());
                }
            });

        // handle input source changes
        tvService.getCharacteristic(this.Characteristic.ActiveIdentifier)
            .onSet((newValue) => {
                this.mqttClient.publish(setActiveInputTopic, inputList[newValue - 1]['value']);
            });

        // handle remote control input
        tvService.getCharacteristic(this.Characteristic.RemoteKey)
            .onSet((newValue) => {
                switch (newValue) {
                    case this.Characteristic.RemoteKey.REWIND: {
                        this.mqttClient.publish(setRemoteKeyTopic, 'REWIND');
                        break;
                    }
                    case this.Characteristic.RemoteKey.FAST_FORWARD: {
                        this.mqttClient.publish(setRemoteKeyTopic, 'FORWARD');
                        break;
                    }
                    case this.Characteristic.RemoteKey.NEXT_TRACK: {
                        this.mqttClient.publish(setRemoteKeyTopic, 'NEXT_TRACK');
                        break;
                    }
                    case this.Characteristic.RemoteKey.PREVIOUS_TRACK: {
                        this.mqttClient.publish(setRemoteKeyTopic, 'PREVIOUS_TRACK');
                        break;
                    }
                    case this.Characteristic.RemoteKey.ARROW_UP: {
                        this.mqttClient.publish(setRemoteKeyTopic, 'UP');
                        break;
                    }
                    case this.Characteristic.RemoteKey.ARROW_DOWN: {
                        this.mqttClient.publish(setRemoteKeyTopic, 'DOWN');
                        break;
                    }
                    case this.Characteristic.RemoteKey.ARROW_LEFT: {
                        this.mqttClient.publish(setRemoteKeyTopic, 'LEFT');
                        break;
                    }
                    case this.Characteristic.RemoteKey.ARROW_RIGHT: {
                        this.mqttClient.publish(setRemoteKeyTopic, 'RIGHT');
                        break;
                    }
                    case this.Characteristic.RemoteKey.SELECT: {
                        this.mqttClient.publish(setRemoteKeyTopic, 'SELECT');
                        break;
                    }
                    case this.Characteristic.RemoteKey.BACK: {
                        this.mqttClient.publish(setRemoteKeyTopic, 'BACK');
                        break;
                    }
                    case this.Characteristic.RemoteKey.EXIT: {
                        this.mqttClient.publish(setRemoteKeyTopic, 'EXIT');
                        break;
                    }
                    case this.Characteristic.RemoteKey.PLAY_PAUSE: {
                        this.mqttClient.publish(setRemoteKeyTopic, 'KEY_PLAY_PAUSE');
                        break;
                    }
                    case this.Characteristic.RemoteKey.INFORMATION: {
                        this.mqttClient.publish(setRemoteKeyTopic, 'INFO');
                        break;
                    }
                }
            });

        /**
         * Create a speaker service to allow volume control
         */

        const speakerService = this.tvAccessory.addService(this.Service.TelevisionSpeaker);

        speakerService
            .setCharacteristic(this.Characteristic.Active, this.Characteristic.Active.ACTIVE)
            .setCharacteristic(this.Characteristic.VolumeControlType, this.Characteristic.VolumeControlType.ABSOLUTE);

        // handle volume control
        speakerService.getCharacteristic(this.Characteristic.VolumeSelector)
            .onSet((newValue) => {
                var val = "VOLUME_UP";
                if (newValue == 1) {
                    val = "VOLUME_DOWN";
                }
                this.mqttClient.publish(setRemoteKeyTopic, val);
            });

        // handle mute
        speakerService.getCharacteristic(this.Characteristic.Mute)
            .onSet((newValue) => {
                var val = "MUTE";
                this.mqttClient.publish(setRemoteKeyTopic, val);
            });

        /**
         * Create TV Input Source Services
         * These are the inputs the user can select from.
         * When a user selected an input the corresponding Identifier Characteristic
         * is sent to the TV Service ActiveIdentifier Characteristic handler.
         */


        const activeServices = {};

        for (var i = 0; i < inputList.length; i++) {

            var val = inputList[i]['value'].toString();
            activeServices[val] = this.tvAccessory.addService(this.Service.InputSource, inputList[i]['value'].toString(), inputList[i]['name'].toString());
            activeServices[val]
                .setCharacteristic(this.Characteristic.Identifier, i + 1)
                .setCharacteristic(this.Characteristic.ConfiguredName, inputList[i]['name'].toString())
                .setCharacteristic(this.Characteristic.IsConfigured, this.Characteristic.IsConfigured.CONFIGURED)
                .setCharacteristic(this.Characteristic.InputSourceType, this.Characteristic.InputSourceType.HDMI);
            tvService.addLinkedService(activeServices[val]);
        }

        /**
        * Publish as external accessory
        * Only one TV can exist per bridge, to bypass this limitation, you should
        * publish your TV as an external accessory.
        */

        this.api.publishExternalAccessories(PLUGIN_NAME, [this.tvAccessory]);
    }
}
