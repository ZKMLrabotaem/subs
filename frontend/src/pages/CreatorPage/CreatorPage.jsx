import { useState, useEffect, useCallback, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.js";

import PostCard from "../../components/PostCard/PostCard";
import Filters from "../../components/Filters/Filters";
import { search } from "../../api/search";
import { useInfiniteScroll } from "../../hooks/useInfiniteScroll";
import { getCreator, updateSubscriptionPrice } from "../../api/creators";
import { subscribe, cancelSubscription } from "../../api/subscriptions";

import styles from "./CreatorPage.module.scss";

const PAGE_SIZE = 10;

export default function CreatorPage() {
    const { username } = useParams();
    const { user: authUser } = useAuth();

    const [creator, setCreator] = useState(null);
    const [profileLoading, setProfileLoading] = useState(true);

    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [skip, setSkip] = useState(0);

    const [query, setQuery] = useState("");
    const [filters, setFilters] = useState({ sort: "new", access: "all" });

    const [subLoading, setSubLoading] = useState(false);
    const [priceEditing, setPriceEditing] = useState(false);
    const [newPrice, setNewPrice] = useState(5);
    const loaderRef = useRef(null);

    const isMe = authUser?.username === username;

    useEffect(() => {
        async function loadCreator() {
            setProfileLoading(true);
            try {
                const { data } = await getCreator(username);
                const creatorData = data.creator || data;

                const subscription = data.subscription;
                const isSubscribed = !!subscription;
                const subscriptionId = subscription?.id || null;
                const autoR = subscription?.autoRenew || null;
                const expiresAt = subscription?.expiresAt || null;
                const canceledAt = subscription?.canceledAt || null;
                setCreator({ ...creatorData, isSubscribed, subscriptionId, autoR, expiresAt, canceledAt });
                setNewPrice(creatorData.subscriptionPrice || 1);
            } catch (err) {
                console.error("Ошибка загрузки креатора", err);
                setCreator(null);
            } finally {
                setProfileLoading(false);
            }
        }
        loadCreator();
    }, [username]);
    const refreshCreator = async () => {
        try {
            const { data } = await getCreator(username);
            const creatorData = data.creator || data;

            const subscription = data.subscription;
            const isSubscribed = !!subscription;
            const subscriptionId = subscription?.id || null;
            const autoR = subscription?.autoRenew || null;
            const expiresAt = subscription?.expiresAt || null;
            const canceledAt = subscription?.canceledAt || null;

            setCreator({ ...creatorData, isSubscribed, subscriptionId, autoR, expiresAt, canceledAt });
        } catch (err) {
            console.error("Ошибка обновления креатора", err);
        }
    }
    useEffect(() => {
        setPosts([]);
        setSkip(0);
        setHasMore(true);
    }, [query, filters, username]);

    const loadPosts = useCallback(async () => {
        if (loading || !hasMore || !creator) return;
        setLoading(true);
        try {
            const { data, total } = await search({
                q: query || undefined,
                sort: filters.sort,
                access: filters.access,
                skip,
                take: PAGE_SIZE,
                authorUsername: username
            });

            setPosts(prev => [...prev, ...data]);
            setSkip(prev => prev + data.length);

            if (skip + data.length >= total) setHasMore(false);
        } catch (err) {
            console.error("Ошибка загрузки постов", err);
        } finally {
            setLoading(false);
        }
    }, [query, filters, skip, hasMore, creator, username, loading]);

    useInfiniteScroll(loaderRef, loadPosts);

    const handleSubscribe = async () => {
        if (!creator?.id) return;
        setSubLoading(true);
        try {
            await subscribe(creator.id);
            await refreshCreator();

        } finally {
            setSubLoading(false);
        }
    };

    const handleCancel = async () => {
        if (!creator?.subscriptionId) return;
        setSubLoading(true);
        try {
            await cancelSubscription(creator.subscriptionId);
            await refreshCreator();
        } finally {
            setSubLoading(false);
        }
    };

    const handlePriceUpdate = async () => {
        if (!creator?.id) return;
        setPriceEditing(true);
        try {
            const { data } = await updateSubscriptionPrice(creator.id, newPrice);
            setCreator(prev => ({ ...prev, subscriptionPrice: newPrice }));
            alert("Цена подписки обновлена, автопродление снято у всех текущих подписчиков");
        } catch (err) {
            alert(err.response?.data?.message || "Ошибка обновления цены");
        } finally {
            setPriceEditing(false);
        }
    };

    const getPublicUrl = (url) => {
        if (!url) return "";
        const fileName = url.split("/").pop();
        return `/media/${fileName}`;
    };

    if (profileLoading) return <p>Загрузка креатора...</p>;
    if (!creator) return <p>Креатор не найден</p>;

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <img
                    src={getPublicUrl(creator.avatarUrl) || "/avatar-placeholder.jpeg"}
                    className={styles.avatar}
                />

                <div className={styles.headerMain}>
                    <div className={styles.identity}>
                        <h2>{creator.username}</h2>
                        {creator.bio && <p className={styles.bio}>{creator.bio}</p>}
                        <Link to={`/profile/${creator.username}`} className={`${styles.primaryButton} ${styles.profileLink}`}>
                            Смотреть профиль
                        </Link>
                    </div>

                    <div className={styles.actions}>
                        {!isMe && (
                            <>
                                <div className={styles.price}>
                                    {creator.subscriptionPrice}$ / месяц
                                </div>

                                {creator.isSubscribed ? (
                                    creator.autoR ? (
                                        <button onClick={handleCancel} disabled={subLoading}>
                                            Отписаться
                                        </button>
                                    ) : (
                                        <button onClick={handleSubscribe} disabled={subLoading}>
                                            Восстановить подписку
                                        </button>
                                    )
                                ) : (
                                    <button onClick={handleSubscribe} disabled={subLoading}>
                                        Подписаться
                                    </button>
                                )}
                                <div>
                                    {creator.isSubscribed ? (
                                        creator.autoR ? (
                                            <p> Следующее списание: {new Date(creator.expiresAt).toLocaleString()} </p>
                                        ) : (
                                        <p> Подписка закончится: {new Date(creator.expiresAt).toLocaleString()}<br/> Отменено: {new Date(creator.canceledAt).toLocaleString()} </p>
                                        )
                                    ) : (
                                        <button onClick={handleSubscribe} disabled={subLoading}>
                                            Подписаться
                                        </button>
                                    )}
                                </div>
                            </>
                        )}

                        {isMe && (
                            <div className={styles.primaryButton}>
                                <input
                                    type="number"
                                    min={1}
                                    value={newPrice}
                                    onChange={e => setNewPrice(+e.target.value)}
                                />
                                <button onClick={handlePriceUpdate} disabled={priceEditing}>
                                    Обновить цену
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>


            <div className={styles.searchFilters}>
                {isMe && (
                    <Link to="/posts/new" className={styles.primaryButton}>
                        Создать пост
                    </Link>
                )}
                <input
                    type="text"
                    placeholder="Поиск по постам..."
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                />
                <Filters filters={filters} onChange={setFilters} />
            </div>

            <div className={styles.posts}>
                {posts.map(post => (
                    <PostCard key={post.id} post={post} />
                ))}
            </div>

            {loading && <p>Загрузка...</p>}
            {!hasMore && <p>Больше постов нет</p>}
            <div ref={loaderRef} style={{ height: "20px" }} />
        </div>
    );
}
