const mongoose = require('mongoose');

const connect = () => {
    mongoose.connect(`mongodb://localhost:27017/NoteIt`, { useNewUrlParser: true, useUnifiedTopology: true }).then(() => {
        console.log(`Connection with database is successful!`);
    }).catch(() => {
        console.log(`Connection can't be made with database!`);
    });
}

module.exports = connect;