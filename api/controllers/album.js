const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");


const Album = require("../models/album");
const Song = require("../models/song");


exports.add_album = (req, res, next) => {
    const album = new Album({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        albumImage: req.file.path,
        uploadDate: new Date().getTime(),
        artist: req.userData.id
    });

    const cloudinary = require('cloudinary').v2;
    cloudinary.config({
        cloud_name: 'fitsumayalew',
        api_key: '278299316462351',
        api_secret: 'ZZlzCXQ4Q0GzRYIRwXLV0Jso__M'
    });

    const path = album.albumImage;

    cloudinary.uploader.upload(
        path,
        { public_id: `${path.split('/')[1]}` }, // directory and tags are optional
        function (err, image) {
            if (err) {
                console.log(err);
            }
            console.log('file uploaded to Cloudinary')
            // remove file from server
            const fs = require('fs')
            fs.unlinkSync(path)
            // return image details
        }
    )

    album
        .save()
        .then(result => {
            return res.status(201).json({
                message: "Album created",
                album: album,
                request: {
                    type: "GET",
                    url: "album/" + result._id
                }
            });
        })
        .catch(err => {
            console.log(err);
            return res.status(500).json({
                error: err
            });
        });
}

exports.get_album = (req, res, next) => {
    if (req.body.returnSongs == true) {
        Album.find({ _id: req.params.albumId })
            .populate("artist", "_id name")
            .exec()
            .then(result => {
                if (result.length > 0) {
                    Song.find({ artist: result[0].artist })
                        .select("_id name songPath length")
                        .exec()
                        .then(songs => {
                            res.status(200).json({
                                _id: result[0]._id,
                                name: result[0].name,
                                albumImage: result[0].albumImage,
                                artist: result[0].artist,
                                songs: songs

                            });
                        })
                        .catch();

                }
            })
            .catch(err => {
                console.log(err);
                res.status(500).json({
                    error: err
                });
            });
    } else {
        Album.find({ _id: req.params.albumId })
            .select()
            .populate("artist", "_id name")
            .exec()
            .then(result => {
                res.status(200).json(result[0]);
            })
            .catch(err => {
                console.log(err);
                res.status(500).json({
                    error: err
                });
            });
    }
}



exports.get_albums = (req, res, next) => {
    Album.find({ artist: req.userData.id })
        .select()
        .populate("artist", "_id name")
        .exec()
        .then(result => {
            res.status(200).json(result);
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
}

exports.update_album = (req, res, next) => {
    Artist.find({ _id: req.userData.id })
        .exec()
        .then(artist => {
            if (artist.length < 1) {
                return res.status(403).json({
                    error: "Invalid Token"
                });
            }
            return res.status(200).json(artist[0]);
        });
}