import { Outlet } from 'react-router-dom';
import Topbar from '../components/common/Topbar';
import ProfileCard from '../components/common/ProfileCard';

export default function AccountLayout() {
  return (
    <>
      <Topbar />
      <ProfileCard />
      <Outlet />
    </>
  );
}
