import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import CreatePokemon from './CreatePokemon';
import Navigation from './Navigation';

function App() {
  return (
    <Router>
      <Navigation />  {/* Añade la barra de navegación */}
      <Routes>
        <Route path="/" element={<CreatePokemon />} />
      </Routes>
    </Router>
  );
}

export default App;