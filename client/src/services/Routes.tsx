import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Home from '../pages/Home';
import NotFound from '../pages/NotFound';


const router = createBrowserRouter([
  {
    path: '/',
    element: <Home />,
    errorElement: <NotFound />, // Error boundary for 404
  },
  {
    path: '*',
    element: <NotFound />, // Catch-all route for 404
  },
]);

const AppRoutes = () => {
  return <RouterProvider router={router} />;
};

export default AppRoutes;
