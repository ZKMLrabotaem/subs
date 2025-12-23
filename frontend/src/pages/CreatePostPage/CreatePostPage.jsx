import {useEffect, useState} from "react";
import { useNavigate } from "react-router-dom";
import { createPost } from "../../api/posts";
import { isCreator } from "../../hooks/isCreator";
import styles from "./CreatePostPage.module.scss";
import {useAuth} from "../../hooks/useAuth.js";

export default function CreatePostPage() {
    const navigate = useNavigate();
    const { user, loading: authLoading } = useAuth();
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [paid, setPaid] = useState(false);
    const [previewText, setpreviewText] = useState("");
    const [media, setMedia] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (!title.trim() || !content.trim()) {
            return setError("Заголовок и контент обязательны");
        }

        try {
            setLoading(true);

            const formData = new FormData();
            formData.append("title", title);
            formData.append("content", content);
            formData.append("isPaid", paid);
            formData.append("previewText", previewText);
            if (media) {
                formData.append("media", media);
            }

            const { data } = await createPost(formData);

            navigate(`/post/${data.id}`);
        } catch (err) {
            setError(err.response?.data?.message || "Ошибка создания поста");
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        if (!authLoading) {
            if (!user) {
                navigate("/login");
                return;
            }

            if (!isCreator(user)) {
                navigate(`/profile/${user.username}`);
            }
        }
    }, [user, authLoading, navigate]);

    if (authLoading) return <p>Загрузка...</p>;
    if (!user || !isCreator(user)) return null;

    return (
        <div className={styles.page}>
            <h1>Создание поста</h1>

            <form onSubmit={handleSubmit} className={styles.form}>
                {error && <div className={styles.error}>{error}</div>}

                <div className={styles.grid}>
                    {/* LEFT */}
                    <div className={styles.left}>
                        <input
                            type="text"
                            placeholder="Заголовок"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />

                        <textarea
                            placeholder="Контент поста..."
                            rows={10}
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                        />

                        <div className={styles.checkbox}>
                            <input
                                type="checkbox"
                                checked={paid}
                                onChange={(e) => setPaid(e.target.checked)}
                            />
                            Платный пост
                        </div>

                        {paid && (
                            <textarea
                                placeholder="Превью (для платных постов)"
                                value={previewText}
                                onChange={(e) => setpreviewText(e.target.value)}
                                rows={3}
                            />
                        )}

                        <div className={styles.fileInput}>
                            Медиа (картинка)
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => setMedia(e.target.files[0])}
                            />
                        </div>

                        <button disabled={loading}>
                            {loading ? "Создание..." : "Опубликовать"}
                        </button>
                    </div>

                    {/* RIGHT */}
                    <div className={styles.right}>
                        <p className={styles.previewTitle}>Превью поста</p>

                        <div className={styles.mediaPreview}>
                            {!media && <div className={styles.placeholder}>Медиа не выбрано</div>}

                            {media && media.type.startsWith("image") && (
                                <img src={URL.createObjectURL(media)} alt="" />
                            )}

                            {media && media.type.startsWith("video") && (
                                <video src={URL.createObjectURL(media)} controls />
                            )}
                        </div>
                    </div>
                </div>
            </form>

        </div>
    );
}
