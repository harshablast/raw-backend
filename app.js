const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const path = require('path');
const _ = require('lodash');

var {mongoose} = require('./db/mongoose');
//const {generateMessage} = require('./utils/message');
var {Soldier} = require('./models/soldier');
var {Admin} = require('./models/admin');
var {authenticate} = require('./middleware/authenticate');

const public_path = path.join(__dirname, './../public');

var app = express();

app.use(express.static(public_path));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(cookieParser());



app.post('/register', (req,res) => {
    var body = _.pick(req.body, ['militaryID', 'password']);
    var soldier = new Soldier(body);

    console.log(soldier);

    Soldier.findOne({militaryID: soldier.militaryID}).then((foundSoldier) => {
        console.log("Entered here");
        if (!foundSoldier) {
            console.log('No existing email. Proceed with registration');
            soldier.save().then(() => {
                res.redirect('/');
            }, (e) => {
                console.log(e);
            });
        }
        else {
            console.log('MilitaryID already exists!');
            res.redirect('/');
        }
    }, (e) => {
        console.log(e);
    });
});

app.post('/login', (req,res) => {
    var body = _.pick(req.body, ['militaryID' , 'password']);

    Soldier.findByCredentials(body.militaryID, body.password).then((soldier) => {
        return soldier.generateAuthToken().then((token) => {
            res.cookie('user-auth', token);
            return res.redirect('/home');

        });
    },(err) => {
        console.log(err);
    })
});

app.post('/logout', (req, res) => {
    token = req.cookies('user-auth');

    soldier.findByToken(token).then((soldier) => {
        soldier.removeToken(token);
    }).then((err) => {
        console.log(err);
    })

    res.cookie('user-auth', '', {expires: new Date(0)}).redirect('/');
});

app.post('/registerAdmin', (req,res) => {
    var body = _.pick(req.body, ['userID', 'password']);
    var admin = new Admin(body);

    console.log(admin);

    Admin.findOne({userID: admin.userID}).then((foundAdmin) => {
        console.log("Entered here");
        if (!foundAdmin) {
            console.log('No existing email. Proceed with registration');
            admin.save().then(() => {
                res.redirect('/');
            }, (e) => {
                console.log(e);
            });
        }
        else {
            console.log('User already exists!');
            res.redirect('/');
        }
    }, (e) => {
        console.log(e);
    });
});

app.post('/loginAdmin', (req,res) => {
    var body = _.pick(req.body, ['userID', 'password']);

    Admin.findByCredentials(body.userID, body.password).then((admin) => {
        return admin.generateAuthToken().then((token) => {
            res.cookie('user-auth', token);
            return res.redirect('/home');

        });
    },(err) => {
        console.log(err);
    })
});

app.post('/logoutAdmin', (req, res) => {
    token = req.cookies('user-auth');

    Admin.findByToken(token).then((user) => {
        user.removeToken(token);
    }).then((err) => {
        console.log(err);
    })

    res.cookie('user-auth', '', {expires: new Date(0)}).redirect('/');
});


app.post('/fetchCoordinates', (req, res) => {
    Soldier.find({},function(err,data) {
        var sendData = [];
        console.log(data.length);
        for(var i=0;i<data.length;i++){
            var row = {};
            console.log(data[i].x);
            row.x = data[i].x;
            row.y = data[i].y;
            console.log(row);
            sendData.push(row);
            console.log(sendData);
        }
        res.json(sendData);
    });
});

app.listen(8080);


