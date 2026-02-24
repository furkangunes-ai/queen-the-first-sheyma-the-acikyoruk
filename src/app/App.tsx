import { RouterProvider } from 'react-router';
import { router } from './routes';
import { AppProvider } from './store/AppContext';
import { Toaster } from 'sonner';

function App() {
  return (
    <AppProvider>
      <RouterProvider router={router} />
      <Toaster position="top-center" />
    </AppProvider>
  );
}

export default App;
