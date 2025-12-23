import styles from "./Filters.module.scss";

export default function Filters({ filters, onChange }) {
    return (
        <div className={styles.filters}>
            <select
                value={filters.sort}
                onChange={(e) =>
                    onChange({ ...filters, sort: e.target.value })
                }
            >
                <option value="new">Сначала новые</option>
                <option value="old">Сначала старые</option>
                <option value="popular">Популярные</option>
            </select>

            <select
                value={filters.access}
                onChange={(e) =>
                    onChange({ ...filters, access: e.target.value })
                }
            >
                <option value="all">Все</option>
                <option value="free">Только бесплатные</option>
            </select>
        </div>
    );
}
