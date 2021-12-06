const express = require('express');
const router = express.Router();
const note = require('../models/Note');
const fetchUser = require('../middleware/fetchUser');

// Route-1: Fetching all notes by an user (Login is required)
router.get('/allNotes', fetchUser, async (req, res) => {
    const user = req.user;
    try {
        const notes = await note.find({ author: user.id });
        return res.status(200).json(notes);
    } catch (err) {
        res.status(500).send("Some error has been encountered in the server!");
    }
});

// Route-2: Adding a note (Login is required)
router.post('/addNotes', fetchUser, async (req, res) => {
    const { title, description, category } = req.body;
    const author = req.user.id;
    const errors = [];

    // Validating different fields
    ValidateTitle(title, errors);
    ValidateDescription(description, errors);

    if (errors.length > 0) {
        return res.status(400).json({ error: errors });
    }

    try {
        const Note = new note({
            title, description, category, author
        })

        const newNote = await Note.save();
        return res.status(200).json(newNote);
    } catch (error) {
        res.status(500).send("Some error has been encountered in the server!");
    }
})

// Route-3: Updating an existing note (Login is required)
router.put('/updateNotes/:id', fetchUser, async (req, res) => {
    const { title, description, category } = req.body;
    try {
        let Note = await note.findById(req.params.id);

        if (!Note)
            return res.status(404).send("Not Found!");
        const errors = [];

        // Validating differnet fields
        ValidateTitle(title, errors);
        ValidateDescription(description, errors);
        if (errors.length > 0)
            return res.status(400).json({ error: errors });

        let Newnote = {};
        Newnote.title = title;
        Newnote.description = description;
        if (category) Newnote.category = category;

        // If the user ID in the notes and the request parameter doesn't matches
        if (Note.author.toString() !== req.user.id)
            return res.status(401).send("Not Allowed!");

        Note = await note.findByIdAndUpdate(req.params.id, { $set: Newnote }, { new: true });
        return res.status(200).json(Note);
    } catch (error) {
        res.status(500).send("Some error has been encountered in the server!");
    }

})

// Route-4: Deleting an existing note (Login is required)
router.delete('/deleteNotes/:id', fetchUser, async (req, res) => {
    try {
        let Note = await note.findById(req.params.id);

        if (!Note)
            return res.status(404).send("Not Found!");

        // If the user ID in the notes and the request parameter doesn't matches
        if (Note.author.toString() !== req.user.id)
            return res.status(401).send("Not Allowed!");

        Note = await note.findByIdAndRemove(req.params.id);
        return res.status(200).json({ Status: 'Success', Message: 'Note has been deleted successfully!', Note: Note });
    } catch (error) {
        res.status(500).send("Some error has been encountered in the server!");
    }

})

// Utility Functions
function ValidateTitle(title, errors) {
    if (!title || title.length < 2)
        errors.push({ location: 'title', message: 'Title must be of atleast 2 characters' });
}

function ValidateDescription(description, errors) {
    if (!description || description.length < 10)
        errors.push({ location: 'description', message: 'Description must be of atleast 10 characters' });
}
module.exports = router;