import Nav from '../layouts/Nav';
import Search from '../components/SearchContainer';
import Footer from '../components/Footer';
import QuickLinks from '../components/QuickLinks';
import { memo } from 'react';

const Home = memo(() => {
  return (
    <div className="relative min-h-screen bg-white">
      <Nav />
      <Search light />
      <QuickLinks />
      <Footer />
    </div>
  );
});

Home.displayName = 'Home';
export default Home;
