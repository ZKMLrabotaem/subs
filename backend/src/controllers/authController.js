import { registerUser, loginUser } from "../services/authService.js";

export async function register(req, res) {
    try {
        const { email, username, password } = req.body;

        if (!email || !username || !password) {
            return res.status(400).json({ message: "Missing fields" });
        }

        const { user, token } = await registerUser({
            email,
            username,
            password
        });

        res.cookie("token", token, {
            httpOnly: true,
            sameSite: "lax"
        });

        res.status(201).json({
            id: user.id,
            username: user.username,
            role: user.role
        });
    } catch (err) {
        res.status(409).json({ message: err.message });
    }
}

export async function login(req, res) {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Missing fields" });
        }

        const { user, token } = await loginUser({ email, password });

        res.cookie("token", token, {
            httpOnly: true,
            sameSite: "lax"
        });

        res.json({
            id: user.id,
            username: user.username,
            role: user.role
        });
    } catch (err) {
        res.status(401).json({ message: err.message });
    }
}

export function logout(req, res) {
    res.clearCookie("token");
    res.json({ message: "Logged out" });
}

export function me(req, res) {
    res.json(req.user);
}
