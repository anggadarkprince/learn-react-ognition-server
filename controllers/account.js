const jwt = require('jsonwebtoken');
const redis = require('redis');
const redisClient = redis.createClient(process.env.REDIS_URI);

const handleRegister = (db, bcrypt) => (req, res) => {
    const {email, name, password} = req.body;
    if (!email || !name || !password) {
        return res.status(400).json('incorrect form submission');
    }
    const hash = bcrypt.hashSync(password);

    db.transaction(trx => {
        return trx
            .insert({password: hash, email: email})
            .into('login')
            .returning('email')
            .then(loginEmail => {
                return trx
                    .insert({name: name, email: loginEmail[0], joined: new Date()})
                    .into('users')
                    .returning('*')
                    .then(users => {
                        return users[0];
                    })
                    .catch(() => 'unable to register');
            })
            .catch(() => 'unable to create credentials');
    })
        .then(function (registeredUser) {
            res.json(registeredUser);
        })
        .catch(function (error) {
            res.status(400).json(error);
        });
}

const handleLogin = (req, res, db, bcrypt) => {
    const {email, password} = req.body;

    if(!email || !password) {
        return Promise.reject({status: 'incorrect form submission'});
    }

    return db.select('email', 'password').from('login')
        .where('email', '=', email)
        .then(data => {
            if (data.length) {
                if (bcrypt.compareSync(password, data[0].password)) {
                    return db.select('*').from('users')
                        .where('email', '=', email)
                        .then(users => ({status: 'success', user: users[0]}))
                        .catch(() => Promise.reject({status: 'unable to get user'}));
                } else {
                    return Promise.reject({status: 'unauthorized'})
                }
            } else {
                return Promise.reject({status: 'credential not found'});
            }
        })
        .catch(() => Promise.reject({status: 'credential not found'}));
}

const getAuthTokenId = (req, res) => {
    const {authorization} = req.headers;
    return redisClient.get(authorization, (err, reply) => {
        if(err || !reply) {
            return res.status(401).json('unauthorized');
        }
        return res.json({id: reply});
    });
}

const signToken = (email) => {
    const jwtPayload = {email};
    return jwt.sign(jwtPayload, process.env.JWT_SECRET || 'JWT_SECRET', {expiresIn: '2 days'});
}

const setToken = (key, value) => {
    return Promise.resolve(redisClient.set(key, value));
}

const createSession = (user) => {
    // JWT token, return user data
    const {email, id} = user;
    const token = signToken(email);
    return setToken(token, id)
        .then(() => ({status: 'success', userId: id, token}))
        .catch(console.log);
}

const signInAuthentication = (db, bcrypt) => (req, res) => {
    const {authorization} = req.headers;
    return authorization ?
        getAuthTokenId(req, res) :
        handleLogin(req, res, db, bcrypt)
            .then(data => {
                return data.user.id && data.user.email ? createSession(data.user) : Promise.reject(data);
            })
            .then(session => res.json(session))
            .catch(err => res.status(400).json(err));
}

module.exports = {
    handleRegister: handleRegister,
    handleLogin: handleLogin,
    signInAuthentication: signInAuthentication,
    redisClient: redisClient
}