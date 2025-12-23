import { Link } from "react-router-dom";
import styles from "./PostCard.module.scss";

export default function PostCard({ post, onSubscribe }) {
    const {
        id,
        title,
        content,
        previewText,
        mediaUrl,
        author,
        authorId,
        isPaid,
        createdAt,
        canAccess
    } = post;
    const getPublicUrl = (url) => {
        if (!url) return "";
        const fileName = url.split("/").pop();
        return `/media/${fileName}`;
    };
    return (
        <article className={styles.card}>
            <header className={styles.header}>
                <Link
                    to={`/creator/${author.username}`}
                    className={styles.author}
                >
                    @{author.username}
                </Link>

                <time className={styles.date}>
                    {new Date(createdAt).toLocaleDateString()}
                </time>
            </header>

            <h3 className={styles.title}>
                <Link to={`/post/${id}`}>{title}</Link>
            </h3>

            {mediaUrl && (
                <div className={styles.mediaWrapper}>
                    <img
                        src={getPublicUrl(mediaUrl)}
                        alt=""
                        className={styles.media}
                        loading="lazy"
                    />

                    {!canAccess && (
                        <div className={styles.mediaOverlay}>
                            🔒 Платный контент
                        </div>
                    )}
                </div>
            )}

            <div className={styles.content}>
                {!canAccess ? (
                    <>
                        <p>
                            {previewText || "Подпишитесь, чтобы читать пост полностью"}
                        </p>

                        <div className={styles.paywall}>
                            <button
                                className={styles.subscribeBtn}
                                onClick={onSubscribe}
                            >
                                Подписаться
                            </button>
                        </div>
                    </>
                ) : (
                    <p className={styles.full}>{content}</p>
                )}
            </div>

            <footer className={styles.footer}>
                {isPaid && <span className={styles.badge}>💎 Платный</span>}
                <Link to={`/post/${id}`} className={styles.readMore}>
                    Читать →
                </Link>
            </footer>
        </article>
    );
}
