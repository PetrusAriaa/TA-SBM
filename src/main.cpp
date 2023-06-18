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
#include <PubSubClient.h>


const char* ssid = "GLOBALINDO";  // Enter SSID here
const char* password = "2022sejahtera";  //Enter Password her
WebSocketsServer webSocket = WebSocketsServer(81);


const char* mqtt_server = "192.168.1.27"; //ganti pakai ip address masing-masing 192.168.4.113

#define DHTPIN 4          // Digital pin connected to the DHT sensor
#define DHTTYPE DHT22     // DHT 22 (AM2302)
#define POTPIN 34         // potentiometer pin input
const int buttonPin1 = 33;
const int buttonPin2 = 22;
int buttonState1 = 0;
int buttonState2 = 0;
int tilt = 0;

float velocity = 0;
int prev_value = 0;

// initialize sensors
DHT dht(DHTPIN, DHTTYPE);
DHTesp dhtSensor;

int value;
unsigned long lastTime = 0;
unsigned long timerDelay = 250;


// Create AsyncWebServer object on port 80
AsyncWebServer server(80);
JSONVar readings;

WiFiClient espClient;
PubSubClient client(espClient);


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
  readings["tilt"] = String(tilt);
  readings["velocity"] = String(velocity);

  char tempString[8];
  char humString[8];
  char valueString[8];
  char tiltString[8];
  char veloString[8];

  dtostrf(load.temperature, 1, 2, tempString);
  dtostrf(load.humidity, 1, 2, humString);
  // value.toCharArray(valueString, 8);
  itoa(value, valueString, 10);
  itoa(tilt, tiltString, 10);
  dtostrf(velocity, 1, 2, veloString);

  client.publish("esp32/temperature", tempString);
  client.publish("esp32/humidity", humString);
  client.publish("esp32/potentiometer", valueString);
  client.publish("esp32/button", tiltString);
  client.publish("esp32/velocity", veloString);
  
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
  
  pinMode(buttonPin1, INPUT_PULLUP);
  pinMode(buttonPin2, INPUT_PULLUP);

  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.println("Connecting to WiFi..");
  }
  Serial.println(WiFi.localIP());

  client.setServer(mqtt_server, 1883);
  // client.setCallback(callback);

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


void reconnect() {
  // Loop until we're reconnected
  while (!client.connected()) {
    Serial.print("Attempting MQTT connection...");
    // Attempt to connect
    if (client.connect("ESP8266Client")) {
      Serial.println("connected");
      // Subscribe
      // client.subscribe("esp32/output");
    } else {
      Serial.print("failed, rc=");
      Serial.print(client.state());
      Serial.println(" try again in 5 seconds");
      // Wait 5 seconds before retrying
      delay(5000);
    }
  }
}

String sentData;

void loop() {
  if (!client.connected()) {
    reconnect();
  }
  client.loop();

  value = analogRead(POTPIN);
  webSocket.loop();

  if ((millis() - lastTime) > timerDelay) {
    
    buttonState1 = digitalRead(buttonPin1);
    buttonState2 = digitalRead(buttonPin2);

    if (buttonState1 == LOW) {
      tilt++;
    } else if (buttonState2 == LOW) {
      tilt--;
    }

    if (tilt == 360) {
      tilt = 0;
    } else if (tilt == -1) {
      tilt = 359;
    }

    // taking velocity
    velocity = (value-prev_value)/(((float)timerDelay)/1000);
    
    // Send Events to the client with the Sensor Readings Every 1/2 seconds
    sentData = getSensorReadings();
    webSocket.broadcastTXT(sentData);

    prev_value = value;
    lastTime = millis();
    
  }
}