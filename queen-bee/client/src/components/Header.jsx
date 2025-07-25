import { useState } from "react";
import { Link } from "react-router-dom";
import logo from "../assets/logo.png";
import CartIcon from "./CartIcon";

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <header className="header" role="banner">
      <div className="header-container">
        <div className="header-top">
          <div className="logo-wrapper">
            <Link to="/" aria-label="Queen Bee Candles - Go to homepage">
              <img src={logo} alt="Queen Bee Candles Logo" className="logo" />
            </Link>
          </div>

          <div className="header-title">
            <h1>Queen Bee Candles</h1>
            <p>Pure NZ Beeswax</p>
          </div>

          {/* Add the cart icon here for mobile view */}
          <div className="mobile-cart">
            <CartIcon />
          </div>

          <button
            className={`menu-toggle ${menuOpen ? "active" : ""}`}
            onClick={toggleMenu}
            aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={menuOpen}
            aria-controls="main-navigation"
          >
            <span className="menu-icon" aria-hidden="true"></span>
          </button>
        </div>

        <div className="nav-container">
          <nav 
            className={`main-nav ${menuOpen ? "is-open" : ""}`}
            role="navigation"
            aria-label="Main navigation"
            id="main-navigation"
          >
            <ul role="list">
              <li>
                <Link to="/" onClick={() => setMenuOpen(false)}>
                  Home
                </Link>
              </li>
              <li>
                <Link to="/about" onClick={() => setMenuOpen(false)}>
                  About
                </Link>
              </li>
              <li>
                <Link to="/contact" onClick={() => setMenuOpen(false)}>
                  Contact
                </Link>
              </li>
              <li className="cart-nav-item">
                <CartIcon />
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
