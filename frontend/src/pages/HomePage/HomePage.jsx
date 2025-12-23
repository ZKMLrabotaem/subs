import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.js";
import { getTopCreators } from "../../api/creators.js";
import styles from "./HomePage.module.scss";

export default function HomePage() {
    const { user, loading } = useAuth();
    const [topCreators, setTopCreators] = useState([]);
    const [creatorsLoading, setCreatorsLoading] = useState(true);

    useEffect(() => {
        async function loadCreators() {
            try {
                const { data } = await getTopCreators();
                setTopCreators(data);
            } catch (err) {
                console.error("Failed to load top creators", err);
            } finally {
                setCreatorsLoading(false);
            }
        }
        loadCreators();
    }, []);

    if (loading) return null;

    const getPublicUrl = (url) => {
        if (!url) return "";
        const fileName = url.split("/").pop();
        return `/media/${fileName}`;
    };
    return (
        <div className={styles.page}>
            <h1>Платформа для креаторов</h1>
            <p>Подписывайся на авторов и получай доступ к эксклюзивному контенту</p>

            {!user ? (
                <div className={styles.actions}>
                    <Link to="/login" className={styles.primary}>
                        Войти
                    </Link>
                    <Link to="/register" className={styles.secondary}>
                        Регистрация
                    </Link>
                </div>
            ) : (
                <div className={styles.actions}>
                    <Link to="/feed" className={styles.primary}>
                        Перейти в ленту
                    </Link>
                    <Link to={`/profile/${user.username}`} className={styles.secondary}>
                        Мой профиль
                    </Link>
                </div>
            )}

            <h2>Топ креаторов</h2>
            {creatorsLoading ? (
                <p>Загрузка...</p>
            ) : (
                <div className={styles.creators}>
                    {topCreators.map(c => (
                        <Link key={c.id} to={`/creator/${c.username}`} className={styles.creatorCard}>
                            <img
                                src={getPublicUrl(c.avatarUrl) || "/avatar-placeholder.jpeg"}
                                alt={c.username}
                                className={styles.avatar}
                            />
                            <p>{c.username}</p>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
