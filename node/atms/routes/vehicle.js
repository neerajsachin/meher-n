var express = require('express');
var router = express.Router();
var moment = require('moment');
router.get('/', function(req, res, next) {
  
  res.send('vehicle home page');
});

router.get('/byRecordID/:recordID', function(req, res) {
var db = req.db;
var recordID =  req.params.recordID;
	
	var resp = {};
   //console.log("get vehicle from recordID  request received");
db.query('select * from atms.tblVehicle where  ?',{record_id:recordID}, function(err, result) {
  if (err)
  {
	  console.log(err);
	  resp.status = "E";
	  resp.details = err.toString();
	  resp.code = err.code;
  }	 else{
resp.status = "S";
resp.data = result[0];

  } 

//console.log(JSON.stringify(resp.data));
res.json(resp);

  });
});


router.get('/byExpDuration/:duration', function(req, res) {
var db = req.db;
var duration =   req.params.duration;
var startDate = new Date(moment().startOf('day'));
var endDate = new Date(moment().add(duration, 'days').endOf('day'));

  var resp = {};
   //console.log("search vehicle request received");

  
db.query('select last_sms_dvp , sms_alert_no, sms_alert_no2, record_id,owner,registration_no,company_name ,company_id, ft_exp_dt, ft_exp_dt_txt, npa_exp_dt, npa_exp_dt_txt, tax_exp_dt, tax_exp_dt_txt,  npb_exp_dt, npb_exp_dt_txt from atms.vw_companyvehicle where (tax_exp_dt >= ? and tax_exp_dt <= ?) or (ft_exp_dt >= ? and ft_exp_dt <= ?) or (npa_exp_dt >= ? and npa_exp_dt <= ?) or (npb_exp_dt >= ? and npb_exp_dt <= ?)   order by company_id;',[startDate,endDate,startDate,endDate,startDate,endDate,startDate,endDate], function(err, result) {
if (err)  {
	  console.log(err);
  resp.status = "E";
  resp.details = err.toString();
  resp.code = err.code;
  }	  
  else  {
resp.status = "S";
resp.data = result;
   }
  
res.json(resp);
  
  }); // END DB QUERY

 
}); 


