## MobileDash2023 | SP 2024

Authors: Aditya Kakade, Katherine Chang Wu, Daniel Sorokin, Julia Lau

# Summary
System Description 
The Mobile Dashboard is a mobile application that displays relevant information on CEV's electric vehicle. This dashboard is used by the driver and team members during competition to view data about the vehicle's current performance. The purpose of the Mobile Dashboard is to clearly visualize the various details of the car in a user-intuitive format for the driver. This dashboard also sends the collected data of the car's metrics to the Living Timing and Historical Dashboards to be further analyzed and improve future car performance.

The information displayed on the Mobile Dashboard is broken down into three sections. 

The left-most widget displays the car's current speed in miles per hour. The number will reflect any changes as the car speeds or slows down. It also contains a stopwatch with lap timing capabilities. To initiate the stopwatch, the user will press the right 'Start/Stop!' button, and to mark the completion of a lap, they will press the left 'Lap' button. On the completion of the race, when the 'Reset' button is pressed, the clock is reset, and the lap data will be sent to the Live Timing Dashboard.

The widget in the center displays various metrics relating to the car. The top widget in this column shows the vehicle's temperature in Celsius. The next widget down displays the car's battery power as a percentage. The last widget indicates the current status of the connection from the Mobile Dashboard to the DAQ. To initiate a connection with DAQ, the user must press this DAQ button. 

Finally, the right-most widget shows a map of the racetrack that tracks the car's position throughout the race.

The frontend of the Mobile Dashboard was implemented using React Native (with a focus on Android usage), which combines the use of JSX, HTML, Javascript, and CSS. 

<div align="center">
  <img width="921" alt="Screen Shot 2024-05-04 at 11 36 45 AM" src="https://github.com/user-attachments/assets/2e5c9c01-a4cd-4693-b0d4-34b5ffdff738">
</div>

Terminology
DAQ (Data Acquisition): Handles the communication of data from electrical systems and sensors to the driver and team.

Server: A program/script constantly running on the internet, listening to user requests, and taking relevant actions.

Client: Term from the client-server architecture model. A client requests service from the server after establishing a connection with it. Client devices include computers, mobile phones, tablets, etc.

Database: A reliable place to store persistent data. Akin to a big Excel spreadsheet.

HTML: Hypertext Markup Language - the language used to create webpages.

CSS: Cascading Style Sheets - used to format the layout of webpages.

React: a JavaScript library for building user interfaces.

JSX: a syntax extension of regular JavaScript used to write HTML code in JavaScript. It is often used to create React elements instead of HTML.

Component: A React feature similar to JavaScript functions that allow the user to split the UI into independent, reusable pieces. Each piece in isolation accepts arbitrary inputs (called “props”) and returns React elements describing what should appear on the screen.

# How To Use
To clone this repo, please refer to this link: https://docs.github.com/en/repositories/creating-and-managing-repositories/cloning-a-repository. 

Once the repo is cloned, please ensure that you have the proper libraries and frameworks installed for React Native. Please refer to this documentation for the proper installation instructions: https://reactnative.dev/docs/environment-setup?guide=native&platform=android. 

Finally, to run the dashboard on your local device, navigate to the root directory of the repo in a terminal window. Please run the command "npx expo start" and hit "a" when prompted to open the Android emulator. After the commands in both the terminal windows are run, the historical dashboard with run and lap data from the database will be loaded.



# Detailed System Description 
Overview
The Mobile Dashboard is currently implemented using React Native. We used create-react-app to create the initial empty React app. This automatically created all of the files necessary to implement a working React app so that the Dashboard could be built from this base. 

App.js is the main file that runs the application. It contains instances of our other components that make up the widgets displayed on the dashboard. It also has the functionality to connect to the DAQ via websockets, collect the data from the DAQ, and send the collected DAQ data to the Live Timing Dashboard.

There are three main component files, one for each "column" in the mobile application. These are all contained in the "component" folder in the root directory of this repo. All three components import three modules from "react-native" library: View, StyleSheet, and Dimesions. 

<div align="center">
  <img width="400" alt="Screen Shot 2024-05-04 at 11 36 45 AM" src="https://github.com/user-attachments/assets/cdbf543a-9285-4ed1-bf28-fb88365c6d56">
  <img width="400" alt="Screen Shot 2024-05-04 at 11 36 45 AM" src="https://github.com/user-attachments/assets/e3b78f9e-0ead-48f3-82ae-66794a922c5a">
</div>

The SpeedWidget.jsx file denotes the code for the speed widget on the far left column in red. It calculates and displays the speed of the car in mph, and has a small bar underneath that changes based on the speed. Currently, our speed readings are calculated from left and right rotations per minute (RPM). Our RPM data is sent by the DAQ server. In the future, this should change in response to strength of breaking force in the car. This file also contains methods for the lap-timing functionality using Reach Native's "react-native-stopwatch-timer" library. The lapping data is the only data not collected through DAQ, so this file also sends a POST request to the Live-Timing dashboard with collected data. 

Lap functionality is used by the driver during competition to accurately gather the time per lap around the track. In future iterations, we will also use this data and other sensor data for insight into the car's performance in various aspects (eg. speed, power, etc) per lap/throughout the entire run.
<div align="center">
  <img width="250" alt="Screen Shot 2024-05-04 at 12 01 26 PM" src="https://github.com/adityakakade432/MobileDash2023/assets/158237006/6acdb987-a708-44f3-bf0c-4bc7b1296008">
  <img width="250" alt="Screen Shot 2024-05-04 at 12 04 13 PM" src="https://github.com/adityakakade432/MobileDash2023/assets/158237006/e548cf55-7ae9-4729-ad61-cf423fab884b">
</div>

The PowerBatteryDAQ.jsx file denotes the code for the middle column of the dashboard. Much like SpeedWidget.jsx, it imports the Text module and uses StyleSheet to complete the frontend. The data displayed is collected from DAQ. Data that we display in this file are DAQ connection status, temperature, and battery percentage. As of the current version, we have yet to receive tangible temperature and battery data from DAQ sensors. Currently, the battery is static dummy data. DAQ connection status is used to easily track if the connection has been severed or not, a prevalent issue that arose during previous competitions. 
<div align="center">
  <img width="600" alt="Screen Shot 2024-05-04 at 12 14 37 PM" src="https://github.com/adityakakade432/MobileDash2023/assets/158237006/a904d5f4-d8e5-47da-afc2-57ae13e8bba8">
</div>

The MapWidget.jsx file denotes the code for the rightmost column of the dashboard. It display's the car's current position on a map. The component imports the "MapView" module from the "react-native-maps" library. It also uses StyleSheet to style how the map view looks like in CSS. 
