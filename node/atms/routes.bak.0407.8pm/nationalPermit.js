var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  
  res.send('national permit home page');
});

router.get('/byRecordID/:ID', function(req, res) {
var db = req.db;
var national_permit_id =  req.params.ID;
	
	var resp = {};
   console.log("get national permit from recordID  request received");
db.query('select * from atms.tblNtlPermit where  ?',{national_permit_id:national_permit_id}, function(err, result) {
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
   console.log("get national permit from vehicle  request received");
db.query('select * from atms.tblNtlPermit where  ?',{vehicle_record_id:vehicle_record_id}, function(err, result) {
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
  
   var nationalPermit = req.body;
   console.log("Nation Permit Object received" + JSON.stringify(nationalPermit));

if(nationalPermit.to_date){
nationalPermit.to_date = new Date(nationalPermit.to_date);
nationalPermit.to_date_txt = nationalPermit.to_date.getDate() + "/" +( nationalPermit.to_date.getMonth() + 1 )+ "/" + nationalPermit.to_date.getFullYear();
}else{

  nationalPermit.to_date = 0;
  nationalPermit.to_date_txt = null;  
};


  if(nationalPermit.from_date){
  nationalPermit.from_date = new Date(nationalPermit.from_date);
  nationalPermit.from_date_txt = nationalPermit.from_date.getDate() + "/" +( nationalPermit.from_date.getMonth() + 1 )+ "/" + nationalPermit.from_date.getFullYear();
}else{
  nationalPermit.from_date = 0 ;  
  nationalPermit.from_date_txt = null;
};



if(nationalPermit.from_date_b){
  nationalPermit.from_date_b = new Date(nationalPermit.from_date_b);
  nationalPermit.from_date_b_txt = nationalPermit.from_date_b.getDate() + "/" +( nationalPermit.from_date_b.getMonth() + 1 )+ "/" + nationalPermit.from_date_b.getFullYear();
}else{
 nationalPermit.from_date_b = 0 ;  
 nationalPermit.from_date_b_txt = null;
};

if(nationalPermit.to_date_b){
  nationalPermit.to_date_b = new Date(nationalPermit.to_date_b);
  nationalPermit.to_date_b_txt = nationalPermit.to_date_b.getDate() + "/" +( nationalPermit.to_date_b.getMonth() + 1 )+ "/" + nationalPermit.to_date_b.getFullYear();
}else{
  nationalPermit.to_date_b = 0 ; 
  nationalPermit.to_date_b_txt = null; 
};

if(nationalPermit.issue_dt){
  nationalPermit.issue_dt = new Date(nationalPermit.issue_dt);
  nationalPermit.issue_dt_txt = nationalPermit.issue_dt.getDate() + "/" +( nationalPermit.issue_dt.getMonth() + 1 )+ "/" + nationalPermit.issue_dt.getFullYear();
}else{
  nationalPermit.issue_dt = 0 ;  
nationalPermit.issue_dt_txt = null;
};

if(nationalPermit.payment_date_state){
  nationalPermit.payment_date_state = new Date(nationalPermit.payment_date_state);
  
}else{
  nationalPermit.payment_date_state = 0 ;  
nationalPermit.payment_date_state_txt = null;
};

if(nationalPermit.payment_date_national){
  nationalPermit.payment_date_national = new Date(nationalPermit.payment_date_national);
  
}else{
  nationalPermit.payment_date_national = 0 ;  
nationalPermit.payment_date_national_txt = null;
};

 var action = (nationalPermit.national_permit_id)?"update":"insert";
console.log("upsert national permit request . Action is - " + action);  
if (action == 'update'){
	upsertNationalPermit(db,nationalPermit,action,function(resp1){
	res.send(resp1);	
	});
} //END IF ACTION = INSERT;

if(action == 'insert')
{
	
	validate_NPA_NPB_UpTo(db,nationalPermit.vehicle_record_id,nationalPermit.to_date,nationalPermit.to_date_b,function(resp1){
		if(resp1.status == "E"){
		res.send(resp1);	
		}else{
		upsertNationalPermit(db,nationalPermit,action,function(resp1){
	res.send(resp1);
		});	
		}
		
		
	}); // END CALL BACK validateCFUpTo
};
 



 }); // END ROUTER POST
 
 
function upsertNationalPermit(db,nationalPermit,action,callback){
var resp = {};
resp.status = "S";
var param = {registration_no : nationalPermit.registration_no,vehicle_record_id  : nationalPermit.vehicle_record_id ,from_date  : nationalPermit.from_date ,to_date  : nationalPermit.to_date ,permit_no  : nationalPermit.permit_no ,issue_dt  : nationalPermit.issue_dt ,authority  : nationalPermit.authority ,from_date_b  : nationalPermit.from_date_b ,to_date_b  : nationalPermit.to_date_b ,national_amount  : nationalPermit.national_amount ,state_amount   : nationalPermit.state_amount  ,particulars_state   : nationalPermit.particulars_state ,particulars_national   : nationalPermit.particulars_national ,payment_date_state  : nationalPermit.payment_date_state ,payment_date_national  : nationalPermit.payment_date_national ,company_name  : nationalPermit.company_name ,company_id  : nationalPermit.company_id ,owner  : nationalPermit.owner ,remarks  : nationalPermit.remarks,from_date_txt  : nationalPermit.from_date_txt ,to_date_txt  : nationalPermit.to_date_txt, from_date_b_txt  : nationalPermit.from_date_b_txt ,to_date_b_txt  : nationalPermit.to_date_b_txt,issue_dt_txt  : nationalPermit.issue_dt_txt};
	 if(action == 'insert'){
		 console.log("insert national permit request received1");
	   db.query('INSERT INTO atms.tblNtlPermit SET ?', param, function(err, result) {
	  resp = (err === null) ? { status: 'S' , national_permit_id:result.insertId } : { status: "E", msg: err} ;
callback(resp);

	   });	 
	 }else{
		 console.log("update national permit request received, national_permit_id = " + nationalPermit.national_permit_id );
	   db.query('UPDATE atms.tblNtlPermit SET ? WHERE national_permit_id = ?', [param,nationalPermit.national_permit_id ], function(err, result) {
	   	if(err){console.log(err);}
   resp = (err === null) ? { status: 'S' , national_permit_id:nationalPermit.national_permit_id } : { status: "E", msg: err } ;
callback(resp);
	   });
		 
	 }
	
	
}

 function validate_NPA_NPB_UpTo(db,vehicle_record_id,to_date_a_entered,to_date_b_entered,callback){
	var resp = {}; 
	 resp.status = "S";
	 resp.msg = '';
	db.query('select npa_exp_dt,npa_exp_dt_txt,npb_exp_dt,npb_exp_dt_txt, record_id from atms.tblVehicle where  ?',{record_id:vehicle_record_id}, function(err, result) {
	if (err){
	  resp.status = "E"; resp.msg = err;  console.log(err);
  }	
  if(result[0].npa_exp_dt >= to_date_a_entered){
	  resp.status = "E"; resp.msg = "NP(A) is already available upto - " + result[0].npa_exp_dt_txt;
  }
  if(result[0].npb_exp_dt >= to_date_b_entered && to_date_b_entered != 0 ){
	  resp.status = "E"; resp.msg = resp.msg + "NP(B) is already available upto - " + result[0].npb_exp_dt_txt;
  }
  
	callback(resp);
	
	}); 
	 
 } // END validate_NPA_NPB_UpTo


module.exports = router;