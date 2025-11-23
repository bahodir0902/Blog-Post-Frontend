// App.tsx
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./auth/AuthContext";
import { AppLayout } from "./layouts/AppLayout";

import Home from "./pages/Home";
import PostDetail from "./pages/PostDetail";
import Explore from "./pages/Explore";
import Read from "./pages/Read";
import Favourites from "./pages/Favourites";
import Bookmarks from "./pages/Bookmarks";

// Auth
import Login from "./pages/Login";
import Register from "./pages/Register/Register";
import VerifyRegistration from "./pages/Register/VerifyRegistration";
import ForgotPassword from "./pages/Auth/ForgotPassword";
import VerifyResetCode from "./pages/Auth/VerifyResetCode";
import ResetPassword from "./pages/Auth/ResetPassword";
import SetInitialPassword from "./pages/Auth/SetInitialPassword";

// Profile
import ProfilePage from "./pages/Profile/ProfilePage";
import EditProfile from "./pages/Profile/EditProfile";
import ChangeEmail from "./pages/Profile/ChangeEmail";
import ConfirmEmailChange from "./pages/Profile/ConfirmEmailChange";

// Writer
import CreatePost from "./pages/Writer/CreatePost";
import MyPosts from "./pages/Writer/MyPosts";
import EditPost from "./pages/Writer/EditPost";
import { RoleGate } from "./components/RoleGate";


function Protected({ children }: { children: React.ReactNode }) {
    const { accessToken } = useAuth();
    if (!accessToken) return <Navigate to="/login" replace />;
    return <>{children}</>;
}

export default function App() {
    return (
        <AppLayout>
            <Routes>
                {/* Public */}
                <Route path="/" element={<Home />} />
                <Route path="/explore" element={<Explore />} />
                <Route path="/read" element={<Read />} />
                <Route path="/post/:slug" element={<PostDetail />} />

                {/* Auth */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/register/verify" element={<VerifyRegistration />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/forgot-password/verify" element={<VerifyResetCode />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/activate" element={<SetInitialPassword />} />

                {/* Profile (protected) */}
                <Route
                    path="/profile"
                    element={
                        <Protected>
                            <ProfilePage />
                        </Protected>
                    }
                />
                <Route
                    path="/profile/edit"
                    element={
                        <Protected>
                            <EditProfile />
                        </Protected>
                    }
                />
                <Route
                    path="/profile/change-email"
                    element={
                        <Protected>
                            <ChangeEmail />
                        </Protected>
                    }
                />
                <Route
                    path="/profile/change-email/confirm"
                    element={
                        <Protected>
                            <ConfirmEmailChange />
                        </Protected>
                    }
                />

                {/* Favourites & Bookmarks (protected) */}
                <Route
                    path="/favourites"
                    element={
                        <Protected>
                            <Favourites />
                        </Protected>
                    }
                />
                <Route
                    path="/bookmarks"
                    element={
                        <Protected>
                            <Bookmarks />
                        </Protected>
                    }
                />

                {/* Writer (protected, writer/admin only) */}
                <Route
                    path="/writer/new"
                    element={
                        <RoleGate writerOnly>
                            <CreatePost />
                        </RoleGate>
                    }
                />
                <Route
                    path="/writer/my-posts"
                    element={
                        <RoleGate writerOnly>
                            <MyPosts />
                        </RoleGate>
                    }
                />
                <Route
                    path="/writer/edit/:slug"
                    element={
                        <RoleGate writerOnly>
                            <EditPost />
                        </RoleGate>
                    }
                />

                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </AppLayout>
    );
}