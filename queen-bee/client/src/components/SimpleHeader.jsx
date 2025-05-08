// import { Link } from "react-router-dom";
// import CartIcon from "./CartIcon";

// const Header = () => {
//   return (
//     <header
//       style={{
//         backgroundColor: "#fff8e1",
//         padding: "1rem",
//         borderBottom: "2px solid #ffd54f",
//       }}
//     >
//       <div
//         style={{
//           display: "flex",
//           justifyContent: "space-between",
//           alignItems: "center",
//           maxWidth: "1200px",
//           margin: "0 auto",
//         }}
//       >
//         <div>
//           <Link to="/" style={{ textDecoration: "none", color: "inherit" }}>
//             <h1
//               style={{
//                 fontSize: "1.8rem",
//                 margin: 0,
//                 color: "#f57f17",
//               }}
//             >
//               Queen Bee Candles
//             </h1>
//             <span
//               style={{
//                 fontSize: "1rem",
//                 color: "#7a5800",
//               }}
//             >
//               Pure NZ Beeswax
//             </span>
//           </Link>
//         </div>

//         <nav>
//           <ul
//             style={{
//               display: "flex",
//               listStyle: "none",
//               margin: 0,
//               padding: 0,
//             }}
//           >
//             <li style={{ margin: "0 1rem" }}>
//               <Link
//                 to="/"
//                 style={{
//                   textDecoration: "none",
//                   color: "#7a5800",
//                   fontWeight: 500,
//                 }}
//               >
//                 Home
//               </Link>
//             </li>
//             <li style={{ margin: "0 1rem" }}>
//               <CartIcon />
//             </li>
//           </ul>
//         </nav>
//       </div>
//     </header>
//   );
// };

// export default Header;

import { Link } from "react-router-dom";
import CartIcon from "./CartIcon";
import Logo from "./Logo";

const Header = () => {
  return (
    <header>
      <div>
        <div>
          <h1>Queen Bee Candles</h1>
          <span>Pure NZ Beeswax</span>
        </div>
        <div>
          <Logo />
        </div>
        <nav>
          <ul>
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <CartIcon />
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
