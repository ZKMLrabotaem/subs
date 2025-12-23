import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getPostById, updatePost } from "../../api/posts";
import { useAuth } from "../../hooks/useAuth.js";
import styles from "./PostEditorPage.module.scss";

export default function PostEditorPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, loading: authLoading } = useAuth();

    const [form, setForm] = useState({
        title: "",
        content: "",
        previewText: "",
        isPaid: false,
        media: null
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (authLoading) return;

        if (!user || !user.creatorProfile) {
            navigate("/feed", { replace: true });
            return;
        }

        getPostById(id).then(({ data }) => {
            if (data.authorId !== user.id) {
                navigate(`/post/${id}`, { replace: true });
                return;
            }

            setForm({
                title: data.title,
                content: data.content,
                previewText: data.previewText || "",
                isPaid: data.isPaid,
                media: null
            });
        }).finally(() => setLoading(false));
    }, [id, user, authLoading, navigate]);

    if (loading || !user || !user.creatorProfile) return null;

    const handleChange = (e) => {
        const { name, value, type, checked, files } = e.target;

        if (type === "checkbox") setForm(prev => ({ ...prev, [name]: checked }));
        else if (type === "file") setForm(prev => ({ ...prev, media: files[0] }));
        else setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        const fd = new FormData();
        fd.append("title", form.title);
        fd.append("content", form.content);
        fd.append("previewText", form.previewText);
        fd.append("isPaid", form.isPaid);

        if (form.media) fd.append("media", form.media);

        try {
            await updatePost(id, fd);
            navigate(`/post/${id}`);
        } finally {
            setSaving(false);
        }
    };
    const mediaPreviewUrl = form.media
        ? URL.createObjectURL(form.media)
        : null;
    return (
        <div className={styles.page}>
            <h1>Редактирование поста</h1>
            <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.grid}>
                    {/* LEFT */}
                    <div className={styles.left}>
                        <input
                            name="title"
                            value={form.title}
                            onChange={handleChange}
                            required
                        />

                        <textarea
                            name="content"
                            value={form.content}
                            onChange={handleChange}
                            rows={10}
                            required
                        />

                        <label className={styles.checkbox}>
                            <input
                                type="checkbox"
                                name="isPaid"
                                checked={form.isPaid}
                                onChange={handleChange}
                            />
                            Платный пост
                        </label>

                        {form.isPaid && (
                            <textarea
                                name="previewText"
                                value={form.previewText}
                                onChange={handleChange}
                                placeholder="Превью для платного поста"
                                rows={3}
                            />
                        )}

                        <label className={styles.fileInput}>
                            Обновить медиа
                            <input
                                type="file"
                                accept="image/*,video/*"
                                onChange={handleChange}
                            />
                        </label>

                        <button disabled={saving}>
                            {saving ? "Сохраняем..." : "Сохранить"}
                        </button>
                    </div>

                    {/* RIGHT */}
                    <div className={styles.right}>
                        <p className={styles.previewTitle}>Превью поста</p>

                        <div className={styles.mediaPreview}>
                            {!mediaPreviewUrl && (
                                <div className={styles.placeholder}>
                                    Медиа не выбрано
                                </div>
                            )}

                            {mediaPreviewUrl && form.media?.type.startsWith("image") && (
                                <img src={mediaPreviewUrl} alt="" />
                            )}

                            {mediaPreviewUrl && form.media?.type.startsWith("video") && (
                                <video src={mediaPreviewUrl} controls />
                            )}
                        </div>
                    </div>
                </div>
            </form>

        </div>
    );
}
