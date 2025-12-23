import styles from "./CreatorCard.module.scss";
import {Link} from "react-router-dom";

export default function CreatorCard({ creator, exp, cnl }) {
    const getPublicUrl = (url) => {
        if (!url) return "";
        const fileName = url.split("/").pop();
        return `/media/${fileName}`;
    };
    return (
    <div className={styles.card}>
        <img
            src={getPublicUrl(creator.avatarUrl) || "/avatar-placeholder.jpeg"}
            className={styles.avatar}
        />

        <div className={styles.info}>
            <Link to={`/creator/${creator.username}`} className={styles.username}>
                {creator.username}
            </Link>

            {creator.bio && <p className={styles.bio}>{creator.bio}</p>}

            <div className={styles.meta}>
                {creator.creatorProfile.subscriptionPrice}$ / месяц
            </div>

            <div className={styles.subInfo}>
                {cnl ? (
                    <>
                        <span>До: {new Date(exp).toLocaleDateString()}</span>
                        <span className={styles.canceled}>. Отменено: {new Date(cnl).toLocaleString()}</span>
                    </>
                ) : (
                    <span>Следующее списание: {new Date(exp).toLocaleDateString()}</span>
                )}
            </div>
        </div>
    </div>

);
}
