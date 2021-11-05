const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const fetchUser = require('../middleware/fetchUser');

require('dotenv').config();
const secret = process.env.ACCESS_TOKEN;

router.get('/', (req, res) => {
    res.send("Ok");
});

// Route-1: Create a new user
router.post('/createUser', async (req, res) => {
    const Email = req.body.email;
    const Password = req.body.password;
    const Name = req.body.name;
    const Username = req.body.userName;
    const RePassword = req.body.rePassword;
    const errors = [];
    let user;

    // Validating different fields
    ValidateEmail(Email, errors);
    ValidatePassword(Password, RePassword, errors);
    ValidateName(Name, errors);
    ValidateUsername(Username, errors);

    if (errors.length > 0) {
        return res.status(400).json({ error: errors });
    }

    // Checking duplicate users with same email or username
    user = await User.findOne({ $or: [{ email: Email }, { userName: Username }] });
    if (user)
        return res.status(409).json({ error: "User already exists!" });

    try {
        user = new User({
            name: Name,
            userName: Username,
            email: Email,
            password: Password
        });
        const newUser = await user.save();
        const data = {
            user: {
                id: newUser.id
            }
        }

        const authToken = jwt.sign(data, secret);
        return res.status(200).json({ authToken });

    } catch (err) {
        res.status(500).send("Some error has been encountered in the server!");
    }
});

// Route-2: Authenticate an existing user
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const errors = [];

    // Validating different fields
    ValidateEmail(email, errors);
    if (!password)
        errors.push({ location: "password", message: "Password cannot be empty!" });

    if (errors.length > 0) {
        return res.status(400).json({ error: errors });
    }
    try {
        const user = await User.findOne({ email: email });
        if (!user) {
            return res.status(400).json({ error: "Invalid Credentials!" });
        }

        const compare = await bcrypt.compare(password, user.password);
        if (!compare) {
            return res.status(400).json({ error: "Invalid Credentials!" });
        }

        const payload = {
            user: {
                id: user.id
            }
        }
        const authToken = jwt.sign(payload, secret);
        return res.status(200).json({ authToken });

    } catch (err) {
        res.status(500).send("Some error has been encountered in the server!");
    }
});

// Route-3: Get user details (Login Required)
router.post('/getUser', fetchUser, async (req, res) => {
    const id = req.user.id;
    try {
        // Display every details except the password
        const user = await User.findById({ id: id }).select("-password");
        return res.status(200).json(user);
    } catch (err) {
        res.status(500).send("Some error has been encountered in the server!");
    }
})

// Utility Funcitons
function ValidateEmail(mail, errors) {
    let mailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!(mail.match(mailformat)))
        errors.push({ location: "email", message: "Invalid Email!" });
}

function ValidatePassword(pass, repass, errors) {
    let paswd = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{8,25}$/;
    if (!(pass.match(paswd)))
        errors.push({ location: "password", message: "Invalid Password - Your password must be between 8 to 25 characters, should contain at least one lowercase letter, one uppercase letter, one numeric digit, and one special character!" });
    else if (pass !== repass)
        errors.push({ location: "rePassword", message: "Passwords doesn't match!" });
}

function ValidateName(name, errors) {
    let nameFormat = /^[a-zA-Z]+( [a-zA-Z]+)+$/;
    if (!(name.match(nameFormat)))
        errors.push({ location: "name", message: "Invalid Name!" });
}

function ValidateUsername(userName, errors) {
    if (userName.length < 5 || userName.length > 25)
        errors.push({ location: "userName", message: "Invalid Username - Username length must be between 5 to 25 characters" });
}
module.exports = router;