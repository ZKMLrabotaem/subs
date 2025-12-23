import api from "./index.js";

export const getCreator = (username) => api.get(`/creators/${username}`);
export const getTopCreators = () => api.get("/creators/top");
export const updateSubscriptionPrice = (creatorId, price) =>
    api.post(`/subscriptions/creator/${creatorId}/price`, { newPrice: price });
