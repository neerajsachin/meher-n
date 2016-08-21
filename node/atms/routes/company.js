var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  
  res.send('company');
});

router.get('/byCompanyID/:companyID', function(req, res) {
var db = req.db;
	var companyID =  req.params.companyID;
	var resp = {};
	var param = {company_id:companyID}
   console.log("get company by id  request received , ID :-" + companyID);
db.query('select * from atms.tblCompany where ?',param, function(err, result) {
  if (err)
  {
	  console.log(err);
	  resp.status = "E";
resp.statusMsg = err;
  }	 else{
resp.status = "S";
resp.data = result[0];
	  
  } 
 
  
res.json(resp);
  
  });
   
});

router.get('/search/:txt', function(req, res) {
var db = req.db;
var txt =  '%' + req.params.txt + '%';
  var resp = {};
   console.log("search company request received");

db.query('select company_name,company_id,contact_person1,address_city,mobile1,  sms_alert_no from atms.tblcompany where company_name like ? or contact_person1 like ? or address_city like ? or mobile1 like ? or sms_alert_no like ?',[txt,txt,txt,txt,txt], function(err, result) {
  if (err)  {
    console.log(err);
        resp.status = "E";
resp.code = err.code;
resp.details =  err.toString();

  }   else{
resp.status = "S";
resp.data = result;
  }
 
res.json(resp);
  
  }); // END DB QUERY
}); // END SEARCH GET ROUTER



router.get('/allCompanies', function(req, res) {
var db = req.db;
	
	var resp = {};
   console.log("get all companies  request received");
db.query('select * from atms.tblCompany', function(err, result) {
  if (err)
  {
	  console.log(err);
  }	  
 
  
resp.status = "S";
resp.dataList = result;
res.json(resp);
  
  });
   
});

router.post('/upsert', function(req, res) {
    var db = req.db;
 console.log("create company request received");
   var company = req.body;	
   var param = {company_name : company.company_name,contact_person1 : company.contact_person1,contact_person2 : company.contact_person2,contact_person3 : company.contact_person3,email : company.email,email2 : company.email2,address_line_1 : company.address_line_1,address_line_2 : company.address_line_2,address_line_3 : company.address_line_3,address_city: company.address_city, address_zip : company.address_zip,telephone: company.telephone, mobile1 : company.mobile1 ,mobile2 : company.mobile2,mobile3 : company.mobile3, sms_alert_no : company.sms_alert_no,sms_alert_no2 : company.sms_alert_no2, doc_validity : company.doc_validity};

   if(company.company_id){
   db.query('UPDATE atms.tblCompany SET ? WHERE company_id = ?', [param,company.company_id], function(err, result) {
   res.send((err === null) ? { status: 'S' , company_id:company.company_id } : { status: err } );
    });


   }else{

db.query('INSERT INTO atms.tblCompany SET ?', param, function(err, result) {

   if (err)
  {
    console.log(err);
  }   
 
  res.send(
            (err === null) ? { status: 'S' , company_id:result.insertId } : { status: errMsg }
        );
  
  
});

   }
   


 });


module.exports = router;