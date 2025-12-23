import api from "./index.js";

export const subscribe = (creatorId) => api.post("/subscriptions", { creatorId });

export const mySubscriptions = () => api.get("/subscriptions/me");

export const getCreatorSubscribers = (creatorId) => api.get(`/subscriptions/creator/${creatorId}`);

export const cancelSubscription = (subscriptionId) => api.post(`/subscriptions/${subscriptionId}/cancel`);
