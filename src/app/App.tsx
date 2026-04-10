import { RouterProvider } from 'react-router';
import { router } from './routes.tsx';
import { AuthProvider } from './components/AuthContext';
import { Toaster } from 'sonner';

export default function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
      <Toaster position="top-right" />
    </AuthProvider>
  );
}
