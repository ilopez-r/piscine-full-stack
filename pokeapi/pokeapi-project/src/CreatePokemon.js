import React, { useState, useEffect } from 'react';
import './CreatePokemon.css'; // Importamos el archivo CSS

function CreatePokemon() {
  const [pokemonTypes, setPokemonTypes] = useState([]);
  const [firstType, setFirstType] = useState("");
  const [secondType, setSecondType] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);

  // Hacer la solicitud a PokeAPI cuando el componente se monte
  useEffect(() => {
    fetch('https://pokeapi.co/api/v2/type')
      .then((response) => response.json())
      .then((data) => {
        setPokemonTypes(data.results);
      })
      .catch((error) => {
        console.error('Error fetching data from PokeAPI:', error);
      });
  }, []);

  const handleFirstTypeChange = (e) => {
    setFirstType(e.target.value);
    setSecondType(""); // Reseteamos el segundo tipo al cambiar el primero
  };

  const handleSecondTypeChange = (e) => {
    setSecondType(e.target.value);
  };

  const handleGenerateImage = async () => {
    setLoading(true); // Activar el estado de carga
    const prompt = `A Pokémon of types ${firstType} and ${secondType} with the following description: ${description}`;

    try {
      const response = await fetch('https://cors-anywhere.herokuapp.com/https://api.replicate.com/v1/predictions', {
        method: 'POST',
        headers: {
          Authorization: `Token r8_E1cmVEat5aNV9kY2A9Qlzs0SKtXg9q6446V4p`, // Reemplaza esto con tu API key
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          version: 'lambdal/text-to-pokemon',
          input: { prompt: prompt },
        }),
      });
    
      // Comprobar si la respuesta es OK
      if (!response.ok) {
        const errorText = await response.text(); // Leer la respuesta como texto
        throw new Error(`Error conecting to API: ${response.status} ${errorText}`);
      }
    
      const data = await response.json();
      setImageUrl(data.output); // Almacena la URL de la imagen generada
    } catch (error) {
      console.error('Error generating image:', error);
    } finally {
      setLoading(false); // Desactivar el estado de carga
    }
  }

  return (
    <div className="create-pokemon-container">
      <h1 className="create-pokemon-header">Create your Pokémon</h1>

      {/* Dropdown para seleccionar el primer tipo de Pokémon */}
      <label className="create-pokemon-label">Select First Pokémon Type: </label>
      <select className="create-pokemon-select" value={firstType} onChange={handleFirstTypeChange}>
        <option value="">-- Select a Type --</option>
        {pokemonTypes.map((type) => (
          <option key={type.name} value={type.name}>
            {type.name.charAt(0).toUpperCase() + type.name.slice(1)}
          </option>
        ))}
      </select>

      {firstType && (
        <>
          <label className="create-pokemon-label">Select Second Pokémon Type: </label>
          <select className="create-pokemon-select" value={secondType} onChange={handleSecondTypeChange}>
            <option value="">-- Select a Second Type --</option>
            {pokemonTypes.map((type) => (
              <option key={type.name} value={type.name}>
                {type.name.charAt(0).toUpperCase() + type.name.slice(1)}
              </option>
            ))}
          </select>
        </>
      )}

      {/* Campo para ingresar la descripción del Pokémon */}
      <label className="create-pokemon-label">Describe your Pokémon: </label>
      <input
        className="create-pokemon-input"
        type="text"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Enter a description"
      />

      {/* Botón para generar la imagen */}
      <button
        className="create-pokemon-button"
        onClick={handleGenerateImage}
        disabled={!firstType || !secondType || !description}
      >
        Generate Pokémon Image
      </button>

      {/* Muestra un indicador de carga */}
      {loading && <p className="create-pokemon-loading">Generating image...</p>}

      {/* Muestra la imagen generada si está disponible */}
      {imageUrl && <img className="create-pokemon-image" src={imageUrl} alt="Generated Pokémon" />}
    </div>
  );
}

export default CreatePokemon;
