const updateEntries = (req, res, db) => {
    const {id} = req.body;
    db('users').where('id', '=', id)
        .increment('entries', 1)
        .returning('entries')
        .then(entries => {
            if (entries.length) {
                res.json({entries: entries[0]});
            } else {
                res.status(404).json('user not found');
            }
        })
        .catch(() => res.status(500).json('unable to get entries'));
}

module.exports = {
    updateEntries: updateEntries
}