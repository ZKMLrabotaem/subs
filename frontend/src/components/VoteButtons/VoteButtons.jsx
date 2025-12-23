import { votePost } from "../../api/votes";
import { useState } from "react";
import styles from "./VoteButtons.module.scss";

export default function VoteButtons({ entity, initial }) {
    const [myVote, setMyVote] = useState(initial.myVote);
    const [likes, setLikes] = useState(initial.likes);
    const [dislikes, setDislikes] = useState(initial.dislikes);

    const sendVote = async (value) => {
        const newValue = myVote === value ? 0 : value;
        await votePost(entity.id, newValue);

        if (myVote === 1) setLikes(l => l - 1);
        if (myVote === -1) setDislikes(d => d - 1);

        if (newValue === 1) setLikes(l => l + 1);
        if (newValue === -1) setDislikes(d => d + 1);

        setMyVote(newValue);
    };

    return (
        <div className={styles.votes}>
            <button
                className={myVote === 1 ? styles.active : ""}
                onClick={() => sendVote(1)}
            >
                👍 {likes}
            </button>

            <button
                className={myVote === -1 ? styles.active : ""}
                onClick={() => sendVote(-1)}
            >
                👎 {dislikes}
            </button>
        </div>
    );
}
