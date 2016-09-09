var express = require('express');
var router = express.Router();

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



module.exports = router;
