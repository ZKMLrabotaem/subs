import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

import { getPostById } from "../../api/posts";
import { subscribe } from "../../api/subscriptions";
import { deletePost } from "../../api/posts";

import styles from "./PostPage.module.scss";
import Comments from "../../components/Comments/Comments.jsx";
import VoteButtons from "../../components/VoteButtons/VoteButtons.jsx";

export default function PostPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [subLoading, setSubLoading] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);

    const isAuthor = user?.id === post?.author?.id;

    useEffect(() => {
        async function load() {
            try {
                const { data } = await getPostById(id);
                setPost(data);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [id]);

    const handleSubscribe = async () => {
        if (!post?.author?.id) return;

        setSubLoading(true);
        try {
            await subscribe(post.author.id);
            setPost(prev => ({
                ...prev,
                canAccess: true,
                author: { ...prev.author, isSubscribed: true }
            }));
        } finally {
            setSubLoading(false);
        }
    };
    const getPublicUrl = (url) => {
        if (!url) return "";
        const fileName = url.split("/").pop();
        return `/media/${fileName}`;
    };
    const handleDelete = async () => {
        const ok = window.confirm("Вы точно хотите удалить пост?");
        if (!ok) return;

        setDeleteLoading(true);
        try {
            await deletePost(post.id);
            navigate("/");
        } catch (e) {
            alert(e.response?.data?.message || "Ошибка удаления поста");
        } finally {
            setDeleteLoading(false);
        }
    };
    if (loading) return <p>Загрузка...</p>;
    if (!post) return <p>Пост не найден</p>;

    return (
        <article className={styles.page}>
            <header className={styles.header}>
                <Link to={`/creator/${post.author.username}`} className={styles.author}>
                    @{post.author.username}
                </Link>

                <time>
                    {new Date(post.createdAt).toLocaleDateString()}
                </time>
            </header>

            <h1 className={styles.title}>{post.title}</h1>

            {post.mediaUrl && (
                <div className={styles.mediaWrapper}>
                    <img
                        src={getPublicUrl(post.mediaUrl)}
                        alt=""
                    />

                    {!post.canAccess && (
                        <div className={styles.mediaOverlay}>
                            🔒 Платный контент
                        </div>
                    )}
                </div>
            )}

            <div className={styles.content}>
                {post.isPaid && !post.canAccess ? (
                    <>
                        <p className={styles.preview}>
                            {post.previewText || "Подпишитесь, чтобы читать полностью"}
                        </p>

                        <button
                            onClick={handleSubscribe}
                            disabled={subLoading}
                            className={styles.subscribeBtn}
                        >
                            {subLoading ? "Подписка..." : "Подписаться"}
                        </button>
                    </>
                ) : (

                    <div>
                        <VoteButtons
                            entity={post}
                            initial={{
                                likes: post.likes,
                                dislikes: post.dislikes,
                                myVote: post.myVote
                            }}
                        />
                        {post.content}
                    </div>

                )}
            </div>
            {post.isPaid && (
                <span className={styles.badge}>💎 Платный пост</span>
            )}

            {isAuthor && (
                <div className={styles.actions}>
                    <button onClick={() => navigate(`/posts/${post.id}/edit`)}>
                        Редактировать
                    </button>
                    <button
                        className={styles.danger}
                        onClick={handleDelete}
                        disabled={deleteLoading}
                    >
                        {deleteLoading ? "Удаление..." : "Удалить"}
                    </button>
                </div>
            )}
            <Comments postId={post.id} />
        </article>
    );
}
