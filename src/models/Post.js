const mongoose = require('mongoose')

const PostSchema = mongoose.Schema({
    author: {
        type: String,
        trim: true
    },
    comment: {
        type: String,
        trim: true
    }
})

module.exports=mongoose.model('Post',PostSchema)