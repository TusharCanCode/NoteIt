const mongoose = require('mongoose');
const { Schema } = mongoose;

const NoteSchema = new Schema({
    author: {
        type: mongoose.Schema.Types.ObjectId, //Foreign key
        ref: 'User' //Reference model
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    category: {
        type: String,
        default: 'General'
    }
});

var note = new mongoose.model('Note', NoteSchema);
module.exports = note;