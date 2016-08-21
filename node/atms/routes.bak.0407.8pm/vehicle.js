var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  
  res.send('vehicle home page');
});

router.get('/byRecordID/:recordID', function(req, res) {
var db = req.db;
var recordID =  req.params.recordID;
	
	var resp = {};
   console.log("get vehicle from recordID  request received");
db.query('select * from atms.tblVehicle where  ?',{record_id:recordID}, function(err, result) {
  if (err)
  {
	  console.log(err);
  }	  

resp.status = "S";
resp.data = result[0];
console.log(JSON.stringify(resp.data));
res.json(resp);

  });
});

/*router.get('/taxPaidUpto/:recordID', function(req, res) {
var db = req.db;
var recordID =  req.params.recordID;
	
	var resp = {};
   console.log("get vehicle from recordID  request received");
db.query('select tax_exp_dt, record_id from atms.tblVehicle where  ?',{record_id:recordID}, function(err, result) {
  if (err)
  {
	  console.log(err);
  }	  

resp.status = "S";
resp.data = result[0];
console.log(JSON.stringify(resp.data));
res.json(resp);

  });
}); */

router.get('/byRegNo/:regNo', function(req, res) {
var db = req.db;
var regNo =  req.params.regNo;
	var resp = {};
   console.log("get vehicle from recordID  request received");
db.query('select * from atms.tblVehicle where  ?',{registration_no:regNo}, function(err, result) {
  if (err)  {
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



router.get('/search/:criteria,:txt', function(req, res) {
var db = req.db;
var txt =  '%' + req.params.txt + '%';
var criteria =  req.params.criteria;
/* 
1 = REG NO
2 = PERMIT NO
3 = COMPANY NAME
*/
  var resp = {};
   console.log("search vehicle request received");

if(criteria == 1){

db.query('select * from atms.tblVehicle where registration_no like ?',[txt], function(err, result) {
  if (err)  {
    console.log(err);
        resp.status = "E";
resp.statusMsg = err;

  }   else{
resp.status = "S";
resp.data = result;
  }
 
res.json(resp);
  
  }); // END DB QUERY

} // END IF criteria == 1



if(criteria == 2){

db.query('select * from atms.tblVehicle where permit_no like ?',[txt], function(err, result) {
  if (err)  {
    console.log(err);
        resp.status = "E";
resp.statusMsg = err;

  }   else{
resp.status = "S";
resp.data = result;
  }
 
res.json(resp);
  
  }); // END DB QUERY

} // END IF criteria == 2

if(criteria == 3){

db.query('select * from atms.tblVehicle where company_name like ?',[txt], function(err, result) {
  if (err)  {
    console.log(err);
        resp.status = "E";
resp.statusMsg = err;

  }   else{
resp.status = "S";
resp.data = result;
  }
 
res.json(resp);
  
  }); // END DB QUERY

} // END IF criteria == 3


console.log("after response is sent");

   
});


router.get('/all/:companyID', function(req, res) {
var db = req.db;
var companyID =  req.params.companyID;
	
	var resp = {};
   console.log("get all vehicles from company request received, company = " + companyID );
   var param = {};
   var sql = '';
   if (companyID == '00') {
	   sql = 'select * from atms.tblVehicle';
	   
   }else  {
	   sql = "select * from atms.tblVehicle where  ? and noc is null " ;
	   param = {company_id:companyID};
   };
   
db.query(sql,param, function(err, result) {
  if (err)  {
	  console.log(err);
  resp.status = "E";
  resp.statusMsg = err;
  }	  
  else  {
resp.status = "S";
resp.data = result;
   }
  
res.json(resp);
  
  });
   
});


router.post('/insert', function(req, res) {
    var db = req.db;
  
   var vehicle = req.body;
vehicle.registration_dt = (vehicle.registration_dt )? new Date(vehicle.registration_dt) : 0 ;
    vehicle.dt_of_issue = (vehicle.dt_of_issue )? new Date(vehicle.dt_of_issue) : 0 ;
   vehicle.old_registration_dt = (vehicle.old_registration_dt )? new Date(vehicle.old_registration_dt) : 0 ;
   vehicle.insurance_upto = (vehicle.insurance_upto )? new Date(vehicle.insurance_upto) : 0 ;
 console.log(JSON.stringify(vehicle));
var param = {company_name :vehicle.company_name , company_id :vehicle.company_id , state :vehicle.state.toUpperCase() , state_ref:vehicle.state_ref, registration_no :vehicle.registration_no , vehicle_description :vehicle.vehicle_description , seller :vehicle.seller , seller_address1 :vehicle.seller_address1 , seller_address2 :vehicle.seller_address2 , seller_Address :vehicle.seller_Address , seller_address4 :vehicle.seller_address4 , owner :vehicle.owner , owner_son_of :vehicle.owner_son_of , owner_permanent_address :vehicle.owner_permanent_address , owner_temporary_address :vehicle.owner_temporary_address , class_of_vehicle :vehicle.class_of_vehicle , makers_name :vehicle.makers_name , type_of_body :vehicle.type_of_body , model :vehicle.model , no_of_cylinders :vehicle.no_of_cylinders , chassis_no :vehicle.chassis_no , engine_no  :vehicle.engine_no  , fuel :vehicle.fuel , cubic_capacity :vehicle.cubic_capacity , wheel_base :vehicle.wheel_base , seating_capacity :vehicle.seating_capacity , unladen_weight :vehicle.unladen_weight , color :vehicle.color , hp :vehicle.hp , gross_vehicle_wt_manf :vehicle.gross_vehicle_wt_manf , gross_vehicle_wt_reg :vehicle.gross_vehicle_wt_reg , front_axle :vehicle.front_axle , rear_axle :vehicle.rear_axle , any_other_axle :vehicle.any_other_axle , tandem_axle :vehicle.tandem_axle , myref :vehicle.myref , seller_address3 :vehicle.seller_address3 , hire_purchase_details :vehicle.hire_purchase_details , remarks :vehicle.remarks , status :vehicle.status , public_private :vehicle.public_private , trailor_chassis_no :vehicle.trailor_chassis_no , payload :vehicle.payload , old_vehicle_no :vehicle.old_vehicle_no , old_state :vehicle.old_state , registration_dt :vehicle.registration_dt , old_registration_dt :vehicle.old_registration_dt , dt_of_issue :vehicle.dt_of_issue , noc :vehicle.noc , tax_paid_upto :vehicle.tax_paid_upto , noc_remark :vehicle.noc_remark,permit_no:vehicle.permit_no,insurance_upto:vehicle.insurance_upto };
 var response = {};
 response.status = 'S';
var CheckDuplicateResult = [];
var sql1 = "select record_id, engine_no, registration_no, chassis_no from atms.tblVehicle where chassis_no =  ? or engine_no = ? " ;
console.log('---');
console.log(vehicle.chassis_no + "--" , vehicle.engine_no);
var param1 = [vehicle.chassis_no, vehicle.engine_no]
db.query(sql1,param1, function(err, CheckDuplicateResult) { // CHECK DUPLICATE START
console.log("RESULT OF CHECK DUPLICATE - " + JSON.stringify(CheckDuplicateResult));
if(CheckDuplicateResult.length > 0){ // CHECK NO_RESULT_FROM_QUERY
if(!vehicle.record_id){
response.status = "E";
response.msg = "DUPLICATE_CHASSIS_ENGINE";
response.data = CheckDuplicateResult;
}else{
  if(CheckDuplicateResult.length == 1){
      if(CheckDuplicateResult[0].record_id != vehicle.record_id){
response.status = "E";
response.msg = "DUPLICATE_CHASSIS_ENGINE";
response.data = CheckDuplicateResult;
      }
  }else{
response.status = "E";
response.msg = "DUPLICATE_CHASSIS_ENGINE";
response.data = CheckDuplicateResult;
  }
  } 
  } // IF NO_RESULT_FROM_QUERY END

if(response.status == 'S'){

if(!vehicle.record_id){
  console.log("insert vehicle request received");
   db.query('INSERT INTO atms.tblVehicle SET ?', param, function(err, result) {
   res.send((err === null) ? { status: 'S' , recordID:result.insertId } : { status: 'E', data: err } );
    
});

}else{
db.query('UPDATE atms.tblVehicle SET ? WHERE record_id = ?', [param,vehicle.record_id], function(err, result) {
   res.send((err === null) ? { status: 'S' , recordID:vehicle.record_id } : { status: 'E', data: err } );
    });

}

} else{
res.send (response);
}


}) ;// DUPLICATE CHECK END


   

 });


module.exports = router;