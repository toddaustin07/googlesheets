
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

let sheet = {}


server.post('/', async (req, res) => {
  
  console.log ('Post received: ', req.body)
  
  res.writeHead(200);
  res.end();
  
  let dateTime = new Date();
  let dateTimestr = String(dateTime).replace(/GMT.+/, '')
  
  await sheet.addRow({ Date: dateTimestr, Event: req.body.event});
  
});



async function initauth() {

  const creds = require(KEYFILE);

  await doc.useServiceAccountAuth(creds);
  
  await doc.loadInfo();
  sheet = doc.sheetsByIndex[0];
}



initauth()
  .then(result => {
    server.listen(OURPORT, console.log(`Listening on port ${OURPORT}`));
  })
  .catch(error => {
    console.log ("Error:", error);
  })





