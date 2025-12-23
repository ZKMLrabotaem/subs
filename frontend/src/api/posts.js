import api from "./index.js";

export const createPost = (formData) => {
    return api.post("/posts", formData, {
        headers: { "Content-Type": "multipart/form-data" }
    });
};
export const updatePost = (id, formData) => {
    return api.put(`/posts/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
    });
};

export const deletePost = (id) => api.delete(`/posts/${id}`);

export const getAllPosts = () => api.get("/posts");

export const getMyPosts = () => api.get("/posts/mine");

export const getPostsByUser = (username) => api.get(`/posts/user/${username}`);

export const getPostById = (id) => api.get(`/posts/${id}`);
