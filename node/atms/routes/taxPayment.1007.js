var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  
  res.send('tax payment home page');
});

router.get('/byTaxPaymentID/:ID', function(req, res) {
var db2 = req.db2;
var tax_payment_id =  req.params.ID;
	
	var resp = {};
//   console.log("get tax payment from recordID  request received");
db2.query('select * from atms.tblTaxPayment where  ?',{tax_payment_id:tax_payment_id}, function(err, result) {
  if (err) {
	  console.log(err);
	  resp.status = "E";
	  resp.details = err.toString();
	  resp.code = err.code;

  }	  else{
resp.status = "S";
resp.data = result[0];
 }
res.json(resp);
  });
});


/*router.get('/byApplyDate/:fromDate,:toDate', function(req, res) {
var db2 = req.db2;
var fromDate = new Date(req.params.fromDate);
var toDate = new Date(req.params.toDate);
console.log("from Date" + fromDate.toString());
console.log("to Date" + toDate.toString());

var tax_payment_id =  460095;
	
	var resp = {};
db2.query('select tax_payment_id, registration_no,apply_dt, receipt_no,issue_dt from atms.tblTaxPayment where apply_dt 	>= ? and  apply_dt <= ? order by registration_no asc',[fromDate,toDate], function(err, result) {
  if (err) {
	  console.log(err);	resp.status = "E"; resp.details = err.toString(); resp.code = err.code;
  }	  else{
resp.status = "S"; resp.data = result;
 }
res.json(resp);
  });
}); */



router.get('/byDate/:criteria,:fromDate,:toDate', function(req, res) {
var db2 = req.db2;
var criteria = req.params.criteria;
var fromDate = new Date(req.params.fromDate);
var toDate = new Date(req.params.toDate);
//console.log("from Date" + fromDate.toString());
//console.log("to Date" + toDate.toString());
//var toDate = req.params.toDate;
//var tax_payment_id =  460095;
	var query = null;
	if(criteria == 'ApplyDate'){
	query = 	'select tax_payment_id, registration_no,apply_dt, receipt_no,issue_dt , to_date, amount from atms.tblTaxPayment where apply_dt 	>= ? and  apply_dt <= ? order by registration_no asc';
	}
	if(criteria == 'IssueDate'){
	query = 'select tax_payment_id, registration_no,apply_dt, receipt_no,issue_dt , to_date, amount from atms.tblTaxPayment where issue_dt 	>= ? and  issue_dt <= ? order by registration_no asc';	
	}
	
	var resp = {};
db2.query(query,[fromDate,toDate], function(err, result) {
  if (err) {
	  console.log(err);	resp.status = "E"; resp.details = err.toString(); resp.code = err.code;
  }	  else{
resp.status = "S"; resp.data = result;
 }
res.json(resp);
  });
});


router.get('/byVehicleID/:ID', function(req, res) {
var db2 = req.db2;
var vehicle_record_id =  req.params.ID;
var resp = {};
db2.query('select * from atms.tblTaxPayment where  ? order by to_date desc',{vehicle_record_id:vehicle_record_id}, function(err, result) {
  if (err) {
	  console.log(err);
	  resp.details = err.toString();
	  resp.code = err.code;
  }	  else{
resp.status = "S";
resp.dataList = result;
 }
res.json(resp);
  });
});



