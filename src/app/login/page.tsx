import LoginForm from '@/components/auth/LoginForm'
import ProtectedRoute from '@/components/ProtectedRoute'

export default function LoginPage() {
  return (
    <ProtectedRoute requireAuth={false} redirectTo="/dashboard">
      <main className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <LoginForm />
        </div>
      </main>
    </ProtectedRoute>
  )
}