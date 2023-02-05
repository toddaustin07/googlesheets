
/**********************************************************************/
//MODIFY THE TWO ITEMS BELOW WITH YOUR GOOGLE KEYFILE AND GOOGLE DOC ID
/**********************************************************************/
const KEYFILE = './xxxxxxxxxxxxxxxxxxxxxxxxxxxx.json'
const GOOGLEDOCID = 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
/**********************************************************************/


const express = require('express');
const bodyParser = require('body-parser');

const server = module.exports = express();
server.use(bodyParser.json());

const OURPORT = 8089

const { GoogleSpreadsheet } = require('google-spreadsheet');
const doc = new GoogleSpreadsheet(GOOGLEDOCID);


server.post('/', async (req, res) => {
  
  console.log (`POST received with body: ${JSON.stringify(req.body)}`);
  
  res.writeHead(200);
  res.end();
  
  let sheet = {};
  if (req.body.sheet) {
    sheet = doc.sheetsByTitle[req.body.sheet];
  } else
    sheet = doc.sheetsByIndex[0];
  
  
  let dateTime = new Date();
  let dateTimestr = String(dateTime).replace(/GMT.+/, '');
  
  try {
    await sheet.addRow({ Date: dateTimestr, Event: req.body.event});
    
  } catch (err) {
    console.log ('\tERROR: Unable to add row to sheet');
  }
  
});


async function initauth() {

  const creds = require(KEYFILE);

  await doc.useServiceAccountAuth(creds);
  
  await doc.loadInfo();
  
}


console.log('\nGooglesheet Server for SmartThings Events v1.0\n')
initauth()
  .then(result => {
    server.listen(OURPORT, console.log(`Listening on port ${OURPORT}`));
  })
  .catch(error => {
    console.log ("Error:", error);
  })
