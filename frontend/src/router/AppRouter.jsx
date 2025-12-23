import {BrowserRouter, Routes, Route, Navigate} from "react-router-dom";
import MainLayout from "../pages/MainLayout/MainLayout.jsx";

import HomePage from "../pages/HomePage/HomePage.jsx";
import FeedPage from "../pages/FeedPage/FeedPage.jsx";
import CreatorPage from "../pages/CreatorPage/CreatorPage.jsx";

import LoginPage from "../pages/LoginPage/LoginPage.jsx";
import RegisterPage from "../pages/RegisterPage/RegisterPage.jsx";

import ProfilePage from "../pages/ProfilePage/ProfilePage.jsx";
import CreatePostPage from "../pages/CreatePostPage/CreatePostPage.jsx";

import ProtectedRoute from "./ProtectedRoute";
import GuestRoute from "./GuestRoute";
import PostEditorPage from "../pages/PostEditorPage/PostEditorPage.jsx";
import PostPage from "../pages/PostPage/PostPage.jsx";

export default function AppRouter() {
    return (
        <BrowserRouter>
            <Routes>
                <Route element={<MainLayout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/feed" element={<FeedPage />} />
                <Route path="/creator/:username" element={<CreatorPage />} />

                <Route
                    path="/login"
                    element={
                        <GuestRoute>
                            <LoginPage />
                        </GuestRoute>
                    }
                />
                <Route
                    path="/register"
                    element={
                        <GuestRoute>
                            <RegisterPage />
                        </GuestRoute>
                    }
                />

                <Route
                    path="/profile/:username"
                    element={
                        <ProtectedRoute>
                            <ProfilePage />
                        </ProtectedRoute>
                    }
                />
                    <Route
                        path="/posts/new"
                        element={
                            <ProtectedRoute>
                                <CreatePostPage mode="create" />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/post/:id"
                        element={
                            <ProtectedRoute>
                                <PostPage  />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/posts/:id/edit"
                        element={
                            <ProtectedRoute>
                                <PostEditorPage />
                            </ProtectedRoute>
                        }
                    />
                </Route>
                <Route path="*" element={<Navigate to="/feed" replace />} />
            </Routes>
        </BrowserRouter>
    );
}
