import routes from "../routes";
import Video from "../models/Video";
import Comment from "../models/Comment";

export const home = async (req, res) => {
    try {
        const videos = await Video.find({}).sort({ _id: -1 }); //최신 순으로 정렬
        res.render("home", { pageTitle: "Home", videos });
    } catch (error) {
        console.log(error);
        res.render("home", { pageTitle: "Home", videos: [] });
    }
};

export const search = async (req, res) => {
    const {
        query: { term: searchingBy }
    } = req;
    let videos = [];
    try {
        videos = await Video.find({
            title: { $regex: searchingBy, $options: "i" }
        });
    } catch (error) {
        console.log(error);
    }
    res.render("search", { pageTitle: "Search", searchingBy, videos });
};

export const getUpload = (req, res) => {
    res.render("upload", { pageTitle: "Upload" });
};

export const postUpload = async (req, res) => {
    const {
        body: { title, description },
        file: { location }
    } = req;
    const newVideo = await Video.create({
        // fileUrl: path.replace(/\\/g, "/"),
        fileUrl: location,
        title,
        description,
        creator: req.user.id
    });
    req.user.videos.push(newVideo.id);
    req.user.save();
    res.redirect(routes.videoDetail(newVideo.id));
};

export const videoDetail = async (req, res) => {
    const {
        params: { id }
    } = req;
    try {
        const video = await Video.findById(id)
            .populate("creator")
            .populate("comments");
        res.render("videoDetail", { pageTitle: video.title, video });
    } catch (error) {
        console.log(error);
        res.redirect(routes.home);
    }
};

export const getEditVideo = async (req, res) => {
    const {
        params: { id }
    } = req;
    try {
        const video = await Video.findById(id);
        if (String(video.creator) !== req.user.id) {
            throw Error();
        } else {
            res.render("editVideo", {
                pageTitle: `Edit ${video.title}`,
                video
            });
        }
    } catch (error) {
        console.log(error);
        res.redirect(routes.home);
    }
};

export const postEditVideo = async (req, res) => {
    const {
        params: { id },
        body: { title1111, description1111 }
    } = req;
    console.log(req.body);
    try {
        await Video.findOneAndUpdate(
            { _id: id },
            { title: title1111, description: description1111 }
        );
        res.redirect(routes.videoDetail(id));
    } catch (error) {
        console.log(error);
        res.redirect(routes.home);
    }
};
export const deleteVideo = async (req, res) => {
    const {
        params: { id }
    } = req;
    try {
        const video = await Video.findById(id);
        if (String(video.creator) !== req.user.id) {
            throw Error();
        } else {
            await Video.findByIdAndRemove({ _id: id });
        }
    } catch (error) {
        console.log(error);
    }
    res.redirect(routes.home);
};

export const postRegisterView = async (req, res) => {
    const {
        params: { id }
    } = req;
    try {
        const video = await Video.findById(id);
        video.view += 1;
        video.save();
        res.status(200);
    } catch (error) {
        res.status(400);
    } finally {
        res.end();
    }
};

export const postAddComment = async (req, res) => {
    const {
        params: { id },
        body: { comment123 },
        user
    } = req;
    console.log(req.body);
    try {
        const video = await Video.findById(id);
        const newComment = await Comment.create({
            text: comment123,
            creator: user.id
        });
        video.comments.push(newComment.id);
        video.save();
    } catch (error) {
        console.log(error);
        res.status(400);
    } finally {
        res.end();
    }
};