import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Hero from './components/Hero';
import Dashboard from './components/Dashboard';
import Bids from './components/Bids';
import AllAuctions from './components/Auctions';
import Auction from './components/Auction';
import Login from './components/Login';
import User from './components/User';
import "./tailwind.css";
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';

function AppRoutes() {
  const location = useLocation();
  const backgroundLocation = location.state?.backgroundLocation;

  return (
    <>
      <Routes location={backgroundLocation || location}>
        <Route path="/" element={<><Hero /><Dashboard /></>} />
        <Route path="/auctions" element={<AllAuctions />} />
        <Route path="/auctions/:id" element={<Auction />} />
        <Route path="/bids" element={<Bids />} />
        <Route path="/login" element={<Login />} />
        <Route path="/user" element={<User />} />
      </Routes>

      {backgroundLocation && (
        <Routes>
          <Route path="/auctions/:id" element={<Auction isModal />} />
        </Routes>
      )}
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <div className="bg-blue-50 w-full min-h-screen flex flex-col">
        <Navbar />
        <main className="grow w-full">
          <div className="layout-16by9 px-4 sm:px-6 lg:px-8">
            <AppRoutes />
          </div>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;