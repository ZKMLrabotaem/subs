import { useState, useCallback, useRef, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth.js";

import PostCard from "../../components/PostCard/PostCard";
import Filters from "../../components/Filters/Filters";
import { search } from "../../api/search";
import { useInfiniteScroll } from "../../hooks/useInfiniteScroll";
import styles from "./FeedPage.module.scss";
const PAGE_SIZE = 10;

export default function FeedPage() {
    const { user } = useAuth();

    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [skip, setSkip] = useState(0);

    const [query, setQuery] = useState("");
    const [filters, setFilters] = useState({ sort: "new", access: "all" });

    const loaderRef = useRef(null);

    useEffect(() => {
        setPosts([]);
        setSkip(0);
        setHasMore(true);
    }, [query, filters.sort, filters.access]);

    const loadPosts = useCallback(async () => {
        if (loading || !hasMore) return;
        setLoading(true);

        try {
            const { data, total } = await search({
                q: query || undefined,
                sort: filters.sort,
                access: filters.access,
                skip,
                take: PAGE_SIZE
            });

            setPosts(prev => [...prev, ...data]);
            setSkip(prev => prev + data.length);

            if (skip + data.length >= total) setHasMore(false);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [query, filters, skip, hasMore, loading]);

    useInfiniteScroll(loaderRef, loadPosts);

    return (
        <div className={styles.page}>
            <h1>Лента</h1>

            <input
                className={styles.search}
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Поиск по постам и авторам"
            />
            <div className={styles.filters}>
                <Filters filters={filters} onChange={setFilters} />
            </div>

            <div className={styles.posts}>
                {posts.map(post => (
                    <PostCard key={post.id} post={post} className={styles.postCard} />
                ))}
            </div>

            {loading && <p className={styles.loader}>Загрузка...</p>}
            {!hasMore && <p className={styles.loader}>Больше постов нет</p>}
            <div ref={loaderRef} style={{ height: "20px" }} />
        </div>
    );
}
