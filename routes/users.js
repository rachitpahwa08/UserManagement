var express = require('express');
var router = express.Router();
var bcrypt=require('bcryptjs');
var mysql=require('mysql');
var jwt=require('jsonwebtoken');
var dbconfig=require('../config/db');
var connetion=mysql.createConnection(dbconfig.connection);
var secret='secretkey';
/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post('/addcompanyadmin',isAuthenticated,function(req,res){
  if(res.locals.admin){
    let admin_name=req.body.admin_name;
  let admin_email=req.body.admin_email;
  let admin_contact=req.body.admin_contact;
  let admin_password=req.body.password;
  let company_name=req.body.company_name;
  let password2=req.body.password2;
  req.checkBody('admin_name','admin_name cannot be empty').notEmpty();
  req.checkBody('admin_email','admin_email cannot be empty').notEmpty();
  req.checkBody('admin_email', "Enter a valid email").isEmail();
  req.checkBody('admin_password','admin_password cannot be empty').notEmpty();
  req.checkBody('admin_contact','admin_contact cannot be empty').notEmpty();
  req.checkBody('commpany_name','commpany_name cannot be empty').notEmpty();
  req.checkBody('password2','password2 cannot be empty').notEmpty();
  req.checkBody('admin_password', 'Passwords do not match').equals(password2);
  let errors=req.validationErrors();
   if(errors) res.json({
     error:errors
    });
   else{
    let newAdmin=({
      admin_name:admin_name,
      admin_email:admin_email,
      admin_contact:admin_contact,
      admin_password:admin_password,
      company_name:company_name
    });
  
    bcrypt.genSalt(10,function(err,salt){
        if(err) throw err;
        bcrypt.hash(newAdmin.admin_password,salt,function(err,hash){
          if(err) throw err;
          newAdmin.admin_password=hash;
          let createAdminQuery=`insert into company_users(user_name,user_email,user_contact,company_id,password) values('${newAdmin.admin_name}','${newAdmin.admin_email}','${newAdmin.admin_contact}',(select company_id from company_info where name='${newAdmin.company_name}'),'${newAdmin.admin_password}')`;
          connetion.query(createAdminQuery,function(err,result){
            if(err){console.log(err); throw err;}
            console.log("User Created "+result.message+result.warningCount+result.affectedRows);
            let setAdminQuery=`insert into company_admins values((select company_id from company_info where name='${newAdmin.company_name}'),(select user_id from company_users where user_email='${newAdmin.admin_email}'))`;
            connetion.query(setAdminQuery,function(err,result){
              if(err){console.log(err);throw err;}
              console.log("Admin Created "+result.message+result.warningCount+result.affectedRows);
              res.json({
                msg:'Admin Created'
              });
            });
          });
        });
    });
   }

  }
  else{
    res.json({msg:'Not Authorized'});
  }
});
router.post('/assignadmin',isAuthenticated,function(req,res){
 if(res.locals.admin){
  let email=req.body.email;

  let assignAdminQuery=`insert into company_admins values((select company_id from company_users where user_email='${email}'),(select user_id from company_users where user_email='${email}'))`;
  connetion.query(assignAdminQuery,function(err,result){
      if(err){console.log(err);throw err;}
      console.log("Admin Created "+result.message+result.warningCount+result.affectedRows);
      res.json({
        msg:'admin assigned'
      });
  });
 }
 else{
  res.json({
    msg:'Not Authorized'
  });
 }
});

