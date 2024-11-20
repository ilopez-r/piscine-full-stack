import { Link } from 'react-router-dom';
import './Navigation.css';  // Importa el archivo CSS para los estilos

function Navigation() {
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <h1 className="nav-main"><Link to="/">Pókemon Competitive Calculator</Link></h1>  {/* Puedes agregar un logo o título */}
      </div>
      <ul className="navbar-links">
        <li className="nav-item"><Link to="/login">Login</Link></li>
      </ul>
    </nav>
  );
}

export default Navigation;
