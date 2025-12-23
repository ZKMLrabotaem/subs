import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.js";
import styles from "./AuthPage.module.scss";

export default function LoginPage() {
    const { login } = useAuth();
    const navigate = useNavigate();

    const [form, setForm] = useState({ email: "", password: "" });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleChange = e => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async e => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            await login(form);
            navigate("/feed");
        } catch (err) {
            setError("Неверный email или пароль");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.page}>
            <h1>Вход</h1>

            <form onSubmit={handleSubmit} className={styles.form}>
                <input
                    name="email"
                    placeholder="Email"
                    value={form.email}
                    onChange={handleChange}
                    required
                />
                <input
                    name="password"
                    type="password"
                    placeholder="Пароль"
                    value={form.password}
                    onChange={handleChange}
                    required
                />

                {error && <p className={styles.error}>{error}</p>}

                <button disabled={loading}>
                    {loading ? "Входим..." : "Войти"}
                </button>
            </form>

            <p>
                Нет аккаунта? <Link to="/register">Регистрация</Link>
            </p>
        </div>
    );
}