router.post('/insert', function(req, res) {
    var db2 = req.db2;
	 var resp = {};
	 resp.status = "S";
   var taxPayment = req.body;
   
   taxPayment.apply_dt = (taxPayment.apply_dt )? new Date(taxPayment.apply_dt) : null ;
  
  if(taxPayment.from_date){
  taxPayment.from_date = new Date(taxPayment.from_date);
  taxPayment.from_date_txt = taxPayment.from_date.getDate() + "/" +( taxPayment.from_date.getMonth() + 1 )+ "/" + taxPayment.from_date.getFullYear();
}else{
  taxPayment.from_date = null ;  
};

if(taxPayment.to_date){
  taxPayment.to_date = new Date(taxPayment.to_date);
  taxPayment.to_date_txt = taxPayment.to_date.getDate() + "/" +( taxPayment.to_date.getMonth() + 1 )+ "/" + taxPayment.to_date.getFullYear();
}else{
  taxPayment.to_date = null ;  
};

if(taxPayment.issue_dt){
  taxPayment.issue_dt = new Date(taxPayment.issue_dt);
  taxPayment.issue_dt_txt = taxPayment.issue_dt.getDate() + "/" +( taxPayment.issue_dt.getMonth() + 1 )+ "/" + taxPayment.issue_dt.getFullYear();
}else{
  taxPayment.issue_dt = null ;  
};
   
 if(!taxPayment.tax_payment_id){ // IF1 START
 validateTaxUpTo(db2,taxPayment.vehicle_record_id,taxPayment.to_date, function(resp1){
if(resp1.status == 'E'){
 res.send(resp1);
 } else{
	 upsertTaxPayment(db2,taxPayment, function(resp1){
	res.send(resp1);	 
	});
 };
 })

 }//END IF1
 else{
	 upsertTaxPayment(db2,taxPayment, function(resp1){
	res.send(resp1);	 
		 
	 });
} // END ELSE1
 
 });
 
 function validateTaxUpTo(db2,vehicle_record_id,to_date_entered,callback){
	var resp = {}; 
	 resp.status = "S";
	db2.query('select tax_exp_dt,tax_exp_dt_txt, record_id from atms.tblVehicle where  ?',{record_id:vehicle_record_id}, function(err, result) {
	if (err){
	  resp.status = "E"; resp.details = err.toString(); resp.code = err.code; console.log(err);
  }	
  if(result[0].tax_exp_dt >= to_date_entered){
	  resp.status = "E"; resp.details = "Tax is already paid upto - " + result[0].tax_exp_dt_txt; resp.code = "TAX_ALREADY_PAID";
  }
	callback(resp);
	
	}); 
	 
 } // Fn validateTaxUpTo
 
 
 function upsertTaxPayment(db2,taxPayment,callback) {
 var resp = {};
     var param = {registration_no :taxPayment.registration_no , vehicle_record_id :taxPayment.vehicle_record_id , company_name :taxPayment.company_name , company_id :taxPayment.company_id , owner :taxPayment.owner , from_date :taxPayment.from_date , to_date :taxPayment.to_date , receipt_no :taxPayment.receipt_no , amount :taxPayment.amount , authority :taxPayment.authority , remarks :taxPayment.remarks , issue_dt :taxPayment.issue_dt , district :taxPayment.district, from_date_txt :taxPayment.from_date_txt,to_date_txt :taxPayment.to_date_txt,issue_dt_txt :taxPayment.issue_dt_txt,apply_dt:taxPayment.apply_dt};

 if(!taxPayment.tax_payment_id){
	 console.log("insert tax payment request received");
	db2.query('INSERT INTO atms.tblTaxPayment SET ?', param, function(err, result) {
     
   resp = (err === null) ? { status: 'S' , tax_payment_id:result.insertId } : { status: 'E', details : err.toString(), code : err.code } ;
  callback(resp);  
});}
else{
console.log("update tax payment request received , tax_payment_id = " + taxPayment.tax_payment_id);
db2.query('UPDATE atms.tblTaxPayment SET ? WHERE tax_payment_id = ?' , [param,taxPayment.tax_payment_id], function(err, result) {
	
   resp = (err === null) ? { status: 'S',tax_payment_id:taxPayment.tax_payment_id} : { status: 'E', details : err.toString(), code : err.code } ;
  callback(resp);  
});	
}
 
 } //END upsertTaxPayment
 
 
 router.post('/updateReceiptNo', function(req, res) {
    var db2 = req.db2;
	 var resp = {};
	 resp.status = "S";
   var taxPayment = req.body;
   taxPayment.issue_dt = (taxPayment.issue_dt)?new Date(taxPayment.issue_dt):null;
    var param = {receipt_no :taxPayment.receipt_no ,  issue_dt :taxPayment.issue_dt};
	
db2.query('UPDATE atms.tblTaxPayment SET ? WHERE tax_payment_id = ?' , [param,taxPayment.tax_payment_id], function(err, result) {
	
   resp = (err === null) ? { status: 'S'} : { status: 'E', details : err.toString(), code : err.code } ;
  res.send(resp);  
});   

 
 });
 


module.exports = router;