import mongoose from 'mongoose';
import Post from '../../models/post';

const { ObjectId } = mongoose.Types;

exports.getPostById = async (ctx, next) => {
    const { id } = ctx.params;

    if (!ObjectId.isValid(id)) {
        ctx.status = 400; // Bad Request
        return;
    }

    try {
        const post = await Post.findById(id);

        if (!post) {
            ctx.status = 404; // not found
            return;
        }

        ctx.state.post = post;
        return next();
    } catch (e) {
        ctx.throw(500, e);
    }
}

exports.read = ctx => {
    ctx.body = ctx.state.post;
};

exports.write = async ctx => {
    // ctx.body = 'Write';
    const { title, body, tags } = ctx.request.body;
    const post = new Post({
        title,
        body,
        tags,
        user: ctx.state.user,
    });

    try {
        await post.save();
        ctx.body = post;
    } catch(e) {
        ctx.throw(500, e);
    }
};

exports.list = async ctx => {
    const page = parseInt(ctx.query.page || '1', 10);

    if (page < 1) {
        ctx.status = 400;
        return;
    }

    const { tag, username } = ctx.query;
    const query = {
        ...(username ? { 'user.username' : username } : {}),
        ...(tag ? { tags: tag } : {}),
    };

    try {
        const posts = await Post.find(query)
            .sort({ _id: -1 })
            .limit(10)
            .skip((page - 1) * 10)
            .lean()
            .exec();
        const postCount = await Post.countDocuments(query).exec();
        ctx.set('Last-Page', Math.ceil(postCount / 10));
        ctx.body = posts.map(post => ({
            ...post,
            body:
                post.body.length < 200 ? post.body : `${post.body.slice(0, 200)}...`,
        }));
    } catch (e) {
        ctx.throw(500, e);
    }
};

exports.remove = ctx => {
    // ctx.body = 'Remove';
};

exports.replace = ctx => {
    ctx.body = 'Replace';
};

exports.update = ctx => {
    ctx.body = 'Update';
};

exports.checkOwnPost = (ctx, next) => {
    const { user, post } = ctx.state;

    if (post.user._id.toString() !== user._id) {
        ctx.status = 403;
        return;
    }
    return next();
}