router.get('/search/:txt', function(req, res) {
var db = req.db;
var txt =  '%' + req.params.txt + '%';
  var resp = {};
   //console.log("search vehicle request received");

db.query('select record_id,owner,registration_no,permit_no,chassis_no,engine_no,  company_name from atms.tblVehicle where owner like ? or registration_no like ? or permit_no like ? or chassis_no like ? or engine_no like ? or company_name like ?',[txt,txt,txt,txt,txt,txt], function(err, result) {
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

 
});  // END ROUTER GET

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
	   sql = "select * from atms.tblVehicle where  ? and (noc <> 'YES' or noc is  null) order by registration_no asc" ;
	   param = {company_id:companyID};
   };
   
db.query(sql,param, function(err, result) {
  if (err)  {
	  console.log(err);
  resp.status = "E";
  resp.details = err.toString();
  resp.code = err.code;
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
   var errCode = null;
   var vehicle = req.body;
  // console.log("vehicle upsert received" + JSON.stringify(vehicle));
vehicle.apply_dt = (vehicle.apply_dt )? new Date(vehicle.apply_dt) : 0 ;
   vehicle.registration_dt = (vehicle.registration_dt )? new Date(vehicle.registration_dt) : 0 ;



    vehicle.dt_of_issue = (vehicle.dt_of_issue )? new Date(vehicle.dt_of_issue) : 0 ;
   vehicle.old_registration_dt = (vehicle.old_registration_dt )? new Date(vehicle.old_registration_dt) : 0 ;
   vehicle.insurance_upto = (vehicle.insurance_upto )? new Date(vehicle.insurance_upto) : 0 ;
 //console.log(JSON.stringify(vehicle));
var param = {company_name :vehicle.company_name , company_id :vehicle.company_id , state :vehicle.state.toUpperCase() , state_ref:vehicle.state_ref, registration_no :vehicle.registration_no , vehicle_description :vehicle.vehicle_description , seller :vehicle.seller , seller_address1 :vehicle.seller_address1 , seller_address2 :vehicle.seller_address2 , seller_Address :vehicle.seller_Address , seller_address4 :vehicle.seller_address4 , owner :vehicle.owner , owner_son_of :vehicle.owner_son_of , owner_permanent_address :vehicle.owner_permanent_address , owner_temporary_address :vehicle.owner_temporary_address , class_of_vehicle :vehicle.class_of_vehicle , makers_name :vehicle.makers_name , type_of_body :vehicle.type_of_body , model :vehicle.model , no_of_cylinders :vehicle.no_of_cylinders , chassis_no :vehicle.chassis_no , engine_no  :vehicle.engine_no  , fuel :vehicle.fuel , cubic_capacity :vehicle.cubic_capacity , wheel_base :vehicle.wheel_base , seating_capacity :vehicle.seating_capacity , unladen_weight :vehicle.unladen_weight , color :vehicle.color , hp :vehicle.hp , gross_vehicle_wt_manf :vehicle.gross_vehicle_wt_manf , gross_vehicle_wt_reg :vehicle.gross_vehicle_wt_reg , front_axle :vehicle.front_axle , rear_axle :vehicle.rear_axle , any_other_axle :vehicle.any_other_axle , tandem_axle :vehicle.tandem_axle ,  seller_address3 :vehicle.seller_address3 , hire_purchase_details :vehicle.hire_purchase_details , remarks :vehicle.remarks , public_private :vehicle.public_private , trailor_chassis_no :vehicle.trailor_chassis_no , payload :vehicle.payload , old_vehicle_no :vehicle.old_vehicle_no , old_state :vehicle.old_state , registration_dt :vehicle.registration_dt , old_registration_dt :vehicle.old_registration_dt , dt_of_issue :vehicle.dt_of_issue , noc :vehicle.noc , district :vehicle.district , noc_remark :vehicle.noc_remark,permit_no:vehicle.permit_no,insurance_upto:vehicle.insurance_upto , apply_dt:vehicle.apply_dt};
 var response = {};
 response.status = 'S';
var CheckDuplicateResult = [];
var sql1 = "select record_id, engine_no, registration_no, chassis_no from atms.tblVehicle where chassis_no =  ? or engine_no = ? or  registration_no = ?" ;
//console.log('---');
//console.log(vehicle.chassis_no + "--" , vehicle.engine_no);
var param1 = [vehicle.chassis_no, vehicle.engine_no, vehicle.registration_no]
db.query(sql1,param1, function(err, CheckDuplicateResult) { // CHECK DUPLICATE START
//console.log("RESULT OF CHECK DUPLICATE - " + JSON.stringify(CheckDuplicateResult));
if(CheckDuplicateResult.length > 0){ // CHECK NO_RESULT_FROM_QUERY
if(!vehicle.record_id){
response.status = "E";
response.code = "DUPLICATE_CHS_ENG_REG";
response.data = CheckDuplicateResult;
}else{
  if(CheckDuplicateResult.length == 1){
      if(CheckDuplicateResult[0].record_id != vehicle.record_id){
response.status = "E";
response.code = "DUPLICATE_CHS_ENG_REG";
response.data = CheckDuplicateResult;
      }
  }else{
response.status = "E";
response.code = "DUPLICATE_CHS_ENG_REG";
response.data = CheckDuplicateResult;
  }
  } 
  } // IF NO_RESULT_FROM_QUERY END

if(response.status == 'S'){

if(!vehicle.record_id){
  console.log("insert vehicle request received");
   db.query('INSERT INTO atms.tblVehicle SET ?', param, function(err, result) {
   
   /*if(err){
	errCode = (err.toString().indexOf("ER_DUP_ENTRY") > 0 && err.toString().indexOf('registration_no') > 0)? 'DUPLICATE_REGNO':null;
         } */
   res.send((err === null) ? { status: 'S' , recordID:result.insertId } : { status: 'E', details: err.toString() , code:err.code} );
    
});

}else{
db.query('UPDATE atms.tblVehicle SET ? WHERE record_id = ?', [param,vehicle.record_id], function(err, result) {
   /*if(err){
	errCode = (err.toString().indexOf("ER_DUP_ENTRY") > 0 && err.toString().indexOf('registration_no') > 0)? 'DUPLICATE_REGNO':null;
         }   */
   
   res.send((err === null) ? { status: 'S' , recordID:vehicle.record_id } : { status: 'E', details: err.toString() , code:err.code} );
    });

}

} else{
res.send (response);
}


}) ;// DUPLICATE CHECK END


   

 });


module.exports = router;