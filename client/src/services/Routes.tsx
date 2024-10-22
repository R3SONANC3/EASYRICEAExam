import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import History from '../pages/History';
import NotFound from '../pages/NotFound';
import Inspection from '../pages/Inspection';


const router = createBrowserRouter([
  {
    path: '/',
    element: <History />
  },
  {
    path: '*',
    element: <NotFound />, 
  },
  {
    path: '/inspection',
    element: <Inspection />
  }
]);

const AppRoutes = () => {
  return <RouterProvider router={router} />;
};

export default AppRoutes;
