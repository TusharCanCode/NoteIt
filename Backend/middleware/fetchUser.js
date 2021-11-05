const jwt = require("jsonwebtoken");

require('dotenv').config();
const secret = process.env.ACCESS_TOKEN;

const fetch = (req, res, next) => {
    const header = req.header('auth-token');
    if (!header)
        return res.status(401).json({ error: "Please authenticate using a valid token!" });
    try {
        const data = jwt.verify(header, secret);
        req.user = data.user;
        next();
    } catch (err) {
        return res.status(401).json({ error: "Please authenticate using a valid token!" });
    }
};

module.exports = fetch;