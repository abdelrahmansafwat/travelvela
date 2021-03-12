const jwt = require("jsonwebtoken");

const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (authHeader) {
        const token = authHeader.split(' ')[1];

        jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
            if (err) {
                return res.redirect("/login");
            }

            req.user = user;
            next();
        });
    } else {
        res.redirect("/login");
    }
};

module.exports = authenticate;