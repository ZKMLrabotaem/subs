import api from "./index.js";

export const votePost = (postId, value) => {
    return api.post(`/votes/posts/${postId}/vote`, { value });
};

export const voteProfile = (profileId, value) => {
    return api.post(`/votes/profiles/${profileId}/vote`, { value });
};

export const getComments = (postId) => {
    return api.get(`/votes/posts/${postId}/comments`);
};

export const addComment = (postId, text) => {
    return api.post(`/votes/posts/${postId}/comments`, {  content: text });
};

export const deleteComment = (commentId) => {
    return api.delete(`/votes/comments/${commentId}`);
};
