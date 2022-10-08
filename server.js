var express = require('express');
var app = express();
const ejs = require('ejs');
var env = require('dotenv').config()
var path = require('path');
const bodyParser = require('body-parser');
var mongoose = require('mongoose');
var session = require('express-session');
var User = require('./models/user')
var Resource= require('./models/resource')
const flash = require('connect-flash');
const bcrypt=require('bcrypt');
var session = require('express-session');
var MongoStore = require('connect-mongo');
var sessionId=0;


mongoose.connect('mongodb+srv://crystalcoaching:crystalcoaching@cluster0.avwtk4p.mongodb.net/?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}, (err) => {
  if (!err) {
    console.log('MongoDB Connection Succeeded.');
  } else {
    console.log('Error in DB connection : ' + err);
  }
});

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
});


app.use(session({
secret: 'crystal coaching',
resave: true,
saveUninitialized: false,
maxAge  : new Date(Date.now() + 900000), //1 Hour
expires : new Date(Date.now() + 900000), //1 Hour
store: MongoStore.create({
        mongoUrl:'mongodb+srv://crystalcoaching:crystalcoaching@cluster0.avwtk4p.mongodb.net/?retryWrites=true&w=majority'
})
}));

app.use(flash());

// set the view engine to ejs
app.set('view engine', 'ejs');

app.use('/views', express.static('views'));
app.use('/assets', express.static('assets'));
app.use('/Doc', express.static('Doc'));
// use res.render to load up an ejs view file

// index page
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static(__dirname + '/views'));

app.get('/', function(req, res,next) {
res.render('pages/index', {sessionId:sessionId});
});

app.get('/about', function(req, res) {
if(req.session.userId!=undefined)
sessionId=req.session.userId;
res.render('pages/about', {sessionId:sessionId});
});

app.get('/register', function(req, res) {
if(req.session.userId!=undefined)
sessionId=req.session.userId;
res.render('pages/register', {sessionId:sessionId});
});

app.get('/login', function(req, res) {
if(req.session.userId!=undefined)
sessionId=req.session.userId;
res.render('pages/login', {sessionId:sessionId});
});

// app.get('/error', function(req, res) {
// if(req.session.userId!=undefined)
// sessionId=req.session.userId;
// res.render('pages/error', {sessionId:sessionId});
// });

app.get('/admin', function(req, res) {
if(req.session.userId!=undefined)
sessionId=req.session.userId;
User.find({}, (err,items) => {
        if(err) {
                console.log(err);
                return res.render('pages/error', {message: "Internal error, please try later"})
        }
        else {
                if(req.session.userId==1)
                {
                        items.sessionId=sessionId;
                        res.render('pages/admin', {items:items});
                }    
                else
                return res.render('pages/error', {message: "Authentication denied"})

        }
})
});

app.get('/upload', function(req, res) {
var upload=0;
if(req.session.userId!=undefined)
{
        sessionId=req.session.userId;
        res.render('pages/upload', {sessionId:sessionId});
} else {
        console.log("You cant access this page");
        res.render('pages/index', {sessionId:sessionId});
}
});

// Registration post
app.post('/register', function(req, res, next) {
  var personInfo = req.body;
  if(!personInfo.phone || !personInfo.email || !personInfo.password || !personInfo.passwordconf){
          res.send();
  } else {
          if (personInfo.password == personInfo.passwordconf) {
                  User.findOne({phone:personInfo.phone}, function(err,data){
                          if(!data){
                                  var c;
                                  User.findOne({},function(err,data){

                                          if (data) {
                                                  c = data.unique_id + 1;
                                          }else{
                                                  c=1;
                                          }
                                        
                                        personInfo.password = bcrypt.hashSync(personInfo.password,10);
                                        // console.log(personInfo.password);
                                        var newPerson = new User({
                                                unique_id:c,
                                                firstname: personInfo.firstname,
                                                lastname: personInfo.lastname,
                                                fathername: personInfo.fathername,
                                                mothername: personInfo.mothername,
                                                XIIyear: personInfo.year,
                                                medium: personInfo.medium,
                                                aspirant:personInfo.aspirant,
                                                schoolname: personInfo.schoolname,
                                                street: personInfo.street,
                                                locality: personInfo.locality,
                                                pincode: personInfo.pincode,
                                                district: personInfo.district,
                                                phone: personInfo.phone,
                                                password: personInfo.password,
                                                passwordconf:personInfo.passwordconf,
                                                email: personInfo.email
                                        });

                                          newPerson.save(function(err, Person){
                                                  if(err)
                                                          console.log(err);
                                                  else
                                                          console.log('Data saved');
                                          });

                                  }).sort({_id: -1}).limit(1);
                                  res.redirect("/login");
                          }else{
                                  return res.render('pages/error', {message: "Registration denied because Phone number is already registered"})
                          }

                  });
          }else{
                
                //res.send({"Success":"Password not matched"});
                return res.render('pages/error', {message: "Registration denied because Password not matched",sessionId:sessionId})
        }
  }
});

