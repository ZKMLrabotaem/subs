import api from "./index";

export const search = async ({ q, sort, access, skip = 0, take = 10, authorUsername }) => {
    const params = { q, sort, access, skip, take, authorUsername };
    const res = await api.get("/posts", { params });
    return res.data;
};
