const jwt_secret = process.env.JWT_TOKEN_SECRET;

exports.tokenmiddleware = (req, res, next) => {
    if (!req.headers.authorization) {
        return res.status(401).send('unauthorized')
    }
    let token = req.headers.authorization; 

    if (!token) {
        return res.status(401).send('unauthorized')
    } else {
        let payload = module.exports.checktoken(token)
        if (payload) {
            req.userId = payload;
            console.log("userID ",req.userId);            
        }
        if (payload == null || payload == undefined || !payload) {
            return res.status(401).send('unauthorized')
        } 
        next();
    }
}

exports.checktoken = (token) => {
    const verified = jwt.verify(token, jwt_secret, (err,decoded) => {
        if (err) {
            return err.message;
        } else {
            return decoded._id;
        }
    });
    return verified;
}