app.post('/login', function (req, res, next) {
        //console.log(req.body);
        User.findOne({email:req.body.email},function(err,data){
                //console.log(req.session);
                if(data){
                        // if(data.admin)
                        //      // role=true;
                        // else
                                // role=false;
                        if(bcrypt.compareSync(req.body.password,data.password)){
                                console.log(req.session);
                                req.session.userId=data.unique_id;
                                sessionId=req.session.userId;
                                //console.log("after login session id"+ sessionId);
                                res.render('pages/index', {sessionId:sessionId});

                        }else{
                                return res.render('pages/error', {message: "Wrong Password, login denied",sessionId:sessionId})
                        }
                }else{
                        return res.render('pages/error', {message: "This email is not registered",sessionId:sessionId})
                }
        });
});

app.get('/logout', function (req, res, next) {
        console.log("logout")
        if (req.session) {
        req.session.destroy(function (err) {
        if (err) {
                return next(err);
        } else {
                sessionId=0;
                res.render('pages/index', {sessionId:sessionId});
        }
    });
}
});
var temp;
app.post("/upload",(req,res,next)=>{
        Resource.findOne({},function(err,data){
                if (data) {
                        temp = data.resource_id + 1;
                } else {
                        temp=1;
                }
                console.log("Count is "+ temp)
                var obj = {
                        resource_id: temp,
                        course: req.body.course,
                        description: req.body.description,
                        link: req.body.link
                }
                Resource.create(obj,function(err,result){
                        if(err){
                                console.log(err);
                        }else{
                                upload=1;
                                res.redirect('/');
                        }
                });
        }).sort({_id: -1}).limit(1);;
})

// app.get('/resource', function(req, res) {
//         if(req.session.userId!=undefined)
//         sessionId=req.session.userId;
//         res.render('pages/resource', {sessionId:sessionId});
//         });
const ITEMS_PER_PAGE = 10;
app.get('/resource', function(req, res, next) {
    const page = +req.query.page || 1;
    let totalItems;
    var category;
    User.findOne({unique_id:req.session.userId},function(err,data){
        if(data){
                category=data.aspirant;
                console.log(category);
        }else{
                console.log(err);
        }
});
Resource.find().countDocuments().then(numberOfResources => {
        totalItems = numberOfResources;
        return Resource.find().skip((page-1)*ITEMS_PER_PAGE).limit(ITEMS_PER_PAGE).sort({_id: -1});
})
.then(resources => {
        if(req.session.userId)
        {
                sessionId=req.session.userId;
                res.render('pages/resource', {
                        resources: resources,
                        currentPage: page,
                        hasNextPage: (ITEMS_PER_PAGE*page)<totalItems,
                        hasPreviousPage: page>1,
                        nextPage: page + 1,
                        previousPage: page - 1,
                        lastPage: Math.ceil(totalItems/ITEMS_PER_PAGE),
                        sessionId:sessionId,
                        category:category
                });
        }else{
                return res.render('pages/error', {message: "You must be signed in to view resources.", sessionId:sessionId});
        }

}).catch(err => {
        console.log(err);
})
})

const PORT = process.env.PORT || 3032;
app.listen(PORT, function () {
  console.log('Server is started on http://127.0.0.1:'+PORT);
});

module.exports = db;