import Search from '../components/SearchContainer';
import QuickLinks from '../components/QuickLinks';
import { memo } from 'react';

const Home = memo(() => {
  return (
    <div className="relative flow-root min-h-screen bg-white">
      <Search light />
      <QuickLinks />
    </div>
  );
});

Home.displayName = 'Home';
export default Home;
