var {Soldier} = require('../models/soldier');


var authenticate = (req, res, next) => {
    console.log('Auth called');
    var token = req.cookies['user-auth'];
    console.log(token);

    Soldier.findByToken(token).then((soldier) => {
        if (!soldier) {
            return Promise.reject("Invalid Token");
        }

        req.user = soldier;
        req.token = token;
        next();
    }).catch((e) => {
        console.log(e);
        res.status(401).send();
    });
};

module.exports = {authenticate};
