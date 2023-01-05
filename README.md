# Send SmartThings events to a Google Spreadsheet

## Pre-requisites
* Google account
* A google spreadsheet
* SmartThings Hub
* Webrequestor SmartThings Edge driver
* An always-running LAN computer with nodeJS and npm installed (e.g. Raspberry Pi)

## Setup
Create a project directory on your LAN computer.
Download the **gsheet_server.js** and **project.json** files from this repository to your project directory.
Create a subdirectory within your project directory called **node_modules**
Within your project directory, type this command:
```
npm install
```
The required node modules (express and bodyParser) will be installed to your project directory.

Do not try to run the node application yet.

## Google Authentication
To access your Google spreadsheet via the Google API used by the node application, you must set up authentication in the Google console. If you follow these steps it should take just a few minutes to do:

* Go to the [Google Console](https://console.cloud.google.com) and login with your Google ID if needed.

### Create a new project

![Screenshot (7)](https://user-images.githubusercontent.com/25287498/210690886-c713c9a0-54dd-4c5a-9ad6-209751050fc4.png)



![Screenshot (45)](https://user-images.githubusercontent.com/25287498/210690314-64fed90a-0576-4ec2-ae37-80393e84f7bf.png)


![Screenshot (46)](https://user-images.githubusercontent.com/25287498/210690436-602c82ee-4e9b-41d8-87bb-87bf5f0f4f4e.png)


![Screenshot (47)](https://user-images.githubusercontent.com/25287498/210690507-8ceb0bb2-b1a3-4254-8102-0808b19c3f11.png)


![Screenshot (48)](https://user-images.githubusercontent.com/25287498/210690543-916ce404-a213-417d-8271-1a32a6eb14b7.png)

### Enable Google Sheets API


![Screenshot (49)](https://user-images.githubusercontent.com/25287498/210690574-8e7838af-cfc2-448b-bda3-7460f2c00ca4.png)

![Screenshot (50)](https://user-images.githubusercontent.com/25287498/210691040-308dc626-3f17-4191-9390-bb5bcd588e84.png)


![Screenshot (51)](https://user-images.githubusercontent.com/25287498/210691063-4c1783cb-97d3-4bc1-9fc2-4aa016cc6962.png)


![Screenshot (52)](https://user-images.githubusercontent.com/25287498/210691118-f80d5f1e-ecd2-46c6-b21b-52f18a7006cd.png)


![Screenshot (53)](https://user-images.githubusercontent.com/25287498/210691148-920a4e9c-c7fb-4b1f-ad7f-cf0f008f32ed.png)


### Create Service Account Credentials

![Screenshot (54)](https://user-images.githubusercontent.com/25287498/210691184-4a0515c0-a1f3-43e1-a9dd-95e78e294290.png)


![Screenshot (55)](https://user-images.githubusercontent.com/25287498/210691216-75437d59-21fb-4270-89a6-900c6c4db72d.png)


![Screenshot (56)](https://user-images.githubusercontent.com/25287498/210691649-2ceff1ad-8478-47d6-bfa7-47a869e00aea.png)


![Screenshot (57)](https://user-images.githubusercontent.com/25287498/210691710-da94aa51-767a-482b-ac4a-e408a4e615f0.png)

![Screenshot (58)](https://user-images.githubusercontent.com/25287498/210691775-b9fec809-b56b-409c-8f96-3aa10f74291c.png)


![Screenshot (59)](https://user-images.githubusercontent.com/25287498/210691807-cd9b71c4-a443-44a4-b4f0-fb39d02e4e12.png)


![Screenshot (60)](https://user-images.githubusercontent.com/25287498/210691842-dc0e8a2e-faae-4b98-9ec0-575bbe837d00.png)


#### Add Key

![Screenshot (61)](https://user-images.githubusercontent.com/25287498/210691886-7a26f589-ecaf-4e6e-a138-f2f2aebf3269.png)

![Screenshot (62)](https://user-images.githubusercontent.com/25287498/210691941-a3452cc1-46b1-4499-8c23-beb7502996d1.png)

![Screenshot (63)](https://user-images.githubusercontent.com/25287498/210691971-b38f58c1-ff71-4c71-baae-32834dd618af.png)


![Screenshot (64)](https://user-images.githubusercontent.com/25287498/210691998-ef5dfafa-52e2-47d9-8303-8f626b6022cc.png)

![Screenshot (65)](https://user-images.githubusercontent.com/25287498/210692075-75a23021-7b8a-4c05-95fe-3c18d73b882c.png)


## Next Steps

### Share your spreadsheet with the Service Account

![Screenshot (66)](https://user-images.githubusercontent.com/25287498/210692163-7f3df625-d894-408f-aa07-25f2d0110ed5.png)

![Screenshot (67)](https://user-images.githubusercontent.com/25287498/210692297-76e26c31-522a-493d-abcb-c9fd6041f3df.png)


![Screenshot (68)](https://user-images.githubusercontent.com/25287498/210692318-09ad9c32-9d83-44ff-b6c5-5343959172ec.png)


### Get your spreadsheet Google ID

![Screenshot (69)](https://user-images.githubusercontent.com/25287498/210692496-62d34429-fb66-419f-9c25-53c24c9418ce.png)


### Set up node application


1) Copy the downloaded json file to your project directory

2) Edit gsheet_server.js to provide your json file name and spreadsheet Google ID
![Screenshot (70)](https://user-images.githubusercontent.com/25287498/210692794-36e49762-12cf-4bae-bc7b-2d73d837cabb.png)

## Set up Webrequestor
1) Install webrequestor to your hub from my shared channel
2) Use the SmartThings mobile app to do an *Add Device / Scan for nearby devices*
3) A new device will be created in your *No room assigned* room called Web Req Multi Master
### Configure Webrequestor requests
These will be triggered by your automation routines to send an event to be posted to your spreadsheet.  You can configure up to 5.  If more are needed use the 'Create New Device' button in the Web Req Multi Master device.  You'll get another device created where you can create 5 more requests.

In device Settings, configure your web request(s) in one or more of the first 5 'slots':
* **Web Request #n:** POST:http//\<IP address of the node app\>:8089
* **Web Request #n - Body:**  This is a JSON formatted string with one key called "event", with value of whatever you want to be posted to your spreadsheet.
    For example:  {"event":"door opened"}
* **Web Request #n - Headers:**  Content-type=application/json
  
You will define your automation routine THEN statements by selecting the webrequestor device and enabling the command "Pre-configured web request" and selecting the Request number you want sent.







