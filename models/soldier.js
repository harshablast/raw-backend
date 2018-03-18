const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const bcrypt = require('bcryptjs');

var SoldierSchema = new mongoose.Schema({
    militaryID: {
        type: String,
        required: true,
        trim: true,
        minlength: 1,
        unique: true
    },
    password: {
        type: String,
        require: true,
        minlength: 6
    },
    tokens: [{
        access: {
            type: String,
            required: true
        },
        token: {
            type: String,
            required: true
        }
    }],
    x: {
        type: Number
    },
    y: {
        type: Number
    }
});

SoldierSchema.methods.toJSON = function () {
    var soldier = this;
    var soldierObject = soldier.toObject();

    return _.pick(soldierObject, ['_id', 'email']);
};

SoldierSchema.methods.generateAuthToken = function () {
    var soldier = this;
    var access = 'auth';

    console.log(soldier.tokens);

    if((soldier.tokens.length === 0)){

        var token = jwt.sign({_id: soldier._id.toHexString(), access}, 'bitchesnshit').toString();
        soldier.tokens.push({access, token});
    }
    else{
        token = soldier.tokens[0]['token'];
    }



    return soldier.save().then(() => {
        return token;
    });
};

SoldierSchema.methods.removeToken = function (token) {
    var soldier = this;

    return soldier.update({
        $pull: {
            tokens: {token}
        }
    });
};

SoldierSchema.statics.findByToken = function (token) {
    var Soldier = this;
    var decoded;

    try {
        decoded = jwt.verify(token, "bitchesnshit");
    } catch (e) {
        return Promise.reject(e);
    }

    return Soldier.findOne({
        '_id': decoded._id,
        'tokens.token': token,
        'tokens.access': 'auth'
    });
};

SoldierSchema.statics.findByCredentials = function (email, password) {
    var Soldier = this;

    return Soldier.findOne({email}).then((user) => {
        if (!user) {
            return Promise.reject('Soldier does not exist');
        }

        return new Promise((resolve, reject) => {
            // Use bcrypt.compare to compare password and user.password
            bcrypt.compare(password, user.password, (err, res) => {
                if (res) {
                    resolve(user);
                } else {
                    reject('Password Incorrect');
                }
            });
        });
    });
};

SoldierSchema.pre('save', function (next) {
    var user = this;

    if (user.isModified('password')) {
        bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(user.password, salt, (err, hash) => {
                user.password = hash;
                next();
            });
        });
    } else {
        next();
    }
});

var Soldier = mongoose.model('Soldier', SoldierSchema);

module.exports = {Soldier};