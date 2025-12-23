import {useCallback, useEffect, useState} from "react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.js";
import CreatorCard from "../../components/CreatorCard/CreatorCard";
import { mySubscriptions } from "../../api/subscriptions";
import { getByUsername, updateMe } from "../../api/users";
import { voteProfile as apiVoteProfile } from "../../api/votes.js";
import { upgradeToCreator } from "../../api/users";

import styles from "./ProfilePage.module.scss";

export default function ProfilePage() {
    const { username } = useParams();
    const { user: authUser, refresh } = useAuth();

    const [profile, setProfile] = useState(null);
    const [profileLoading, setProfileLoading] = useState(true);
    const [editMode, setEditMode] = useState(false);
    const [form, setForm] = useState({ username: "", bio: "", avatar: null });
    const [creatorLoading, setCreatorLoading] = useState(false);
    const [price, setPrice] = useState(5);
    const [subscriptions, setSubscriptions] = useState([]);

    const isMe = authUser?.username === username;

    const loadProfile = useCallback(async () => {
        setProfileLoading(true);
        try {
            const { data } = await getByUsername(username);
            setProfile(data);

            if (isMe) {
                setForm({
                    username: data.username || "",
                    bio: data.bio || "",
                    avatar: null
                });
            }
        } catch (e) {
            console.error("Profile load failed", e);
        } finally {
            setProfileLoading(false);
        }
    }, [username, isMe]);
    useEffect(() => {
        loadProfile();
    }, [loadProfile]);
    useEffect(() => {
        if (!isMe) return;
        async function loadSubs() {
            try {
                const { data } = await mySubscriptions();
                setSubscriptions(data);
            } catch (err) {
                console.error(err);
            }
        }
        loadSubs();
    }, [isMe]);
    const handleVote = async (value) => {
        if (!profile) return;
        const { data } = await apiVoteProfile(profile.id, value);
        setProfile(prev => ({
            ...prev,
            likes: data.likes,
            dislikes: data.dislikes,
            myVote: data.myVote
        }));
    };

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        if (name === "avatar") {
            setForm(prev => ({ ...prev, avatar: files[0] }));
        } else {
            setForm(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSave = async () => {
        const fd = new FormData();
        fd.append("username", form.username);
        fd.append("bio", form.bio);
        if (form.avatar) fd.append("avatar", form.avatar);
        try {
            const { data } = await updateMe(fd);
            setProfile(prev => ({ ...prev, ...data }));
            setEditMode(false);
        } catch (err) {
            console.error("Failed to update profile", err);
        }
    };

    const handleBecomeCreator = async () => {
        setCreatorLoading(true);
        try {
            const { data } = await upgradeToCreator({ subscriptionPrice: price });
            setProfile(prev => ({ ...prev, creatorProfile: data.creatorProfile }));
            await refresh();
            await loadProfile();
        } catch (e) {
            alert(e.response?.data?.message || "Ошибка");
        } finally {
            setCreatorLoading(false);
        }
    };

    const getPublicUrl = (url) => {
        if (!url) return "";
        const fileName = url.split("/").pop();
        return `/media/${fileName}`;
    };

    if (profileLoading) return <p>Загрузка профиля...</p>;
    if (!profile) return <p>Пользователь не найден</p>;

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                {/* ===== TOP ROW ===== */}
                <div className={styles.headerTop}>
                    {/* LEFT */}
                    <div className={styles.left}>
                        <img
                            src={getPublicUrl(profile.avatarUrl) || "/avatar-placeholder.jpeg"}
                            className={styles.avatar}
                        />

                        <div className={styles.identity}>
                            <h2>{profile.username}</h2>
                            {profile.bio && <p className={styles.bio}>{profile.bio}</p>}

                            {profile.creatorProfile ? (
                                <Link
                                    to={`/creator/${profile.username}`}
                                    className={styles.primaryButton}
                                >
                                    Перейти к контенту
                                </Link>
                            ) : (
                                <p className={styles.muted}>Пользователь ещё не стал креатором</p>
                            )}
                        </div>
                    </div>

                    {/* RIGHT */}
                    <div className={styles.actions}>
                        <div className={styles.votes}>
                            <button onClick={() => handleVote(1)} disabled={profile.myVote === 1}>
                                👍 {profile.likes || 0}
                            </button>
                            <button onClick={() => handleVote(-1)} disabled={profile.myVote === -1}>
                                👎 {profile.dislikes || 0}
                            </button>
                        </div>

                        {isMe && (
                            <button
                                onClick={() => setEditMode(prev => !prev)}
                                className={styles.primaryButton}
                            >
                                Редактировать профиль
                            </button>
                        )}
                    </div>
                </div>

                {isMe && editMode && (
                    <div className={styles.editCard}>
                        <h3>Редактирование профиля</h3>

                        <div className={styles.editGrid}>
                            {/* LEFT COLUMN */}
                            <div className={styles.editLeft}>
                                <label>
                                    Ник
                                    <input
                                        name="username"
                                        value={form.username}
                                        onChange={handleChange}
                                    />
                                </label>

                                <label>
                                    Описание
                                    <textarea
                                        name="bio"
                                        value={form.bio}
                                        onChange={handleChange}
                                        rows={4}
                                    />
                                </label>
                            </div>

                            {/* RIGHT COLUMN */}
                            <div className={styles.editRight}>
                                <label>
                                    Аватар
                                    <input
                                        type="file"
                                        name="avatar"
                                        accept="image/*"
                                        onChange={handleChange}
                                    />
                                </label>

                                <img
                                    src={
                                        form.avatar
                                            ? URL.createObjectURL(form.avatar)
                                            : getPublicUrl(profile.avatarUrl) || "/avatar-placeholder.jpeg"
                                    }
                                    className={styles.avatarPreview}
                                />
                                <div>
                                    <button
                                        className={styles.primaryButton}
                                        onClick={handleSave}
                                    >
                                        Сохранить
                                    </button>

                                    <button
                                        className={styles.secondaryButton}
                                        onClick={() => setEditMode(false)}
                                    >
                                        Отмена
                                    </button>
                                </div>

                            </div>
                        </div>
                    </div>
                )}
                {isMe && !profile.creatorProfile && ( <div className={styles.creatorUpgrade}> <h3>Стать креатором</h3> <p className={styles.muted}> Вы сможете публиковать платный контент и получать подписчиков </p> <label> Цена подписки ($ / месяц) <input type="number" min={1} value={price} onChange={e => setPrice(+e.target.value)} /> </label> <button className={styles.primaryButton} onClick={handleBecomeCreator} disabled={creatorLoading} > {creatorLoading ? "Подключаем..." : "Стать креатором"} </button> </div> )}
            </div>
            {isMe && subscriptions.length > 0 && (
                <div>
                    <h3>Подписки</h3>
                    {subscriptions.map(sub => (
                        <CreatorCard key={sub.creator.id} creator={sub.creator} exp={sub.expiresAt} cnl={sub.canceledAt} />
                    ))}
                </div>
            )}
        </div>
    );
}
