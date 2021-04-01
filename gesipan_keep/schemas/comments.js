const mongoose = require("mongoose");

mongoose.connection.on("error", err => {
    console.error("몽고디비 연결 에러", err);
});

const commentSchema = new mongoose.Schema({
    nickname: String,
    comment: String,
    commentId: String,
    comment_Delete_Id: {
        type: Number,
        required: true,
        unique: true,
    },
});

module.exports = mongoose.model("comment", commentSchema)