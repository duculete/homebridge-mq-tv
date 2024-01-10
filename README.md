# homebridge-mqtt-television

### ...the other end (aka TV controller)
You can use this plugin with ESP8266/ESP32 IR Blaster (link to be added).

## Required:    
   - **name**: "name of accesory"
   - **mqtt**: "details about mqtt broker"
   - **setActive**: this topic is used for tv "active" status (1 = on/ 0 = off)
   - **getActive**: on this topic, the espXX/tv should publish the status (1 = on/ 0 = off)
   - **setActiveInput**: the plugin is using this topic to ask ESPxx/TV to activate an INPUT (example hdmi1). "value" is published here
   - **getActiveInput**: the plugin gets the actual active input on TV from this topic; ESPxx/TV should publish here 
   - **setRemoteKey**: used for apple Remote in lockscreen - the plugin will send the key pressed (ex: INFO, SELECT, VOLUME_UP); ESPxx/TV should get the key name from this topic and "execute" the command.
## Optional:   
   inputs:[]    

## Example config: 
```
{
    "platform": "MqttTelevision",
    "name": "TV",
    "mqtt": {
        "server": "192.168.1.2",
        "port": 1883,
        "username:": "",
        "password"
    },
    "setActive": "home/living/tv/cmd/power",
    "getActive": "home/living/tv/power",
    "setActiveInput": "home/living/tv/cmd/input",
    "getActiveInput": "home/living/tv/input",
    "setRemoteKey": "home/living/tv/cmd/remote",
    "inputs": [
        {
            "name": "TV",
            "value": "TV"
        },
        {
            "name": "Media",
            "value": "HDMI1"
        },
        {
            "name": "NVR Camera",
            "value": "HDMI3"
        }
    ]
}
```