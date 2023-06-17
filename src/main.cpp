#include <Arduino.h>
#include <Arduino_JSON.h>
#include "WiFi.h"
#include "ESPAsyncWebServer.h"
#include <AsyncTCP.h>
#include "SPIFFS.h"
#include <Adafruit_Sensor.h>
#include <DHT.h>
#include "DHTesp.h"
#include <WebSocketsServer.h>


const char* ssid = "GLOBALINDO";  // Enter SSID here
const char* password = "2022sejahtera";  //Enter Password her
WebSocketsServer webSocket = WebSocketsServer(81);



#define DHTPIN 4     // Digital pin connected to the DHT sensor
#define DHTTYPE DHT22     // DHT 22 (AM2302)
#define POTPIN 34 ///potentiometer pin input


// initialize sensors
DHT dht(DHTPIN, DHTTYPE);
DHTesp dhtSensor;

String value;
unsigned long lastTime = 0;
unsigned long timerDelay = 100;


// Create AsyncWebServer object on port 80
AsyncWebServer server(80);
JSONVar readings;


void webSocketEvent(uint8_t num, WStype_t type, uint8_t * payload, size_t length) {

  switch(type) {

    //log socket disconnected
    case WStype_DISCONNECTED:
      Serial.printf("[%u] Disconnected!\n", num);
      break;

    //log socket connected
    case WStype_CONNECTED: {
        IPAddress ip = webSocket.remoteIP(num);
        Serial.printf("[%u] Connected from %d.%d.%d.%d url: %s\n", num, ip[0], ip[1], ip[2], ip[3], payload);
        webSocket.sendTXT(num, "0");
      }
      break;
  }

}


String getSensorReadings(){
  
  TempAndHumidity load = dhtSensor.getTempAndHumidity();
  readings["temperature"] = String(load.temperature);
  readings["humidity"] =  String(load.humidity);
  readings["potentiometer"] =  String(value);
  String jsonString = JSON.stringify(readings);
  return jsonString;
}


void initSPIFFS() {
  if (!SPIFFS.begin()) {
    Serial.println("An error has occurred while mounting SPIFFS");
  }
  Serial.println("SPIFFS mounted successfully");
}


void setup(){


  Serial.begin(115200);
  initSPIFFS();
  dht.begin();
  dhtSensor.setup(DHTPIN, DHTesp::DHT22);
  

  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.println("Connecting to WiFi..");
  }
  Serial.println(WiFi.localIP());


  webSocket.begin();
  webSocket.onEvent(webSocketEvent);


  // Route for root / web page
  server.on("/", HTTP_GET, [](AsyncWebServerRequest *request){
    request->send(SPIFFS, "/index.html", "text/html");
  });
  server.serveStatic("/", SPIFFS, "/");


  // server.on("/readings", HTTP_GET, [](AsyncWebServerRequest *request){
  //   String json = getSensorReadings();
  //   request->send(200, "application/json", json);
  //   json = String();
  // });

  // Start server
  server.begin();
}

String sentData;

void loop() {
  value = (String) analogRead(POTPIN);
  webSocket.loop();

  if ((millis() - lastTime) > timerDelay) {
    
    // Send Events to the client with the Sensor Readings Every 1/2 seconds
    sentData = getSensorReadings();
    webSocket.broadcastTXT(sentData);
    lastTime = millis();
  }
}