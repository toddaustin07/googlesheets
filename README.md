# Send SmartThings events to a Google Spreadsheet

## Pre-requisites
* A Google account and a Google spreadsheet
* SmartThings Hub with [Webrequestor driver](https://github.com/toddaustin07/webrequestor)
* An always-running LAN computer (e.g. Raspberry Pi) with internet access and **nodeJS** and **npm** installed 

## How it works
SmartThings sends an HTTP request to a nodeJS app running on your LAN computer whenever a specific event is triggered.  The HTTP message contains simple text indicating the event.  The nodeJS app then uses the Google API to update your spreadsheet with a timestamp and event text.

To send the HTTP requests from SmartThings, an Edge driver called Webrequestor is used, which can be configured with multiple HTTP requests to be sent based on automation triggers.  So for example, you could create an automation routine that, any time a door contact opens or closes, triggers the HTTP request to be sent.  

So there are three elements to this solution: the SmartThings driver that sends HTTP requests, the nodeJS app that receives them, and your Google spreadsheet that gets updated.  To make the spreadsheet accessible via the Google API, authentication must be set up in the Google Console.

### Why can't an Edge driver update the Google spreadsheet directly?
Edge drivers cannot access the Google API, so an intermediate nodeJS app is used as a bridge.


## First Setup Steps
Create a project directory on your LAN computer.

Download the **gsheet_server.js** and **project.json** files from this repository to your project directory.

Create a subdirectory within your project directory called **node_modules**

Within your project directory (*not the node_modules subdirectory*), type this command:
```
npm install
```
The required node modules (express and bodyParser) will be installed to your project directory.

Do not try to run the node application yet!  You must first set up authentication with Google.

## Google Authentication
To access your Google spreadsheet via the Google API used by the node application, you must set up authentication in the Google console. If you carefully follow these steps it should take just a few minutes to do, and is a one-time setup:

* Go to the [Google Console](https://console.cloud.google.com) and login with your Google ID if needed.

### Create a new project

**At the top of your Google Console screen, you should see a dropdown box which lists your projects.  You may have none yet.  But click it and it will open up a window where you can create a new one.**

![Screenshot (7)](https://user-images.githubusercontent.com/25287498/210690886-c713c9a0-54dd-4c5a-9ad6-209751050fc4.png)

**Click the 'New Project' button...**

![Screenshot (45)](https://user-images.githubusercontent.com/25287498/210690314-64fed90a-0576-4ec2-ae37-80393e84f7bf.png)

**Enter a name for your project and click 'Create'...**

![Screenshot (46)](https://user-images.githubusercontent.com/25287498/210690436-602c82ee-4e9b-41d8-87bb-87bf5f0f4f4e.png)

**A notification box will appear on the right with your list of projects.  Click 'SELECT PROJECT' for the one you just created...**

![Screenshot (47)](https://user-images.githubusercontent.com/25287498/210690507-8ceb0bb2-b1a3-4254-8102-0808b19c3f11.png)

**Your screen should now be showing your new project as the current project...**

![Screenshot (48)](https://user-images.githubusercontent.com/25287498/210690543-916ce404-a213-417d-8271-1a32a6eb14b7.png)


### Enable Google Sheets API

**Click on the 'hamburger' menu icon in the upper left. In the menu panel that appears, click on 'APIs and Services' and then 'Enabled APIs and services'...**

![Screenshot (49)](https://user-images.githubusercontent.com/25287498/210690574-8e7838af-cfc2-448b-bda3-7460f2c00ca4.png)

**Now click on the +ENABLE APIS & SERVICES blue button...**

![Screenshot (50)](https://user-images.githubusercontent.com/25287498/210691040-308dc626-3f17-4191-9390-bb5bcd588e84.png)

**Enter 'googlesheets' in the search box and press Enter...**

![Screenshot (51)](https://user-images.githubusercontent.com/25287498/210691063-4c1783cb-97d3-4bc1-9fc2-4aa016cc6962.png)

**One entry should be found and displayed called 'Google Sheets API'.  Click on it...**

![Screenshot (52)](https://user-images.githubusercontent.com/25287498/210691118-f80d5f1e-ecd2-46c6-b21b-52f18a7006cd.png)

**Then click the 'Enable' button...**

![Screenshot (53)](https://user-images.githubusercontent.com/25287498/210691148-920a4e9c-c7fb-4b1f-ad7f-cf0f008f32ed.png)


You have now defined a project that includes access to the Google Sheets API.  The next step is to create a Service Account and credentials for accessing the API.


### Create Service Account Credentials

**On the Google Sheets API window, click the blue 'Create Credentials' button...**

![Screenshot (54)](https://user-images.githubusercontent.com/25287498/210691184-4a0515c0-a1f3-43e1-a9dd-95e78e294290.png)

**On the next screen click the blue '+CREATE CREDENTIALS' button...**

![Screenshot (56)](https://user-images.githubusercontent.com/25287498/210691649-2ceff1ad-8478-47d6-bfa7-47a869e00aea.png)

**Select 'Service Account'...**

![Screenshot (71)](https://user-images.githubusercontent.com/25287498/210696792-c1117ba2-4490-4109-87b1-8d5d1f23be4b.png)

**Enter a Service account name.  The Service account ID field below will be automatically filled in for you. Copy and paste the email address shown to someplace where you can temporarily save it. Then click 'Create and Continue'...**

![Screenshot (58)](https://user-images.githubusercontent.com/25287498/210691775-b9fec809-b56b-409c-8f96-3aa10f74291c.png)

**On this next screen, declaring a Role is optional.  If you want you can select 'Owner' or just leave it.  Press 'CONTINUE'...**

![Screenshot (59)](https://user-images.githubusercontent.com/25287498/210691807-cd9b71c4-a443-44a4-b4f0-fb39d02e4e12.png)

**Now back on the Credentials screen, your new Service Account is listed.  Click on the email address...**

![Screenshot (60)](https://user-images.githubusercontent.com/25287498/210691842-dc0e8a2e-faae-4b98-9ec0-575bbe837d00.png)


#### Add Key

**On the Service Account screen that is now showing, click on the 'KEYS' tab...**

![Screenshot (61)](https://user-images.githubusercontent.com/25287498/210691886-7a26f589-ecaf-4e6e-a138-f2f2aebf3269.png)

**Click 'ADD KEY' dropdown and then 'Create new key'...**

![Screenshot (63)](https://user-images.githubusercontent.com/25287498/210691971-b38f58c1-ff71-4c71-baae-32834dd618af.png)

**In the popup window, be sure that JSON Key type is selected and click Create...**

![Screenshot (64)](https://user-images.githubusercontent.com/25287498/210691998-ef5dfafa-52e2-47d9-8303-8f626b6022cc.png)

**You will now get a popup window and a JSON key file will be automatically downloaded to your computer.  (In future steps, this JSON file must be copied to your project directory.)  Click 'close' on the popup...**

![Screenshot (65)](https://user-images.githubusercontent.com/25287498/210692075-75a23021-7b8a-4c05-95fe-3c18d73b882c.png)


## Next Steps

### Create your spreadsheet

Create a Google a spreadsheet and on Row 1, Column 1, enter '**Date**' and on Row 1, Column 2, enter '**Event**' exactly as indicated (mind the capitalization).  ***The node application updating your spreadsheet will be expecting these headers.***

You can added bold and other highlighting to these headers, as well as column formatting, if you'd like.

### Share your spreadsheet with the Service Account

**Recall the email ID you copied from the Google project screens.  You will use that in the next step...**

![Screenshot (67)](https://user-images.githubusercontent.com/25287498/210692297-76e26c31-522a-493d-abcb-c9fd6041f3df.png)

**Go to a browser tab with your spreadsheet loaded that you created above and click the green 'Share' button in the upper right...**

![Screenshot (66)](https://user-images.githubusercontent.com/25287498/210692163-7f3df625-d894-408f-aa07-25f2d0110ed5.png)

**Here you must paste the saved email address into the list box.  UNcheck the Notify people option, and make sure the permission is set to 'Editor'.  Then click the blue 'Share' button.**

![Screenshot (68)](https://user-images.githubusercontent.com/25287498/210692318-09ad9c32-9d83-44ff-b6c5-5343959172ec.png)

### Get your spreadsheet Google ID

**Copy the spreadsheet's Google ID, which is the long alphanumeric string in your spreadsheet's URL.  You will need this in the next step.**

![Screenshot (69)](https://user-images.githubusercontent.com/25287498/210692496-62d34429-fb66-419f-9c25-53c24c9418ce.png)


### Set up node application

**Use your favorite editor to modify the gsheet_server.js file in your project directory to provide your downloaded JSON key file name and spreadsheet Google ID that you copied above.  Be sure the key file name begins with an './' and ends with '.json'.**

![Screenshot (70)](https://user-images.githubusercontent.com/25287498/210692794-36e49762-12cf-4bae-bc7b-2d73d837cabb.png)


Now save the modified gsheet_server.js file.

Last reminder:  Be sure the JSON key file has been copied to your project directory!

You can now run the app with the following command:
```
node gsheet_server.js
```

You will see only one message saying the server is listening on port 8089. Once you complete your Webrequestor setup and are sending requests, you will see them logged on this console screen to confirm the messages are being received from SmartThings.

#### Setting up autostart
You might want to make sure this app is automatically started each time your computer starts.  There are many ways to do this, so beyond the scope of this document.  Tackle that step AFTER you get things running and tested.

## Set up Webrequestor
1) Choose to have the Webrequestor driver installed to your hub from my [shared channel](https://bestow-regional.api.smartthings.com/invite/d429RZv8m9lo)
2) Use the SmartThings mobile app to do an *Add Device / Scan for nearby devices*
3) A new device will be created in your *No room assigned* room called Web Req Multi Master

### Configure Webrequestor HTTP requests
These HTTP requests will be triggered by your automation routines to send an event to be posted to your spreadsheet.  You can configure up to 5 unique events in one Webrequestor device.  If more are needed use the 'Create New Device' button in the Web Req Multi Master device.  You'll get another device created where you can create 5 more requests.  You can create as many as you need.

In the new device Settings, configure your web request(s) in one or more of the first 5 numbered 'slots':
* **Web Request #n:**
  POST:http://\<IP address of computer that will run the node app\>:8089.  For example:
  ```
  POST:http://192.168.1.140:8089
  ```
* **Web Request #n - Body:**
  * This is a JSON formatted string with one key called "event", with value of whatever you want to be posted to your spreadsheet.
    For example:
    ```
    {"event":"door opened"}
    ```
* **Web Request #n - Headers:**
  ```
  Content-type=application/json
  ``` 
You will define your automation routine THEN statements by selecting the webrequestor device and enabling the command "Pre-configured web request" and selecting the Request number you configured.

### Testing

You can manually invoke your web requests from your SmartThings mobile app.  In the Web Req Multi Master device Controls screen, simply tap the 'Select web request to execute' button and select the request you want to send.  You should see a 200 HTTP Response Code shown, which indicates your HTTP request was successfully sent and received.  You should also see message displayed from the nodeJS app on your LAN computer indicating a POST request was received and displaying the JSON string.  If your message JSON was formatted properly, your spreadsheet should be updated with your event text.
