const getProfile = (req, res, db) => {
    const {id} = req.params;
    db.first('*')
        .from('users')
        .where('id', id)
        .then(user => {
            if (user !== undefined) {
                res.json(user);
            } else {
                res.status(404).json('user not found');
            }
        })
        .catch(() => res.status(500).json('something is getting wrong'));
}

const handleProfileUpdate = (req, res, db, bcrypt) => {
    const {id} = req.params;
    db.transaction(trx => {
        return trx.first('*').from('users').where('id', id)
            .then(user => {
                let hash = user.password;

                const {name, email, password} = req.body;
                if (password) {
                    hash = bcrypt.hashSync(password);
                }

                return trx('users').where('id', id).update({name: name, email: email})
                    .then(updateUser => {
                        if (updateUser) {
                            return trx('login').where('email', user.email).update({password: hash, email: email})
                                .then((updatePassword) => updatePassword ? 'success' : 'update password failed')
                                .catch(() => 'unable to update password');
                        } else {
                            return 'update user failed';
                        }
                    })
                    .catch(() => 'unable to update user');
            })
            .catch(() => 'unable to get user');
    })
        .then((message) => {
            res.json(message);
        })
        .catch((error) => {
            res.status(400).json(error);
        });
}

module.exports = {
    getProfile: getProfile,
    handleProfileUpdate: handleProfileUpdate
}