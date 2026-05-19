import { useAuth } from '../context/AuthContext'

function Navbar() {
  const { user, profile, isAdmin, signOut } = useAuth()

  if (!user) return <a href="/login">Log in</a>
  return (
    <div>
      <span>{profile?.display_name}</span>
      {isAdmin && <a href="/admin">Admin</a>}
      <button onClick={signOut}>Log out</button>
    </div>
  )
}