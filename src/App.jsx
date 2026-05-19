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
      <Route path="/blog"        element={<Blog />} />
      <Route path="/blog/:slugOrId" element={<PostDetail />} />
        <Route path="/announcements" element={<Announcements />} />
        <Route path="/notices" element={<Notices />} />
        <Route path="/login" element={<Login />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/storage-test" element={<StorageTest />} />
      <Route path="/about"   element={<About />} />
      <Route path="/contact" element={<Contact />} />

      {/* Member routes */}
      <Route path="/member/dashboard" element={
        <ProtectedRoute>
          <MemberDashboard />
        </ProtectedRoute>
      } />
      <Route path="/member/write-post" element={
       <ProtectedRoute>
          <WritePost />
       </ProtectedRoute>
        } />

      {/* Admin routes */}
      <Route path="/admin/dashboard" element={
        <ProtectedRoute adminOnly>
          <AdminDashboard />
        </ProtectedRoute>
      } />
        <Route path="/admin/notices" element={<ProtectedRoute adminOnly><ManageNotices /></ProtectedRoute>} />
        <Route path="/admin/posts" element={<ProtectedRoute adminOnly><ManagePosts /></ProtectedRoute>} />
      </Routes>
      </>
  )
}

export default App
