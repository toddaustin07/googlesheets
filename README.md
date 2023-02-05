# Send SmartThings events to a Google Spreadsheet

**02/05/23 UPDATE:**  Allow for sheet name to be included in JSON body.  If no sheet name provided, then first sheet in spreadsheet will be updated.

## Pre-requisites
* A Google account
* SmartThings Hub with [Webrequestor driver](https://github.com/toddaustin07/webrequestor)
* An always-running LAN computer (e.g. Raspberry Pi) with internet access and **nodeJS** and **npm** installed 

## How it works
A SmartThings automation sends an HTTP request to a nodeJS app running on your LAN computer whenever a specific event is triggered.  The HTTP message contains a simple value (text, numeric, boolean) indicating the event.  The nodeJS app then uses the Google API to update your spreadsheet with a timestamp and the event value.

![googlesheetapp](https://user-images.githubusercontent.com/25287498/210859975-fa6b6d6b-4120-4d55-a7f4-f41f9b38489c.png)


To send the HTTP requests from SmartThings, an Edge driver called Webrequestor is used, which can be configured with multiple HTTP requests to be sent based on automation triggers.  So for example, you could create an automation routine that, any time a door contact opens or closes, triggers the HTTP request to be sent.  

So there are three elements to this solution: the SmartThings driver that sends HTTP requests, the nodeJS app that receives them, and your Google spreadsheet that gets updated.  To make the spreadsheet accessible via the Google API, authentication must be set up in the Google Console.

Alternatively to Webrequestor, another driver that can be used to issue HTTP requests for spreadsheet updates is my [HTTP Devices driver](https://github.com/toddaustin07/HTTPDevices).  This driver allows for the creation of specific virtual device types (switch, dimmer, button, motion, contact, alarm) that also can be configured to send HTTP requests.

### Why can't an Edge driver update the Google spreadsheet directly?
Edge drivers cannot access the Google API, so an intermediate nodeJS app is used as a bridge.

### Limitations
Using the Webrequestor Edge driver allows a very simple and accessible way to issue HTTP requests with Smartthings automations.  However, the requests are typically pre-configured, thus using this method is somewhat limited.  For example, there is no way to send dynamic, variable measurement values like temperature or energy using this method.  There is, for now, limited flexibilty in standard SmartThings automations for 'sending' or 'setting' variable values like this without a SmartApp.  Using the Rules engine, along with the ability to create dynamic HTTP requests with Webrequestor may allow some additional options for the more technically and creatively inclined.  

See the *Additional Info* section for some other ideas and alternatives.

## First Setup Steps
Create a project directory on your LAN computer.

### Download the node application files
You will need to download the gsheet_server.js and project.json files from this github repository into your project directory.

Options:
  * Click on the file, then click the **Raw** button, then right-click the contents and do a Save As
  * Use **wget** from a Linux terminal using the URLs of the raw files:
    ```
    wget https://raw.githubusercontent.com/toddaustin07/googlesheets/main/gsheet_server.js
    wget https://raw.githubusercontent.com/toddaustin07/googlesheets/main/package.json
    ```
  * 'git clone' the whole repository (not generally recommended; power users only)
    ```
    git clone https://github.com/toddaustin07/googlesheets.git
    ```

Now create a **subdirectory** within your project directory called **node_modules**.

From your project directory (*not the node_modules subdirectory*), type this command:
```
npm install
```
The required node modules (express and google-spreadsheet) will be installed to your project directory's node_modules subdirectory.

Do not try to run the node application yet!  You must first set up authentication with Google.

## Google Authentication
For the node application to access your Google spreadsheet via the Google API, you must set up authentication in the Google console. If you carefully follow these steps it should take just a few minutes to do, and is a one-time setup.  A screen-by-screen walkthrough is provided below to make this easy!

* Go to the [Google Console](https://console.cloud.google.com) and login with your Google ID if needed.

### Create a new project

**At the top of your Google Console screen, you should see a dropdown box which lists your projects.  You may have none yet.  But click it and it will open up a window where you can create a new one.**

![Screenshot (7)](https://user-images.githubusercontent.com/25287498/210690886-c713c9a0-54dd-4c5a-9ad6-209751050fc4.png)

**Click the 'NEW PROJECT' button...**

![Screenshot (45)](https://user-images.githubusercontent.com/25287498/211177065-51b9689f-6f64-4f86-acfe-cb9251feddeb.png)


**Enter a name for your project and click 'CREATE'...**

![Screenshot (46)](https://user-images.githubusercontent.com/25287498/210690436-602c82ee-4e9b-41d8-87bb-87bf5f0f4f4e.png)

**A notification box will appear on the right with your list of projects.  Click 'SELECT PROJECT' for the one you just created...**

![Screenshot (47)](https://user-images.githubusercontent.com/25287498/210690507-8ceb0bb2-b1a3-4254-8102-0808b19c3f11.png)

**Your screen should now be showing your new project as the current project...**

![Screenshot (48)](https://user-images.githubusercontent.com/25287498/210843834-6117e70f-4acf-4811-aadf-e56233afc872.png)


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

**On the Google Sheets API window, click on 'Credentials' in the menu panel on the LEFT SIDE of the window.  (*Not* the blue 'CREATE CREDENTIALS' button in the upper right)...**

![Screenshot (78)](https://user-images.githubusercontent.com/25287498/211174652-011cb7ba-0aef-444f-a79e-e12bf9f813a3.png)


**On the next screen click the blue '+CREATE CREDENTIALS' button...**

![Screenshot (56)](https://user-images.githubusercontent.com/25287498/210691649-2ceff1ad-8478-47d6-bfa7-47a869e00aea.png)

**Select 'Service account'...**

![Screenshot (71)](https://user-images.githubusercontent.com/25287498/210696792-c1117ba2-4490-4109-87b1-8d5d1f23be4b.png)

**Enter a Service account name.  The Service account ID field below will be automatically filled in for you. Copy and paste the email address shown to someplace where you can temporarily save it. Then click 'CREATE AND CONTINUE'...**

![Screenshot (58)](https://user-images.githubusercontent.com/25287498/210709495-a0c99013-7d54-4160-af51-34bd50bafbbc.png)


**On this next screen, declaring a Role is optional.  If you want you can select 'Owner' or just leave it.  Press 'DONE'...**

![Screenshot (79)](https://user-images.githubusercontent.com/25287498/211174671-d2529606-5c13-4986-ba95-114702de849d.png)


**Now back on the Credentials screen, your new Service Account is listed.  Click on the email address...**

![Screenshot (60)](https://user-images.githubusercontent.com/25287498/210709663-20baa20f-04d9-4aa1-aaa6-b3dfce25bd58.png)



#### Add Key

**On the Service Account screen that is now showing, click on the 'KEYS' tab...**

![Screenshot (61)](https://user-images.githubusercontent.com/25287498/210709833-47c03770-9cc6-4720-bea0-4cb2ed1b9af1.png)


**Click 'ADD KEY' dropdown and then 'Create new key'...**

![Screenshot (63)](https://user-images.githubusercontent.com/25287498/210691971-b38f58c1-ff71-4c71-baae-32834dd618af.png)

**In the popup window, be sure that 'JSON' Key type is selected and click 'CREATE'...**

![Screenshot (64)](https://user-images.githubusercontent.com/25287498/210844961-d797e65a-bff7-42ec-9a0b-0d2c36a94785.png)


**You will now get a popup window and a JSON key file will be automatically downloaded to your computer.  (In future steps, this JSON file must be copied to your project directory.)  Click 'CLOSE' on the popup...**

![Screenshot (65)](https://user-images.githubusercontent.com/25287498/210711289-05aee625-1baa-4283-b58f-47e0c8dba93c.png)


## Next Steps

### Create your spreadsheet

Create a Google a spreadsheet and on Row 1, Column 1, enter '**Date**' and on Row 1, Column 2, enter '**Event**' exactly as indicated (mind the capitalization).  ***The node application updating your spreadsheet will be expecting these headers.***

You can add bold text formatting and other highlighting to these headers, as well as column formatting, if you'd like.

Be aware that the node app will update the first sheet it finds in your worksheet.  You can create and use other sheets within the worksheet, but SmartThings events will always be posted in the first sheet.  And the specified headers need to be in that first sheet.

### Share your spreadsheet with the Service Account

**Recall the email ID you copied from the Google project screens.  You will use that in the next step...**

![Screenshot (67)](https://user-images.githubusercontent.com/25287498/210710198-5999485f-9622-49e2-b96a-a1389b7624e1.png)


**Go to a browser tab with your spreadsheet loaded that you created above and click the green 'Share' button in the upper right...**

![Screenshot (66)](https://user-images.githubusercontent.com/25287498/210692163-7f3df625-d894-408f-aa07-25f2d0110ed5.png)

**Here you must paste the saved Service account email address into the 'Add people and groups' input box...**

![Screenshot (73)](https://user-images.githubusercontent.com/25287498/210847200-d72ede69-3f29-4abc-b628-257a08a18003.png)


**UNcheck the 'Notify people' option, and make sure the permission is set to 'Editor'.  Then click the blue 'Share' button.**

![Screenshot (72)](https://user-images.githubusercontent.com/25287498/210846474-a5df58be-fe57-4c35-92bc-64dadce98d0f.png)


### Get your spreadsheet Google ID

**Copy the spreadsheet's Google ID, which is the long alphanumeric string in your spreadsheet's URL.  You will need this in the next step.**

![Screenshot (69)](https://user-images.githubusercontent.com/25287498/210710558-2f682fb8-d286-4eb0-9b27-56d87c2ae3d0.png)


### Set up node application

**Use your favorite editor to modify the gsheet_server.js file in your project directory to provide your downloaded JSON key file name and spreadsheet Google ID that you copied above.  *Be sure the key file name begins with an './' and ends with '.json'.***

![Screenshot (70)](https://user-images.githubusercontent.com/25287498/210692794-36e49762-12cf-4bae-bc7b-2d73d837cabb.png)


Now save the modified gsheet_server.js file.

Copy the JSON key file that was automatically downloaded (probably to your Downloads folder) to your project directory:
```
cd ~/myprojectdirectory
cp ~/Downloads/xxxxxxxxxxxxxxxxxxx.json xxxxxxxxxxxxxxxxxxx.json
```

You can now run the node app with the following command:
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
These HTTP requests will be triggered by your automation routines to send an event to be posted to your spreadsheet.  You can configure up to 5 unique HTTP requests representing different events in one Webrequestor device.  If more are needed use the 'Create New Device' button in the Web Req Multi Master device Controls screen.  You'll get another device created where you can create 5 more requests.  You can create as many webrequestor devices as you need.

In the webrequestor device Settings, configure your HTTP request(s) in one or more of the first 5 numbered 'slots':
* **Web Request #n:**
  POST:http://\<IP address of computer that will run the node app\>:8089.  For example:
  ```
  POST:http://192.168.1.140:8089
  ```
* **Web Request #n - Body:**
  * This is a JSON formatted string with one required key called "event", with value of whatever you want to be posted to your spreadsheet.  The value can be text, numeric, or boolean.  A optional second key called "sheet" can be provided to specify the name of the sheet in your spreadsheet to update.  If no sheet is specified in the JSON, then the first sheet will be updated.
    Examples:
    ```
    {"event":"door opened"}
    {"sheet":"mysheet", "event":42}
    {"event":true}
    ```
  ***WARNING!*** Be sure to use only "straight" quotation marks, not the left or right style.  Your mobile device should allow you to select the specific quotes to use via its keyboard.  Copy/pasting can often bring with it the wrong style quotes, so beware.
  
* **Web Request #n - Headers:**
  ```
  Content-type=application/json
  ``` 

If you set up multiple HTTP requests to represent different events, note that they will all have the same request URL and headers.  Only the request body will be unique with whatever event text you want to have posted to your spreadsheet.

### Testing

You can manually invoke your web requests from your SmartThings mobile app.  In the Web Req Multi Master device Controls screen, simply tap the 'Select web request to execute' button and select the request you want to send.  You should see a '200' shown in the HTTP Response Code field, which indicates your HTTP request was successfully sent and received.  You should also see a message displayed from the nodeJS app on your LAN computer indicating it received the POST request along with the accompanying JSON string.  If your message body JSON was formatted properly, and your spreadsheet has the expected headers, then your spreadsheet should be updated with your event value and a timestamp.

### Building Automations
You will define your automation routine 'Then' actions by selecting the webrequestor device, choosing and enabling the command "Pre-configured web request" and selecting the Request you configured (Request #1, Request #2, Request #3, etc).

## Additional Info
#### Change Management
* If you create a new spreadsheet, it will have a new Google doc ID, so you will need to:
  1. Share the spreadsheet using your Service account email address
  2. Update the gsheet_server.js file in your project directory

* Any changes to either the Google doc ID or JSON key file downloaded from the Google console will require you to update the gsheet_server.js file in your project directory and restart the application:
  ```
  pi@raspberrypi: cd ~/<project directory>
  pi@raspberrypi: node gsheet_server.js
  Listening on port 8089
  <Ctrl-c>
  pi@raspberrypi: nano gsheet_server.js
  pi@raspberrypi: node gsheet_server.js
  ```
  
#### Ideas/Alternatives
* Use the [HTTP Devices driver](https://github.com/toddaustin07/HTTPDevices) as an alternative to Webrequestor.  That driver allows you to create specific virtual device types including switch, button, dimmer, contact, motion, and alarm, which can each be configured with HTTP requests to be sent upon the respective device commands  A unique example would be that using the **dimmer** device, you can have a way to send a variable numeric value (0-100) to be posted to your spreadsheet.  Using some creative automation routines, this could provide a partial solution to the limitation of posting only static, preconfigured values.  
  * Under consideration:  adding a 'simple string' type device to the HTTP Devices driver, where a routine could set any text value that could then be posted to your spreadsheet.  This would allow for a more flexible 'logging' facility.

***
***

<a href="https://www.buymeacoffee.com/taustin" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" style="height: 60px !important;width: 217px !important;" ></a>

