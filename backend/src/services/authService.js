import bcrypt from "bcryptjs";
import prisma from "../prisma/prismaClient.js";
import { generateToken } from "../utils/jwt.js";

export async function registerUser({ email, username, password }) {
    const existingUser = await prisma.user.findFirst({
        where: {
            OR: [{ email }, { username }]
        }
    });

    if (existingUser) {
        throw new Error("User already exists");
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
        data: {
            email,
            username,
            passwordHash
        }
    });

    const token = generateToken({
        id: user.id,
        role: user.role
    });

    return { user, token };
}

export async function loginUser({ email, password }) {
    const user = await prisma.user.findUnique({
        where: { email }
    });

    if (!user) {
        throw new Error("Invalid credentials");
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
        throw new Error("Invalid credentials");
    }

    const token = generateToken({
        id: user.id,
        role: user.role
    });

    return { user, token };
}
