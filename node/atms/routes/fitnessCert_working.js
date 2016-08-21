var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  
  res.send('Fitness cert home page');
});

router.get('/byFitnessCertID/:ID', function(req, res) {
var db = req.db;
var fitness_cert_id =  req.params.ID;
	
	var resp = {};
   console.log("get fitness cert from recordID  request received");
db.query('select * from atms.tblFitnessCert where  ?',{fitness_cert_id:fitness_cert_id}, function(err, result) {
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
   console.log("get fitness cert from recordID  request received");
db.query('select * from atms.tblFitnessCert where  ? order by to_date desc',{vehicle_record_id:vehicle_record_id}, function(err, result) {
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
  
   var fitnessCert = req.body;


if(fitnessCert.from_date){
  fitnessCert.from_date = new Date(fitnessCert.from_date);
  fitnessCert.from_date_txt = fitnessCert.from_date.getDate() + "/" +( fitnessCert.from_date.getMonth() + 1 )+ "/" + fitnessCert.from_date.getFullYear();
}else{
  fitnessCert.from_date = 0 ;  
};

if(fitnessCert.to_date){
  fitnessCert.to_date = new Date(fitnessCert.to_date);
  fitnessCert.to_date_txt = fitnessCert.to_date.getDate() + "/" +( fitnessCert.to_date.getMonth() + 1 )+ "/" + fitnessCert.to_date.getFullYear();
}else{
  fitnessCert.to_date = 0 ;  
};

if(fitnessCert.issue_dt){
  fitnessCert.issue_dt = new Date(fitnessCert.issue_dt);
  fitnessCert.issue_dt_txt = fitnessCert.issue_dt.getDate() + "/" +( fitnessCert.issue_dt.getMonth() + 1 )+ "/" + fitnessCert.issue_dt.getFullYear();
}else{
  fitnessCert.issue_dt = 0 ;  
};


   
     var param = {registration_no :fitnessCert.registration_no , vehicle_record_id :fitnessCert.vehicle_record_id , company_name :fitnessCert.company_name , company_id :fitnessCert.company_id , owner :fitnessCert.owner , from_date :fitnessCert.from_date , to_date :fitnessCert.to_date , receipt_no :fitnessCert.receipt_no , amount :fitnessCert.amount , authority :fitnessCert.authority , remarks :fitnessCert.remarks , issue_dt :fitnessCert.issue_dt , district :fitnessCert.district,from_date_txt:fitnessCert.from_date_txt,to_date_txt:fitnessCert.to_date_txt,issue_dt_txt:fitnessCert.issue_dt_txt};

	 if(!fitnessCert.fitness_cert_id){
		 console.log("insert fitness cert request received");
	   db.query('INSERT INTO atms.tblFitnessCert SET ?', param, function(err, result) {
   res.send((err === null) ? { status: 'S' , fitness_cert_id:result.insertId } : { status: err } );
    });	 
	 }else{
		 console.log("update fitness cert request received ,fitness_cert_id = " + fitnessCert.fitness_cert_id);
	   db.query('UPDATE atms.tblFitnessCert SET ? WHERE fitness_cert_id = ?', [param,fitnessCert.fitness_cert_id], function(err, result) {
   res.send((err === null) ? { status: 'S' , fitness_cert_id:fitnessCert.fitness_cert_id } : { status: err } );
    }); 
	 }
   

 }); // END ROUTER.POST 

function upsertFitnessCert(db,fitnessCert,action, callback){
	var resp = {};
	resp.status = "S";
	var param = {registration_no :fitnessCert.registration_no , vehicle_record_id :fitnessCert.vehicle_record_id , company_name :fitnessCert.company_name , company_id :fitnessCert.company_id , owner :fitnessCert.owner , from_date :fitnessCert.from_date , to_date :fitnessCert.to_date , receipt_no :fitnessCert.receipt_no , amount :fitnessCert.amount , authority :fitnessCert.authority , remarks :fitnessCert.remarks , issue_dt :fitnessCert.issue_dt , district :fitnessCert.district,from_date_txt:fitnessCert.from_date_txt,to_date_txt:fitnessCert.to_date_txt,issue_dt_txt:fitnessCert.issue_dt_txt};
	
	if(action == 'insert'){
		 console.log("insert fitness cert request received");
	   db.query('INSERT INTO atms.tblFitnessCert SET ?', param, function(err, result) {
   resp = (err === null) ? { status: 'S' , fitness_cert_id:result.insertId } : { status: "E", msg: err} ;
   
    });	 
	 }else{
		 console.log("update fitness cert request received ,fitness_cert_id = " + fitnessCert.fitness_cert_id);
	   db.query('UPDATE atms.tblFitnessCert SET ? WHERE fitness_cert_id = ?', [param,fitnessCert.fitness_cert_id], function(err, result) {
   resp = (err === null) ? { status: 'S' , fitness_cert_id:fitnessCert.fitness_cert_id } : { status: "E", msg: err } ;
    }); 
	 }
	callback(resp);
} //END upsertFitnessCert
 
module.exports = router;