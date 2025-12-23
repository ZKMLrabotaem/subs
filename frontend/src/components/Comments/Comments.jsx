import { useEffect, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { getComments, addComment, deleteComment } from "../../api/votes.js";

import styles from "./Comments.module.scss";
import {Link} from "react-router-dom";

export default function Comments({ postId }) {
    const { user } = useAuth();
    const [comments, setComments] = useState([]);
    const [text, setText] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        load();
    }, [postId]);

    const load = async () => {
        setLoading(true);
        const { data } = await getComments(postId);

        setComments(Array.isArray(data) ? data : data.comments || []);

        setLoading(false);

    };

    const handleAdd = async () => {
        if (!text.trim()) return;
        const { data } = await addComment(postId, text);
        setComments(prev => [data, ...prev]);
        setText("");
    };

    const handleDelete = async (id) => {
        await deleteComment(id);
        setComments(prev => prev.filter(c => c.id !== id));
    };

    if (loading) return <p>Загрузка комментариев...</p>;

    return (
        <div className={styles.comments}>
            <h3>Комментарии</h3>

            {user && (
                <div className={styles.form}>
                    <textarea
                        value={text}
                        onChange={e => setText(e.target.value)}
                        placeholder="Написать комментарий..."
                    />
                    <button onClick={handleAdd}>Отправить</button>
                </div>
            )}

            {comments.length === 0 && <p>Комментариев нет</p>}

            {comments.map(c => (
                <div key={c.id} className={styles.comment}>
                    <div>
                        <Link to={`/profile/${c.author.username}`}><b>@{c.author.username}</b></Link>
                        <span>
                            {new Date(c.createdAt).toLocaleString()}
                        </span>
                    </div>

                    <p>{c.content}</p>

                    {user?.id === c.authorId && (
                        <button
                            className={styles.delete}
                            onClick={() => handleDelete(c.id)}
                        >
                            Удалить
                        </button>
                    )}
                </div>
            ))}
        </div>
    );
}
