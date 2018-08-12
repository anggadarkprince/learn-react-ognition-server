const Clarifai = require('clarifai');

const app = new Clarifai.App({
    apiKey: '6b658da484a248d8959b55c89c181034'
});

const handleApiCall = (req, res) => {
    app.models.predict(Clarifai.FACE_DETECT_MODEL, req.body.input)
        .then(data => {
            res.json(data);
        })
        .catch(() => res.status(400).json('unable to work with api'));
}

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
    updateEntries: updateEntries,
    handleApiCall: handleApiCall,
}