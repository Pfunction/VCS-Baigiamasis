import jwt from 'jsonwebtoken';

const auth = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(" ")[1];
       
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
       
        req.userData = decoded;
        next();
    } catch (error) {
        console.log('auth fail', error)
        return res.status(401).json({
            message: 'Authentication fail'
        });
    }
};

export default auth;