router.post('/addcompanyuser',isAuthenticated,function(req,res){

  console.log(res.locals);
  if(res.locals.admin){
    let user_name=req.body.user_name;
    let user_email=req.body.user_email;
    let user_contact=req.body.user_contact;
    let user_password=req.body.password;
    let company_name=req.body.company_name;
    let password2=req.body.password2;
    let newUser=({
      user_name:user_name,
      user_email:user_email,
      user_contact:user_contact,
      user_password:user_password,
      company_name:company_name
    });
    bcrypt.genSalt(10,function(err,salt){
      if(err) throw err;
      bcrypt.hash(newUser.user_password,salt,function(err,hash){
        if(err) throw err;
        newUser.user_password=hash;
        let createAdminQuery=`insert into company_users(user_name,user_email,user_contact,company_id,password) values('${newUser.user_name}','${newUser.user_email}','${newUser.user_contact}',(select company_id from company_info where name='${newUser.company_name}'),'${newUser.user_password}')`;
        connetion.query(createAdminQuery,function(err,result){
          if(err){console.log(err); throw err;}
          console.log("User Created "+result.message+result.warningCount+result.affectedRows);
          res.json({
            msg:'User Created'
          });
        });
      });
  });
  }
 else{
   res.json({
     msg:'Not Authorized'
   });
 }
});
router.post('/login',function(req,res){
  let username=req.body.username;
  let password=req.body.password;
  req.checkBody('username', 'please enter a valid username').isEmail();
  req.checkBody('password', 'please enter a valid password').notEmpty();

  let errors=req.validationErrors();
  if (errors) res.json({error:errors});
  else{
    let loginQuery=`select * from company_users where user_email='${username}'`;
    connetion.query(loginQuery,function(err,result){
        if(err){console.log(err);throw err;}
        console.log(result);
       
        if(result.length<=0) res.json({error:'no user with this username found'});
      else{
        bcrypt.compare(password,result[0].password,function(err,isMatch){
          if(err){console.log(err);throw err;}
          else{
            if(!isMatch) res.json({error:'Password does not match'});
            else{
              let user_id=result[0].user_id;
              let company_id=result[0].company_id;
              let checkAdminQuery=`select * from company_admins where user_id='${result[0].user_id}' and company_id='${result[0].company_id}'`;
              connetion.query(checkAdminQuery,function(err,result){
                  if(err){console.log(err);throw err;}
                  else{
                      if(result.length<=0){
                        val=({
                          user_id:user_id,
                          company_id:company_id,
                          admin:false
                            });
                         }
                       else{
                         val=({
                         user_id:user_id,
                         company_id:company_id,
                         admin:true
                        });
                        }
                        jwt.sign(val,secret,function(err,token){
                        if(err) console.log("jwt error:=> "+err);
                        else{
                          res.json({
                            msg:'Login Successful',
                            token:token
                          });
                         }
                  });
                 }
              });
            
           }
          }
        });
      }
    });
  }
});
router.post('/addsite',isAuthenticated,function(req,res){
 console.log(res.locals);
  if(res.locals.admin)
  {
    let site_name=req.body.site_name;
    let site_lat=req.body.site_lat;
    let site_long=req.body.site_long;
    let site_address=req.body.site_address;
    let site_pincode=req.body.site_pincode;
    let company_name=req.body.company_name;

    req.checkBody('site_name','site_name cannot be empty').notEmpty();
    req.checkBody('site_lat','site_lat cannot be empty').notEmpty();
    req.checkBody('site_long','site_long cannot be empty').notEmpty();
    req.checkBody('site_address','site_address cannot be empty').notEmpty();
    req.checkBody('site_pincode','site_pincode cannot be empty').notEmpty();
    req.checkBody('company_name','company_name cannot be empty').notEmpty();

    let errors=req.validationErrors();
    if (errors) res.json({error:errors});
    else{
        let companyCheck=`select company_id from company_info where name='${company_name}'`;
        connetion.query(companyCheck,function(err,result){
          if(err){console.log(err);throw err;}
          if(result.length<=0){res.json({msg:'No company with this name is registered'});}
          else{ 
              console.log("result"+result[0]);  
              let company_id=result[0].company_id; 
             let createSiteQuery=`insert into site(site_name,lat,longitude,site_address,pincode,company_id) values('${site_name}','${site_lat}','${site_long}','${site_address}','${site_pincode}','${company_id}')`;
              connetion.query(createSiteQuery,function(err,result){
              if(err){console.log(err);throw err;}
              console.log("Site Created "+result.message+result.warningCount+result.affectedRows);
              res.json({
                msg:'Site Created'
              });
              });
            }
        });
      } 
  }
  else{
    res.json({
      msg:'Not Authorized'
    });
  }
});
function isAuthenticated(req, res, next){
  if(req.headers['authorization']){
      jwt.verify(req.headers['authorization'], secret, function(err, decoded){
          if(err){
              console.log(err);
              res.json({error:err});
          }
          res.locals.userId = decoded.user_id;
          res.locals.companyId=decoded.company_id;
          res.locals.admin=decoded.admin;
          console.log("calling next now and " + res.locals.userId+" "+res.locals.companyId);
          return next();
      });
  }else{
      res.json({
          success:false,
          auth:false,
          msg:"token missing"
      });
  }
}
module.exports = router;
