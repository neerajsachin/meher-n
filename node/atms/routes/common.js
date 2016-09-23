var express = require('express');
var router = express.Router();
var http = require('http');

//var parseString = require('xml2js').parseString;
/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('common home page');
});

router.post('/deleteItem', function(req, res) {
    var db2 = req.db2;
	 var resp = {};
	 resp.status = "S";
	 
   var itemType = req.body.itemType;
   var itemID = req.body.itemID;
   console.log('Delete Request - ' +  itemType + " - "  + itemID );
      
deleteItem(db2,itemType,itemID,function(err,result){
  resp = (err === null) ? { status: 'S'} : { status: 'E', details : err.toString(), code : err.code } ;
  res.send(resp); 
 
if(itemType === 'VEH'){
  deleteChild(db2,itemID);
}

});
 
 });  //END  POST ROUTER

function deleteItem(db2,itemType,itemID,callback){

   var query = null;
   var param = [itemID];
if(itemType == 'CF') query = 'delete from atms.tblfitnesscert where fitness_cert_id = ?';

if(itemType == 'NP') query = 'delete from atms.tblntlpermit where national_permit_id = ?';

if(itemType == 'Tax') query = 'delete from atms.tbltaxpayment where tax_payment_id = ?';

if(itemType == 'VEH') query = 'delete from atms.tblvehicle where record_id = ?';

db2.query(query , param, function(err, result) {
  callback(err,result)
 });
}



function deleteChild(db2, parentItemID){

  var parentColumn =  'vehicle_record_id';
   var query = null;
   var param = {};
   param[parentColumn] = parentItemID;

   console.log(JSON.stringify(param));

db2.query('delete from atms.tblfitnesscert where  ?' , param, function(err, result) {
 });
db2.query('delete from atms.tblntlpermit where  ?' , param, function(err, result) {
});  
db2.query('delete from atms.tbltaxpayment where  ?' , param, function(err, result) {
 });

}



//http://t.onetouchsms.in/sendsms.jsp?user=sachin&password=sachin&mobiles=9711520093&sms=hello&senderid=RTOSKA&version=3


router.post('/sendSMSDVP', function(req, res) {

var remaining = req.body.remaining;
var vehicleList = req.body.vehicleList.map(function(obj){
return obj.slice(-7).replace('/','');

}) ; 
var postVehicleListText = (remaining > 0)? ' and ' + remaining +' more..': '';



var duration = req.body.duration;
var resp = {};
var param = {};
var mobiles = null;
param.company_id = req.body.company_id;

req.db2.query('select sms_alert_no, sms_alert_no2 from atms.tblcompany where ?' , param, function(err, result){
  console.log(JSON.stringify(result));
  
var sms_alert_no = (!result[0].sms_alert_no || result[0].sms_alert_no === 'null' ) ? null : result[0].sms_alert_no ;
var sms_alert_no2 = (!result[0].sms_alert_no2 || result[0].sms_alert_no2 === 'null' ) ? null : result[0].sms_alert_no2 ;

if(!sms_alert_no && !sms_alert_no2 ) {
 resp.status = 'E';
 resp.code = 'PHONE_NOT_FOUND';
  res.send(resp);
  return;
}

if(sms_alert_no && !sms_alert_no2 ) {
 mobiles = sms_alert_no;
};
if(!sms_alert_no && sms_alert_no2 ) {
 mobiles = sms_alert_no2;
};
if(sms_alert_no && sms_alert_no2 ) {
 mobiles = sms_alert_no + ',' + sms_alert_no2;
}

var text = escape('Kind Attn! Docs of vehs nos ' + vehicleList.toString() + postVehicleListText + ' expiring within ' + duration + ' days.Pls call us for renewal. Rgds, Surinderkragarwal@gmail.com, 9954080000, 9435103190'  );
//text = encodeURI(text);
var options = {
  host: 't.onetouchsms.in',
  port: 80,
  path: '/sendsms.jsp?user=sachin&password=sachin&senderid=RTOSKA&version=3&mobiles=' + mobiles + '&sms=' + text,
  method: 'GET'
};


http.request(options, function(res) {
  console.log('SMS status: ' + res.statusCode);
  //console.log('HEADERS: ' + JSON.stringify(res.headers));
  res.setEncoding('utf8');
  res.on('data', function (chunk) {
    //console.log('BODY: ' + chunk);
  });
}).end(); 
res.send({status:'S'});
updateSMSSentStatus(req.db2, param.company_id);
}) ;


});


function updateSMSSentStatus (db,company_id) {

var today = new Date(); 
param = [today, company_id];
db.query('update atms.tblcompany set last_sms_dvp = ? where company_id = ?' ,param , function(err, result){
if(err) console.log('Error in updating last_dvp_sent' + err);

});

}


module.exports = router;
