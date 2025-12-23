import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getPostById } from "../api/posts";
import { useAuth } from "./useAuth.js";

export function usePostOwner(postId) {
    const { user, loading: authLoading } = useAuth();
    const navigate = useNavigate();

    const [isOwner, setIsOwner] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (authLoading) return;

        if (!user) {
            navigate("/feed", { replace: true });
            return;
        }

        (async () => {
            try {
                const { data } = await getPostById(postId);
                if (data.authorId !== user.id) {
                    navigate(`/post/${postId}`, { replace: true });
                    return;
                }
                setIsOwner(true);
            } catch (e) {
                console.error(e);
                navigate("/feed", { replace: true });
            } finally {
                setLoading(false);
            }
        })();
    }, [postId, user, authLoading, navigate]);

    return { isOwner, loading };
}
