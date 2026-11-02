import { AppShell } from '../components/layout/AppShell'
import { AppRoutes } from './routes'

function App() {
  return (
    <AppShell showAccount={import.meta.env.MODE === 'auth-tests' && import.meta.env.DEV}>
      <AppRoutes />
    </AppShell>
  )
}

export default App
