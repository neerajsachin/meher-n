var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  
  res.send('temp permit home page');
});

router.get('/byRecordID/:ID', function(req, res) {
var db = req.db;
var temp_permit_id =  req.params.ID;
	
	var resp = {};
   console.log("get temp permit from recordID  request received");
db.query('select * from atms.tblTempPermit where  ?',{temp_permit_id:temp_permit_id}, function(err, result) {
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
   console.log("get temp permit from recordID  request received");
db.query('select * from atms.tblTempPermit where  ?',{vehicle_record_id:vehicle_record_id}, function(err, result) {
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
  
   var tempPermit = req.body;

     if(tempPermit.from_date){
  tempPermit.from_date = new Date(tempPermit.from_date);
  tempPermit.from_date_txt = tempPermit.from_date.getDate() + "/" +( tempPermit.from_date.getMonth() + 1 )+ "/" + tempPermit.from_date.getFullYear();
}else{
  tempPermit.from_date = 0 ;  
};

if(tempPermit.to_date){
  tempPermit.to_date = new Date(tempPermit.to_date);
  tempPermit.to_date_txt = tempPermit.to_date.getDate() + "/" +( tempPermit.to_date.getMonth() + 1 )+ "/" + tempPermit.to_date.getFullYear();
}else{
  tempPermit.to_date = 0 ;  
};

if(tempPermit.issue_dt){
  tempPermit.issue_dt = new Date(tempPermit.issue_dt);
  tempPermit.issue_dt_txt = tempPermit.issue_dt.getDate() + "/" +( tempPermit.issue_dt.getMonth() + 1 )+ "/" + tempPermit.issue_dt.getFullYear();
}else{
  tempPermit.issue_dt = 0 ;  
};


     var param = {registration_no :tempPermit.registration_no , vehicle_record_id :tempPermit.vehicle_record_id , company_name :tempPermit.company_name , company_id :tempPermit.company_id , owner :tempPermit.owner , from_date :tempPermit.from_date , to_date :tempPermit.to_date , permit_no :tempPermit.permit_no , authority :tempPermit.authority , routes :tempPermit.routes, remarks :tempPermit.remarks , issue_dt :tempPermit.issue_dt ,tax_payment_expiry_dt :tempPermit.tax_payment_expiry_dt ,fitness_certificate_expiry_dt :tempPermit.fitness_certificate_expiry_dt ,insurance_expiry_dt :tempPermit.insurance_expiry_dt,from_date_txt :tempPermit.from_date_txt,to_date_txt :tempPermit.to_date_txt,issue_dt_txt :tempPermit.issue_dt_txt};

	 if(!tempPermit.temp_permit_id){
		 console.log("insert temp permit request received");
	   db.query('INSERT INTO atms.tblTempPermit SET ?', param, function(err, result) {
   res.send((err === null) ? { status: 'S' , temp_permit_id:result.insertId } : { status: err } );
	   });	 
	 }else{
		 console.log("update temp permit request received, temp_permit_id = " + tempPermit.temp_permit_id );
	   db.query('UPDATE atms.tblTempPermit SET ? WHERE temp_permit_id = ?', [param,tempPermit.temp_permit_id ], function(err, result) {
   res.send((err === null) ? { status: 'S' , temp_permit_id:tempPermit.temp_permit_id } : { status: err } );
	   });
		 
	 }
   

 });


module.exports = router;