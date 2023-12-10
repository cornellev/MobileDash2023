## MobileDash2023 | FA 2023

Authors: Aditya Kakade & Katherine Chang Wu

# Summary
System Description 
The Mobile Dashboard is a mobile application that is used to dispaly statistics about the electric vehicle. This dashboard is mainly used by team members and the driver during competition to view data about the vechile's current performance. The purpose of the Mobile Dashboard is to keep track of the various details of the car in a user intuitive format as it runs so that the driver can be aware the car's metrics. This dashboard will also send the collected data of the car's metrics to the Historical Dashboard so that it can be further analyzed to improve performance.

The infomration displayed on the Mobile Dashboard is broken down into three categories. The most far left widget displays the current speed the car is traveling at in miles per hour. The number will reflect any changes as the car speeds or slows down. The next widget to the right displays various metrics relating to the car's power. The top widget in this column is the vehicle's power in kilowatts per hour. The next widget down displays the battery power as a percentage while the last widget displays the connection status of the dashboard to the DAQ. Finally, the farthest right widget is a map that tracks the car's positions during the race. All of this data comes from the DAQ.

The frontend of the Mobile Dashboard was implemented using React Native (with a focus on Android usage), which combines the use of HTML, Javascript, and CSS. 


<img width="797" alt="Screenshot 2023-12-09 at 10 01 47 PM" src="https://github.com/adityakakade432/MobileDash2023/assets/90734482/4c2c330c-c1d4-462e-8834-0a5d3a27eef9">

Terminology
DAQ (Data Acquisition): Handles communication of data from electrical systems and sensors to driver and team.

Server: A program/script that is constantly running on the internet, listening to requests from users, and taking relevant actions.

Client: Term from the client-server architecture model. A client requests for service from the server after establishing a connection with it. Clients devices include: computers, mobile phones, tablets, etc.

Database: A reliable place to store persistent data. Think of it like a big Excel spreadsheet.

HTML: Hypertext Markup Language - the language used to create webpages.

CSS: Cascading Style Sheets - used to format the layout of Web pages.

React: a JavaScript library for building user interfaces.

Component: A React feature similar to Javascript functions that allow the user to split the UI into independent, reusable pieces, and think about each piece in isolation by accepting arbitrary inputs (called “props”) and returning React elements describing what should appear on the screen.

# How To Use
To clone this repo, please refer to this link: https://docs.github.com/en/repositories/creating-and-managing-repositories/cloning-a-repository. 

Once the repo is cloned, please ensure that you have the proper libraries and frameworks installed for React Native. Please refer to this documentation for the proper installation instructions: https://reactnative.dev/docs/environment-setup?guide=native&platform=android. 

Finally, to run the dashboard on your local device, navigate to the root directory of the rep in a terminal window. Please run the command "npx expo start" and hit "a" when prompted to open the Android emulator. After the commands in both the terminal windows are run, the historical dashboard with run and lap data from the database will be loaded.



# Detailed System Description 
