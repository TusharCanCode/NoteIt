const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { Schema } = mongoose;

const UserSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    userName: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }
});

// Creating hash of the password before saving it to the database
UserSchema.pre("save", async function (next) {
    // only hash the password if it has been modified (or is new)
    if (!this.isModified('password')) return next();

    const SALT_WORK_FACTOR = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, SALT_WORK_FACTOR);
    next();
})

var User = new mongoose.model('User', UserSchema);
module.exports = User;