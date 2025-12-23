import styles from "./ProfileCard.module.scss";

export default function ProfileCard({ profile }) {
    const getPublicUrl = (url) => {
        if (!url) return "";
        const fileName = url.split("/").pop();
        return `/media/${fileName}`;
    };
    return (
        <div className={styles.card}>
            <img
                src={getPublicUrl(profile.avatarUrl)  || "/avatar-placeholder.jpeg"}
                alt={profile.username}
                className={styles.avatar}
            />
            <div className={styles.info}>
                <h3>{profile.username}</h3>
                <p>{profile.bio || "Профиль пользователя"}</p>
            </div>
        </div>
    );
}
