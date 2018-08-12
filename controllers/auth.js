const handleRegister = (db, bcrypt) => (req, res) => {
    const {email, name, password} = req.body;
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

    db.select('email', 'password').from('login')
        .where('email', '=', email)
        .then(data => {
            if (data.length) {
                if (bcrypt.compareSync(password, data[0].password)) {
                    db.select('*').from('users')
                        .where('email', '=', email)
                        .then(users => {
                            res.json({status: 'success', user: users[0]});
                        })
                        .catch(() => res.status(400).json({status: 'unable to get user'}));
                } else {
                    res.status(201).json({status: 'unauthorized'});
                }
            } else {
                res.status(201).json({status: 'credential not found'});
            }
        });
}

module.exports = {
    handleRegister: handleRegister,
    handleLogin: handleLogin,
}