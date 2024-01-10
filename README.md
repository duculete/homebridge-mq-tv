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
   - **inputs**:list of a TV inputs (hdmi, netflix app, etc ...)    
   - **pinghost**: set props for checking if TV is ON via ping its ip address (if the configured ip responds to ping, the plugin will mark this TV accesory as Active (powerd on))

## Example config: 
```
{
            "platform": "MqttTelevision",
            "name": "TV",
            "mqtt": {
                "server": "1.1.1.2",
                "port": 1883
            },
            "pinghost": {
                "ip": "1.1.1.1",
                "interval": 3000
            },
            "setActive": "home/tv/cmd/power",
            "getActive": "home/tv/power",
            "setActiveInput": "home/tv/cmd/input",
            "getActiveInput": "home/tv/input",
            "setRemoteKey": "home/tv/cmd/remote",
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
                    "name": "Camera",
                    "value": "HDMI3"
                },
                {
                    "name": "News",
                    "value": "tv_news"
                },
                {
                    "name": "Comedy",
                    "value": "comedy"
                },
                {
                    "name": "BBC Earth",
                    "value": "bbcearth"
                }
            ]
        }
```