import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import History from '../pages/History';
import NotFound from '../pages/NotFound';
import Inspection from '../pages/Inspection';
import Result from '../pages/Result';


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
  },
  {
    path: '/result',
    element: <Result />
  }
]);

const AppRoutes = () => {
  return <RouterProvider router={router} />;
};

export default AppRoutes;
