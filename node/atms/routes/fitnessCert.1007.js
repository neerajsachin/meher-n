var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  
  res.send('Fitness cert home page');
});

router.get('/byFitnessCertID/:ID', function(req, res) {
var db2 = req.db2;
var fitness_cert_id =  req.params.ID;
	
	var resp = {};
   console.log("get fitness cert from recordID  request received");
db2.query('select * from atms.tblFitnessCert where  ?',{fitness_cert_id:fitness_cert_id}, function(err, result) {
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


router.get('/byDate/:criteria,:fromDate,:toDate', function(req, res) {
var db2 = req.db2;
var criteria = req.params.criteria;
var fromDate = new Date(req.params.fromDate);
var toDate = new Date(req.params.toDate);
	var query = null;
	if(criteria == 'ApplyDate'){
	query = 	'select fitness_cert_id, registration_no,apply_dt, receipt_no,issue_dt , to_date, amount from atms.tblFitnessCert where apply_dt 	>= ? and  apply_dt <= ? order by registration_no asc';
	}
	if(criteria == 'IssueDate'){
	query = 'select fitness_cert_id, registration_no,apply_dt, receipt_no,issue_dt , to_date, amount from atms.tblFitnessCert where issue_dt 	>= ? and  issue_dt <= ? order by registration_no asc';	
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
}); //END ROUTER.GET byDate


router.get('/byVehicleID/:ID', function(req, res) {
var db2 = req.db2;
var vehicle_record_id =  req.params.ID;
	
	var resp = {};
   console.log("get fitness cert from recordID  request received");
db2.query('select * from atms.tblFitnessCert where  ? order by to_date desc',{vehicle_record_id:vehicle_record_id}, function(err, result) {
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
    var db2 = req.db2;
  
   var fitnessCert = req.body;
//0709.1
fitnessCert.apply_dt = (fitnessCert.apply_dt )? new Date(fitnessCert.apply_dt) : null ;
//0709.1
if(fitnessCert.from_date){
  fitnessCert.from_date = new Date(fitnessCert.from_date);
  fitnessCert.from_date_txt = fitnessCert.from_date.getDate() + "/" +( fitnessCert.from_date.getMonth() + 1 )+ "/" + fitnessCert.from_date.getFullYear();
}else{
  fitnessCert.from_date = null ;  
  fitnessCert.from_date_txt = null ;  
};

if(fitnessCert.to_date){
  fitnessCert.to_date = new Date(fitnessCert.to_date);
  fitnessCert.to_date_txt = fitnessCert.to_date.getDate() + "/" +( fitnessCert.to_date.getMonth() + 1 )+ "/" + fitnessCert.to_date.getFullYear();
}else{
  fitnessCert.to_date = null ; 
fitnessCert.to_date_txt = null ;   
};

if(fitnessCert.issue_dt){
  fitnessCert.issue_dt = new Date(fitnessCert.issue_dt);
  fitnessCert.issue_dt_txt = fitnessCert.issue_dt.getDate() + "/" +( fitnessCert.issue_dt.getMonth() + 1 )+ "/" + fitnessCert.issue_dt.getFullYear();
}else{
  fitnessCert.issue_dt = null ;
fitnessCert.issue_dt_txt = null ;  
};

var action = (fitnessCert.fitness_cert_id)?"update":"insert";
console.log("upsert fitness cert request . Action is - " + action);
if(action == 'update')
{upsertFitnessCert(db2,fitnessCert,action,function(resp1){
	res.send(resp1);
}); // END CALLBACK upsertFitnessCert
};

if(action == 'insert')
{
	
	validateCFUpTo(db2,fitnessCert.vehicle_record_id,fitnessCert.to_date,function(resp1){
		if(resp1.status == "E"){
		res.send(resp1);	
		}else{
		upsertFitnessCert(db2,fitnessCert,action,function(resp1){
	res.send(resp1);
		});	
		}
		
		
	}); // END CALL BACK validateCFUpTo
};

  
  
 }); // END ROUTER.POST 

function validateCFUpTo(db2,vehicle_record_id,to_date_entered,callback) {
	
	var resp = {}; 
	 resp.status = "S";
	db2.query('select ft_exp_dt,ft_exp_dt_txt, record_id from atms.tblVehicle where  ?',{record_id:vehicle_record_id}, function(err, result) {
	if (err){
	  resp.status = "E"; resp.msg = err;  console.log(err);
  }	
  if(result[0].ft_exp_dt >= to_date_entered){
	  resp.status = "E"; resp.msg = "CF is already avaible upto - " + result[0].ft_exp_dt_txt;
  }
	callback(resp);
	
	}); 
	
	
}// Fn validateCFUpTo END
 
 function upsertFitnessCert(db2,fitnessCert,action, callback){
	var resp = {};
	resp.status = "S";
	var param = {registration_no :fitnessCert.registration_no , vehicle_record_id :fitnessCert.vehicle_record_id , company_name :fitnessCert.company_name , company_id :fitnessCert.company_id , owner :fitnessCert.owner , from_date :fitnessCert.from_date , to_date :fitnessCert.to_date , receipt_no :fitnessCert.receipt_no , amount :fitnessCert.amount , authority :fitnessCert.authority , remarks :fitnessCert.remarks , issue_dt :fitnessCert.issue_dt , district :fitnessCert.district,from_date_txt:fitnessCert.from_date_txt,to_date_txt:fitnessCert.to_date_txt,issue_dt_txt:fitnessCert.issue_dt_txt,apply_dt:fitnessCert.apply_dt};
	
	if(action == 'insert'){
		 console.log("insert fitness cert request received");
	   db2.query('INSERT INTO atms.tblFitnessCert SET ?', param, function(err, result) {
   resp = (err === null) ? { status: 'S' , fitness_cert_id:result.insertId } : { status: "E", msg: err} ;
callback(resp);
    });	 
	 }else{
		 console.log("update fitness cert request received ,fitness_cert_id = " + fitnessCert.fitness_cert_id);
	   db2.query('UPDATE atms.tblFitnessCert SET ? WHERE fitness_cert_id = ?', [param,fitnessCert.fitness_cert_id], function(err, result) {
   resp = (err === null) ? { status: 'S' , fitness_cert_id:fitnessCert.fitness_cert_id } : { status: "E", msg: err } ;
callback(resp);
	}); 
	 }
	   
} //END upsertFitnessCert
 
 
  router.post('/updateReceiptNo', function(req, res) {
    var db2 = req.db2;
	 var resp = {};
	 resp.status = "S";
   var fitnessCert = req.body;
   fitnessCert.issue_dt = (fitnessCert.issue_dt)?new Date(fitnessCert.issue_dt):null;
    var param = {receipt_no :fitnessCert.receipt_no ,  issue_dt :fitnessCert.issue_dt};
	
db2.query('UPDATE atms.tblFitnessCert SET ? WHERE fitness_cert_id = ?' , [param,fitnessCert.fitness_cert_id], function(err, result) {
	
   resp = (err === null) ? { status: 'S'} : { status: 'E', details : err.toString(), code : err.code } ;
  res.send(resp);  
});   

 
 }); //END POST updateReceiptNo
 
 
 
module.exports = router;