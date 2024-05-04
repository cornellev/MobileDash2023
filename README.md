## MobileDash2023 | FA 2023

Authors: Aditya Kakade, Katherine Chang Wu, Daniel Sorokin

# Summary
System Description 
The Mobile Dashboard is a mobile application that is used to dispaly statistics about the electric vehicle. This dashboard is mainly used by team members and the driver during competition to view data about the vechile's current performance. The purpose of the Mobile Dashboard is to keep track of the various details of the car in a user intuitive format as it runs so that the driver can be aware the car's metrics. This dashboard will also send the collected data of the car's metrics to the Living Timing and Historical Dashboard so that it can be further analyzed to improve performance.

The infomration displayed on the Mobile Dashboard is broken down into three categories. 

The most far left widget displays the current speed the car is traveling at in miles per hour. The number will reflect any changes as the car speeds or slows down. It also contains the lap timing mechanism. To initiate the timer, the user will press the right start button, and then to mark the completion of a lap, they will press the left lap button. On the completion of the race, the user will reset the timer, and the data will be sent to the Live Timing Dashboard.

The next widget to the right displays various metrics relating to the car. The top widget in this column is the vehicle's temperature in Celcius. The next widget down displays the battery power as a percentage. The last widget displays the connection status of the dashboard to the DAQ. To initiate a connection with DAQ, the user must press this DAQ button. 

Finally, the farthest right widget is a map that tracks the car's positions during the race.

The frontend of the Mobile Dashboard was implemented using React Native (with a focus on Android usage), which combines the use of JSX, HTML, Javascript, and CSS. 

<img width="921" alt="Screen Shot 2024-05-04 at 11 36 45 AM" src="https://github.com/adityakakade432/MobileDash2023/assets/158237006/4a199d18-1886-49b6-99b4-687f54693789">


Terminology
DAQ (Data Acquisition): Handles communication of data from electrical systems and sensors to driver and team.

Server: A program/script that is constantly running on the internet, listening to requests from users, and taking relevant actions.

Client: Term from the client-server architecture model. A client requests for service from the server after establishing a connection with it. Clients devices include: computers, mobile phones, tablets, etc.

Database: A reliable place to store persistent data. Think of it like a big Excel spreadsheet.

HTML: Hypertext Markup Language - the language used to create webpages.

CSS: Cascading Style Sheets - used to format the layout of Web pages.

React: a JavaScript library for building user interfaces.

JSX: a syntax extension of regular JavaScript used to write HTML CODE IN javascript. It is often used to create React elements instead of HTML.

Component: A React feature similar to Javascript functions that allow the user to split the UI into independent, reusable pieces, and think about each piece in isolation by accepting arbitrary inputs (called “props”) and returning React elements describing what should appear on the screen.

# How To Use
To clone this repo, please refer to this link: https://docs.github.com/en/repositories/creating-and-managing-repositories/cloning-a-repository. 

Once the repo is cloned, please ensure that you have the proper libraries and frameworks installed for React Native. Please refer to this documentation for the proper installation instructions: https://reactnative.dev/docs/environment-setup?guide=native&platform=android. 

Finally, to run the dashboard on your local device, navigate to the root directory of the rep in a terminal window. Please run the command "npx expo start" and hit "a" when prompted to open the Android emulator. After the commands in both the terminal windows are run, the historical dashboard with run and lap data from the database will be loaded.



# Detailed System Description 
Overview
The Mobile Dashboard is currently implemented using React Native. We used create-react-app to create the initial empty React app. This automatically created all of the files necessary to implement a working React app so that the Dashboard could be built from this base. 

Application Architecture: Frontend

<img width="577" alt="Screen Shot 2024-05-04 at 11 46 24 AM" src="https://github.com/adityakakade432/MobileDash2023/assets/158237006/ac2f837e-05bd-43b5-9553-d475041be480">

<img width="467" alt="Screen Shot 2024-05-04 at 11 47 04 AM" src="https://github.com/adityakakade432/MobileDash2023/assets/158237006/b4799121-0050-4aaa-802b-009ee242dc36">

App.js is the main file that runs the application. It contains instances of our other componenets that make up the widgets that are displayed on dashboard. It also contains the functionality to connect to the DAQ via websockets, collect the data from the DAQ, and send the collected DAQ data to the Live Timing Dashboard.

Componenets
There are three main component files, one for each "column" in the mobile application. These are all contained in the "component" folder in the root directory of this repo. All three componenets import three modules from "react-native" library: View, StyleSheet, and Dimesions. 

The SpeedWidget.jsx file denotes the code for the speed widget on the far left column in red. It also imports the Text module from "react-native" library and uses an instance of the StylesSheet library to create a circle and customize the look of it. This file also contains methods for the speedometer and lap-timing functionality, and sends a POST request to the Live-Timing dashboard with collected data. The speedometer determines the speed of the car given RPM data from DAQ alongside the diameter of the car's tires. 

The PowerBatteryDAQ.jsx file denotes the code for the middle column of the dashboard. Much like SpeedWidget.jsx, it imports the Text module and uses StyleSheet to complete the frontend. The data displayed is collected from DAQ. 

The MapWidget.jsx file denotes the code for the rightmost column of the dashboard. It display's the car's current position on a map. The component imports the "MapView" module from the "react-native-maps" library. It also uses StyleSheet to style how the map view looks like in CSS. 


Application Architecture: Backend 

# Challenges
1. One challenge we encountered was finding a way to develop the app in a landscape orientation. We solved this issue by using the StyleSheet module's transform to rotate components by 90 degrees so that while we created the widgets in a portrait orientation, the app is used in landscape.

# Testing

# Semester Work
