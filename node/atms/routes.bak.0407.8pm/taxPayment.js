var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  
  res.send('tax payment home page');
});

router.get('/byTaxPaymentID/:ID', function(req, res) {
var db = req.db;
var tax_payment_id =  req.params.ID;
	
	var resp = {};
   console.log("get tax payment from recordID  request received");
db.query('select * from atms.tblTaxPayment where  ?',{tax_payment_id:tax_payment_id}, function(err, result) {
  if (err) {
	  console.log(err);
	  resp.status = "E";
resp.statusMsg = err;
  }	  else{
resp.status = "S";
resp.data = result[0];
 }
res.json(resp);
  });
});


router.get('/byVehicleID/:ID', function(req, res) {
var db = req.db;
var vehicle_record_id =  req.params.ID;
var resp = {};
db.query('select * from atms.tblTaxPayment where  ? order by to_date desc',{vehicle_record_id:vehicle_record_id}, function(err, result) {
  if (err) {
	  console.log(err);
	  resp.status = "E";
resp.statusMsg = err;
  }	  else{
resp.status = "S";
resp.dataList = result;
 }
res.json(resp);
  });
});



router.post('/insert', function(req, res) {
    var db = req.db;
	 var resp = {};
	 resp.status = "S";
   var taxPayment = req.body;
  
  if(taxPayment.from_date){
  taxPayment.from_date = new Date(taxPayment.from_date);
  taxPayment.from_date_txt = taxPayment.from_date.getDate() + "/" +( taxPayment.from_date.getMonth() + 1 )+ "/" + taxPayment.from_date.getFullYear();
}else{
  taxPayment.from_date = 0 ;  
};

if(taxPayment.to_date){
  taxPayment.to_date = new Date(taxPayment.to_date);
  taxPayment.to_date_txt = taxPayment.to_date.getDate() + "/" +( taxPayment.to_date.getMonth() + 1 )+ "/" + taxPayment.to_date.getFullYear();
}else{
  taxPayment.to_date = 0 ;  
};

if(taxPayment.issue_dt){
  taxPayment.issue_dt = new Date(taxPayment.issue_dt);
  taxPayment.issue_dt_txt = taxPayment.issue_dt.getDate() + "/" +( taxPayment.issue_dt.getMonth() + 1 )+ "/" + taxPayment.issue_dt.getFullYear();
}else{
  taxPayment.issue_dt = 0 ;  
};
   
 if(!taxPayment.tax_payment_id){ // IF1
 validateTaxUpTo(db,taxPayment.vehicle_record_id,taxPayment.to_date, function(resp1){
if(resp1.status == 'E'){
 res.send(resp1);
 } else{
	 upsertTaxPayment(db,taxPayment, function(resp1){
	res.send(resp1);	 
	});
 };
 })

 }//END IF1
 else{
	 upsertTaxPayment(db,taxPayment, function(resp1){
	res.send(resp1);	 
		 
	 });
} // END ELSE1
 
 });
 
 function validateTaxUpTo(db,vehicle_record_id,to_date_entered,callback){
	var resp = {}; 
	 resp.status = "S";
	db.query('select tax_exp_dt,tax_exp_dt_txt, record_id from atms.tblVehicle where  ?',{record_id:vehicle_record_id}, function(err, result) {
	if (err){
	  resp.status = "E"; resp.msg = err;  console.log(err);
  }	
  if(result[0].tax_exp_dt >= to_date_entered){
	  resp.status = "E"; resp.msg = "Tax is already paid upto - " + result[0].tax_exp_dt_txt;
  }
	callback(resp);
	
	}); 
	 
 } // Fn validateTaxUpTo
 
 
 function upsertTaxPayment(db,taxPayment,callback) {
 var resp = {};
     var param = {registration_no :taxPayment.registration_no , vehicle_record_id :taxPayment.vehicle_record_id , company_name :taxPayment.company_name , company_id :taxPayment.company_id , owner :taxPayment.owner , from_date :taxPayment.from_date , to_date :taxPayment.to_date , receipt_no :taxPayment.receipt_no , amount :taxPayment.amount , authority :taxPayment.authority , remarks :taxPayment.remarks , issue_dt :taxPayment.issue_dt , district :taxPayment.district, from_date_txt :taxPayment.from_date_txt,to_date_txt :taxPayment.to_date_txt,issue_dt_txt :taxPayment.issue_dt_txt};

 if(!taxPayment.tax_payment_id){
	 console.log("insert tax payment request received");
	db.query('INSERT INTO atms.tblTaxPayment SET ?', param, function(err, result) {
     
   resp = (err === null) ? { status: 'S' , tax_payment_id:result.insertId } : { status: err } ;
  callback(resp);  
});}
else{
console.log("update tax payment request received , tax_payment_id = " + taxPayment.tax_payment_id);
db.query('UPDATE atms.tblTaxPayment SET ? WHERE tax_payment_id = ?' , [param,taxPayment.tax_payment_id], function(err, result) {
	
   resp = (err === null) ? { status: 'S',tax_payment_id:taxPayment.tax_payment_id} : { status: err } ;
  callback(resp);  
});	
}
 
 }
  
 
 


module.exports = router;