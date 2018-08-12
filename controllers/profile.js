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

module.exports = {
    getProfile: getProfile
}