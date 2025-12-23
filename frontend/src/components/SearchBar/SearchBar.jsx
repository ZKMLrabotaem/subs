import styles from "./SearchBar.module.scss";

export default function SearchBar({ value, onChange }) {
    return (
        <input
            className={styles.input}
            placeholder="Поиск постов и авторов..."
            value={value}
            onChange={(e) => onChange(e.target.value)}
        />
    );
}
