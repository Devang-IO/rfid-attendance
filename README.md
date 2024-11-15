
# RFID-based Student Attendance System using ESP32 and Supabase

This project is an IoT-based student attendance system that uses RFID technology to automate attendance records. When an RFID tag is scanned, the system logs the attendance in real-time and stores the information in Supabase, a cloud database. This project provides an efficient alternative to traditional attendance methods, with real-time data access and secure storage.

## Table of Contents

- [Features](#features)
- [Components](#components)
- [Circuit Diagram](#circuit-diagram)
- [Working Principle](#working-principle)
- [Software Setup](#software-setup)
- [Supabase Setup](#supabase-setup)
- [Usage](#usage)
- [Future Improvements](#future-improvements)
- [License](#license)

---

## Features

- **Automated Attendance Logging**: Automatically records attendance when an RFID tag is scanned.
- **Cloud Database Integration**: Uses Supabase to store attendance records securely and retrieve them as needed.
- **Visual and Audio Feedback**: LED indicators and buzzer sounds provide instant feedback on successful attendance logging.
- **Real-Time Monitoring**: Immediate logging and storage of attendance data, accessible from any device connected to Supabase.

## Components

### Hardware
- **ESP32 Microcontroller**
- **MFRC522 RFID Reader**
- **RFID Tags**
- **LEDs**: For system and attendance indicators.
- **Buzzer**: Provides audio feedback upon successful attendance.
- **Jumper Wires and Breadboard**

### Software
- **Arduino IDE**: For coding and uploading firmware to ESP32.
- **Supabase**: As a cloud database solution.
- **NTP (Network Time Protocol)**: For accurate timestamping.

## Circuit Diagram

![image](https://github.com/user-attachments/assets/6fe4ac5c-a289-440c-aa5d-990a3f97f3c4)


## Working Principle

1. **System Initialization**: The ESP32 initializes the RFID reader, connects to Wi-Fi, and sets up time using NTP.
2. **Scanning the Tag**: When an RFID tag is brought near the reader, its unique ID is read by the MFRC522 module.
3. **Data Processing and Logging**:
   - The ESP32 sends the tag ID and timestamp to Supabase via an HTTP POST request.
   - The Supabase database stores the record with a status indicating "present".
4. **Feedback**: The LED and buzzer provide feedback on successful attendance logging.

## Software Setup

1. **Arduino IDE**: Download and install the Arduino IDE, and add the ESP32 board via the Arduino Board Manager.
2. **Install Required Libraries**:
   - `MFRC522` for RFID communication.
   - `WiFi` for ESP32 internet connection.
   - `ArduinoJson` for JSON data processing.
3. **Configure the Code**:
   - Update the Wi-Fi credentials (`ssid` and `password`).
   - Enter your Supabase API URL and Key.
4. **Upload the Code**: Connect the ESP32 to your computer and upload the code.

## Supabase Setup

1. **Create a Supabase Account**: Sign up at [Supabase](https://supabase.io/).
2. **Create a New Project**:
   - Set up a new table named `attendance` with columns for `tag_id`, `timestamp`, and `status`.
3. **Get the API URL and Key**:
   - Retrieve the Supabase project URL and API key from the dashboard and update them in the code.

## Usage

1. **Power on the System**: Turn on the ESP32 to initialize the RFID reader and connect to Wi-Fi.
2. **Scan an RFID Tag**: Place an RFID tag near the MFRC522 reader. The system will:
   - Light up the `ledPresent` LED.
   - Play a tone sequence on the buzzer.
   - Send the tag ID and timestamp to Supabase.
3. **Check Supabase**: Log into your Supabase account to view the attendance data stored in real-time.

## Code Overview

```cpp
#include <SPI.h>
#include <MFRC522.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <time.h>

#define SS_PIN 21
#define RST_PIN 22
MFRC522 rfid(SS_PIN, RST_PIN);

const int ledPresent = 25; // LED to indicate attendance
const int ledRunning = 26; // LED to indicate system is running
const int buzzerPin = 27; // Buzzer pin

const char * ssid = "home"; //change with your ssid
const char * password = "12345678"; //your password

const char * supabaseUrl = "YOUR_SUPABASE_URL";
const char * supabaseKey = "YOUR_SUPABSSE_KEY";

const char * ntpServer = "pool.ntp.org";
const long gmtOffset_sec = 0;
const int daylightOffset_sec = 3600;

void setup() {
  Serial.begin(115200);
  while (!Serial); // Wait for serial port to connect

  SPI.begin();
  rfid.PCD_Init();

  pinMode(ledPresent, OUTPUT);
  pinMode(ledRunning, OUTPUT);
  pinMode(buzzerPin, OUTPUT);

  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.println("Connecting to WiFi...");
  }
  Serial.println("Connected to WiFi");

  // Init and get the time
  configTime(gmtOffset_sec, daylightOffset_sec, ntpServer);

  Serial.println("RFID Attendance System");
  Serial.println("Scan RFID tag to record attendance");

  // Test RFID reader
  byte v = rfid.PCD_ReadRegister(MFRC522::VersionReg);
  Serial.print("MFRC522 Software Version: 0x");
  Serial.print(v, HEX);
  if (v == 0x91)
    Serial.print(" = v1.0");
  else if (v == 0x92)
    Serial.print(" = v2.0");
  else
    Serial.print(" (unknown)");
  Serial.println("");

  // Dump MFRC522 card data
  rfid.PCD_DumpVersionToSerial();

  // Blink the running LED to indicate the system is operational
  blinkRunningLED();
}

void loop() {
  // Reset the loop if no new card present on the sensor/reader.
  if (!rfid.PICC_IsNewCardPresent()) {
    delay(50);
    return;
  }

  // Select one of the cards
  if (!rfid.PICC_ReadCardSerial()) {
    delay(50);
    return;
  }

  Serial.println("Card detected!");

  String tagID = "";
  for (byte i = 0; i < rfid.uid.size; i++) {
    tagID += (rfid.uid.uidByte[i] < 0x10 ? "0" : "");
    tagID += String(rfid.uid.uidByte[i], HEX);
  }
  tagID.toUpperCase();

  Serial.println("RFID Tag scanned: " + tagID);

  // Turn on attendance LED and buzzer
  digitalWrite(ledPresent, HIGH);
  tone(buzzerPin, 1000); // Play a tone on the buzzer
  delay(1000); // Keep them on for 1 second
  digitalWrite(ledPresent, LOW);
  noTone(buzzerPin); // Turn off the buzzer

  bool attendanceSuccess = sendAttendanceToSupabase(tagID);

  if (attendanceSuccess) {
    Serial.println("Attendance recorded successfully");
  } else {
    Serial.println("Failed to record attendance");
  }

  rfid.PICC_HaltA();
  rfid.PCD_StopCrypto1();

  // Start blinking the running LED again
  blinkRunningLED();

  delay(1000); // Add a delay to prevent multiple reads of the same card
}

void blinkRunningLED() {
  for (int i = 0; i < 5; i++) {
    digitalWrite(ledRunning, HIGH);
    delay(500);
    digitalWrite(ledRunning, LOW);
    delay(500);
  }
}

String getISOTimestamp() {
  struct tm timeinfo;
  if (!getLocalTime( & timeinfo)) {
    Serial.println("Failed to obtain time");
    return "";
  }
  char timeStringBuff[30];
  strftime(timeStringBuff, sizeof(timeStringBuff), "%Y-%m-%dT%H:%M:%S", & timeinfo);
  return String(timeStringBuff);
}

bool sendAttendanceToSupabase(String tagID) {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    String url = String(supabaseUrl) + "/rest/v1/attendance";
    http.begin(url);
    http.addHeader("Content-Type", "application/json");
    http.addHeader("apikey", supabaseKey);
    http.addHeader("Authorization", "Bearer " + String(supabaseKey));
    http.addHeader("Prefer", "return=minimal");

    DynamicJsonDocument doc(200);
    doc["tag_id"] = tagID;
    doc["timestamp"] = getISOTimestamp();
    doc["status"] = "present";

    String payload;
    serializeJson(doc, payload);

    Serial.println("Sending payload: " + payload);

    int httpResponseCode = http.POST(payload);

    if (httpResponseCode > 0) {
      String response = http.getString();
      Serial.println("HTTP Response code: " + String(httpResponseCode));
      Serial.println(response);
      http.end();
      return httpResponseCode == 201;
    } else {
      Serial.print("Error on sending POST: ");
      Serial.println(httpResponseCode);
      http.end();
      return false;
    }
  } else {
    Serial.println("Error in WiFi connection");
    return false;
  }
}
```
## Future Improvements

-   **Add Mobile App Integration**: Enable teachers or administrators to access attendance data via a mobile app.
-   **Enhanced Security**: Use HTTPS with SSL for secure data transmission.
-   **SMS/Email Notifications**: Send automatic notifications to parents or guardians.
-   **Battery Power**: Make the system portable by adding a rechargeable battery.

## License

This project is licensed under the [MIT LICENSE](./LICENSE).
