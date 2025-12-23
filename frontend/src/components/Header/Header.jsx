import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import styles from "./Header.module.scss";

export default function Header() {
    const { user, isAuth, logout } = useAuth();

    return (
        <header className={styles.header}>
            <div className={styles.logo}>
                <Link to="/">Subscription</Link>
            </div>

            <nav className={styles.nav}>
                <Link to="/feed">Лента</Link>

                {isAuth ? (
                    <>
                        {user.role === "CREATOR" && (
                            <Link to={`/creator/${user.username}`}>Creator</Link>
                        )}
                        <Link to={`/profile/${user.username}`}>
                            {user.username}
                        </Link>
                        <p> Баланс: ${user.balance}</p>
                        <button onClick={logout} className={styles.logout}>
                            Выйти
                        </button>
                    </>
                ) : (
                    <>
                        <Link to="/login">Вход</Link>
                        <Link to="/register">Регистрация</Link>
                    </>
                )}
            </nav>
        </header>
    );
}
