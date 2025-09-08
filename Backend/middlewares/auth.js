const jwt = require('jsonwebtoken');


module.exports = function (req, res, next) {

    const Auth = req.headers.authorization;
    if (!Auth) return res.status(401).json({ message: 'No token found' });

    const token = Auth.split(' ')[1];

    try {

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.id;
        next();

    } catch (err) {
        res.status(401).json({ message: 'Invalid token' });
    }
}