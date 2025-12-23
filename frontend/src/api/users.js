import api from "./index.js";

export const getMe = () => api.get("/users/me");

export const updateMe = (data) => api.put("/users/me", data, {
    headers: { "Content-Type": "multipart/form-data" }
});

export const getByUsername = (username) => api.get(`/users/${username}`);

export const upgradeToCreator = (data) => api.post("/users/become-creator", data);
