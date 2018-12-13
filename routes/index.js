var express = require('express');
var router = express.Router();
var bcrypt=require('bcryptjs');
var mysql=require('mysql');
var dbconfig=require('../config/db');
var connetion=mysql.createConnection(dbconfig.connection);
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});
//post request to add a company
router.post('/addcompany',function(req,res){
 let company_name=req.body.name;
 let address=req.body.address;
 let lat=req.body.latitude;
 let long=req.body.longitude;
 let person=req.body.person;
 let person_email=req.body.person_email;
 let company_landline=req.body.company_landline;
 let alternate_number=req.body.alternate_number;
 let person_contact=req.body.person_contact;
 let role=req.body.role;
 let logo=req.body.logo;
 let registered_email=req.body.registered_email;
 let registered_number=req.body.registered_number;
 let password=req.body.password;
 let password2=req.body.password2;
 let asset_management_rates=req.body.asset_management_rates;
 let free_subscription=req.body.free_subscription;
 let billing_cycle=req.body.billing_cycle;
 let billing_day=req.body.billing_day;
 let equipshare_charges=req.body.equipshare_charges;
 let credit_limit=req.body.credit_limit;
 let contract_details=req.body.contract_details;
 let penalty_clause=req.body.penalty_clause;
 let terms=req.body.terms;
 let gstin=req.body.gstin;
 let tin=req.body.tin;
 let contract='contract path';
 let penalty='penalty path';
 let terms_file='terms file path';

  req.checkBody('name','Company Name cannot be empty').notEmpty();
  req.checkBody('address','address cannot be empty').notEmpty();
  req.checkBody('person','person cannot be empty').notEmpty();
  req.checkBody('person_email','person_email cannot be empty').notEmpty();
  req.checkBody('person_email', "Enter a valid email").isEmail();
  req.checkBody('company_landline','company_landline cannot be empty').notEmpty();
  req.checkBody('person_contact','person_contact cannot be empty').notEmpty();
  req.checkBody('role','role cannot be empty').notEmpty();
  req.checkBody('logo','logo cannot be empty').notEmpty();
  req.checkBody('registered_email','registered_email cannot be empty').notEmpty();
  req.checkBody('registered_email', "Enter a valid email").isEmail();
  req.checkBody('registered_number','registered_number cannot be empty').notEmpty();
  req.checkBody('password','password cannot be empty').notEmpty();
  req.checkBody('password2','password2 cannot be empty').notEmpty();
  req.checkBody('password', 'Passwords do not match').equals(password2);
  req.checkBody('asset_management_rates','asset_management_rates cannot be empty').notEmpty();
  req.checkBody('free_subscription','free_subscription cannot be empty').notEmpty();
  req.checkBody('billing_cycle','billing_cycle cannot be empty').notEmpty();
  req.checkBody('billing_day','billing_day cannot be empty').notEmpty();
  req.checkBody('equipshare_charges','equipshare_charges cannot be empty').notEmpty();
  req.checkBody('gstin','gst cannot be empty').notEmpty();
  req.checkBody('tin','tin cannot be empty').notEmpty();
  req.checkBody('credit_limit','credit_limit cannot be empty').notEmpty();
  let errors=req.validationErrors();
  if(errors) res.json({
    error:errors
  });
  else{
    let newCompany=({
      company_name:company_name,
      address:address,
      lat:lat,
      long:long,
      person:person,
      person_email:person_email,
      company_landline:company_landline,
      alternate_number:alternate_number,
      person_contact:person_contact,
      role:role,
      logo:logo,
      registered_email:registered_email,
      registered_number:registered_number,
      password:password,
      asset_management_rates:asset_management_rates,
      free_subscription:free_subscription,
      billing_cycle:billing_cycle,
      billing_day:billing_day,
      equipshare_charges:equipshare_charges,
      credit_limit:credit_limit,
      contract_details:contract_details,
      penalty_clause:penalty_clause,
      terms:terms,
      gstin:gstin,
      tin:tin,
      contract:contract,
      penalty:penalty,
      terms_file:terms_file
      });

      let user_check_query=`select * from company_login where email='${newCompany.registered_email}'`;
      console.log(user_check_query);
      connetion.query(user_check_query,function(err,result){
        if(err) throw err;
        if(!result.length<=0)
           {console.log(result);
            res.json({msg:'Company Already Registered'});
           }
        else{
           bcrypt.genSalt(10,function(err,salt){
             if(err) throw err;
             bcrypt.hash(newCompany.password,salt,function(err,hash){
               if(err) throw err;
               newCompany.password=hash;
               let createCompanyQuery=`insert into company_info(name,address,latitude,longitude,company_person_name,person_email,company_landline,alternate_number,person_contact,role,logo) values('${newCompany.company_name}','${newCompany.address}','${newCompany.lat}','${newCompany.long}','${newCompany.person}','${newCompany.person_email}','${newCompany.company_landline}','${newCompany.alternate_number}','${newCompany.person_contact}','${newCompany.role}','${newCompany.logo}')`;
               console.log(createCompanyQuery);
               connetion.query(createCompanyQuery,function(err,result){
                 if(err) throw err;
                 console.log("Company Created "+result.message+result.warningCount+result.affectedRows);
                 let createLoginQuery=`insert into company_login(email,reg_number,password,company_id) values('${newCompany.registered_email}','${newCompany.registered_number}','${newCompany.password}',(select company_id from company_info where name='${newCompany.company_name}'))`;
                 console.log(newCompany);
                 console.log(createLoginQuery);
                 connetion.query(createLoginQuery,function(err,result){
                    if(err){console.log(err);throw err;}
                    console.log("Company Login Created "+result.message+result.warningCount+result.affectedRows);
                    let commercialDetailsQuery=`insert into commercial_details(asset_manage_rate,free_subscription,billing_cycle,billing_day,equipshare_charges,credit_limit,contract_details,penalty_clause,terms,gst_no,tin,company_id) values('${newCompany.asset_management_rates}','${newCompany.free_subscription}','${newCompany.billing_cycle}','${newCompany.billing_day}','${newCompany.equipshare_charges}','${newCompany.credit_limit}','${newCompany.contract_details}','${newCompany.penalty_clause}','${newCompany.terms}','${newCompany.gstin}','${newCompany.tin}',(select company_id from company_info where name='${newCompany.company_name}'))`;
                   console.log(commercialDetailsQuery);
                    connetion.query(commercialDetailsQuery,function(err,result){
                      if(err){console.log(err);throw err;}
                      console.log("Company Commercial Details Created "+result.message+result.warningCount+result.affectedRows);
                      res.json({msg:'Company created'});
                    });
                 });
               });
             });
           }); 
         }   
      });
    }
});
module.exports = router;
