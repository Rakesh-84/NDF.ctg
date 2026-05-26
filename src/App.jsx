import { Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import Signup from './pages/Signup'
import StorageTest from './pages/StorageTest'
import ProtectedRoute from './components/ui/layout/ProtectedRoute'
import Home from './pages/Home'
import Events from "./pages/Events";
import EventDetail from "./pages/EventDetail";
import Blog       from "./pages/Blog";
import PostDetail from "./pages/PostDetail";
import WritePost from "./pages/member/WritePost";
import About   from "./pages/About";
import Contact from "./pages/Contact";
import Breadcrumb from "./components/ui/layout/Breadcrumb";
import Announcements from "./pages/Announcement";
import Notices from "./pages/Notices";
import ManageNotices from "./pages/admin/Managenotices";
import ManagePosts from "./pages/admin/Manageposts";
import ResetPassword from "./pages/ResetPassword";
import MemberDashboard from "./pages/member/MemberDashboard";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ManageEvents from "./pages/admin/ManageEvents";
import ManageMembers from "./pages/admin/ManageMembers";
import ManageAnnouncements from "./pages/admin/ManageAnnouncements";
import Gallery from "./pages/Gallery";
import MyPosts from "./pages/member/MyPosts";
import EditProfile from "./pages/member/Profile";


// Placeholder pages — we'll build these next



function App() {
  return (
    <>
      <Breadcrumb />
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Home />} />
        <Route path="/events" element={<Events />} />
        <Route path="/events/:id" element={<EventDetail />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slugOrId" element={<PostDetail />} />
        <Route path="/announcements" element={<Announcements />} />
        <Route path="/notices" element={<Notices />} />
        <Route path="/login" element={<Login />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/storage-test" element={<StorageTest />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/gallery" element={<Gallery />} />

        {/* Member routes */}
        <Route
          path="/member/dashboard"
          element={
            <ProtectedRoute>
              <MemberDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/member/write"
          element={
            <ProtectedRoute>
              <WritePost />
            </ProtectedRoute>
          }
        />
        <Route
          path="/member/posts"
          element={
            <ProtectedRoute>
              <MyPosts />
            </ProtectedRoute>
          }
        />
        <Route
          path="/member/profile"
          element={
            <ProtectedRoute>
              <EditProfile />
            </ProtectedRoute>
          }
        />
       
        {/* Admin routes */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute adminOnly>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/notices"
          element={
            <ProtectedRoute adminOnly>
              <ManageNotices />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/posts"
          element={
            <ProtectedRoute adminOnly>
              <ManagePosts />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/events"
          element={
            <ProtectedRoute adminOnly>
              <ManageEvents />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/members"
          element={
            <ProtectedRoute adminOnly>
              <ManageMembers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/announcements"
          element={
            <ProtectedRoute adminOnly>
              <ManageAnnouncements />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}

export default App
