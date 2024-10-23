import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import History from '../pages/History';
import NotFound from '../pages/NotFound';
import Inspection from '../pages/Inspection';
import Result from '../pages/Result';
import EditInspection from '../pages/EditInspection';


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
    path: '/result/:inspectionId',
    element: <Result />
  },
  {
    path: '/inspection/edit/:inspectionId',
    element: <EditInspection />
  }
]);

const AppRoutes = () => {
  return <RouterProvider router={router} />;
};

export default AppRoutes;
