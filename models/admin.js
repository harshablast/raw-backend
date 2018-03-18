const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const bcrypt = require('bcryptjs');

var AdminSchema = new mongoose.Schema({
    userID: {
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

AdminSchema.methods.toJSON = function () {
    var admin = this;
    var adminObject = admin.toObject();

    return _.pick(adminObject, ['_id', 'userID']);
};

AdminSchema.methods.generateAuthToken = function () {
    var admin = this;
    var access = 'auth';

    console.log(admin.tokens);

    if((admin.tokens.length === 0)){

        var token = jwt.sign({_id: soldier._id.toHexString(), access}, 'bitchesnshit').toString();
        admin.tokens.push({access, token});
    }
    else{
        token = admin.tokens[0]['token'];
    }



    return admin.save().then(() => {
        return token;
    });
};

AdminSchema.methods.removeToken = function (token) {
    var admin = this;

    return admin.update({
        $pull: {
            tokens: {token}
        }
    });
};

AdminSchema.statics.findByToken = function (token) {
    var Admin = this;
    var decoded;

    try {
        decoded = jwt.verify(token, "bitchesnshit");
    } catch (e) {
        return Promise.reject(e);
    }

    return Admin.findOne({
        '_id': decoded._id,
        'tokens.token': token,
        'tokens.access': 'auth'
    });
};

AdminSchema.statics.findByCredentials = function (email, password) {
    var Admin = this;

    return Admin.findOne({email}).then((user) => {
        if (!user) {
            return Promise.reject('Admin does not exist');
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

AdminSchema.pre('save', function (next) {
    var Admin = this;

    if (Admin.isModified('password')) {
        bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(Admin.password, salt, (err, hash) => {
                Admin.password = hash;
                next();
            });
        });
    } else {
        next();
    }
});

var Admin = mongoose.model('Admin', AdminSchema);

module.exports = {Admin};