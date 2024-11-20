import React, { useState } from 'react';
import './CreatePokemon.css'; // Importamos el archivo CSS

function CreatePokemon() {
  const [searchTerm, setSearchTerm] = useState("");
  const [pokemonData, setPokemonData] = useState(null);
  const [selectedAbility, setSelectedAbility] = useState("");
  const [selectedMove, setSelectedMove] = useState(""); // Estado para el movimiento seleccionado
  const [moveEffectiveness, setMoveEffectiveness] = useState(null); // Efectividad del movimiento
  const [error, setError] = useState(null);
  const [typeWeaknesses, setTypeWeaknesses] = useState({});
  const [originalWeaknesses, setOriginalWeaknesses] = useState({}); // Guardar debilidades originales

  // Objeto de habilidades que otorgan inmunidad a ciertos tipos
  const abilityImmunities = {
    "levitate": ['ground'],
    "water-absorb": ['water'],
    "volt-absorb": ['electric'],
    "motor-drive": ['electric'],
    "flash-fire": ['fire'],
    "sap-sipper": ['grass'],
    "storm-drain": ['water'],
    "lightning-rod": ['electric'],
    "dry-skin": ['water'],
    "wonder-guard": ['normal', 'water', 'electric', 'grass', 'ice', 'fighting', 'poison', 'ground', 
        'psychic', 'bug', 'dragon', 'steel', 'fairy'], // Inmunidad especial
    // Añade más habilidades según sea necesario
  };

  const typeColors = {
    normal: '#A8A78D',
    fire: '#C22E28',
    water: '#6390F0',
    electric: '#F7D02C',
    grass: '#7AC74C',
    ice: '#96D9D6',
    fighting: '#EE8130',
    poison: '#A33EA1',
    ground: '#895721',
    flying: '#A98FF3',
    psychic: '#F95587',
    bug: '#A6B91A',
    rock: '#B6A136',
    ghost: '#735797',
    dragon: '#6F35FC',
    dark: '#705746',
    steel: '#B7B9D0',
    fairy: '#D685AD',
  };
  

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setPokemonData(null);
    setSelectedAbility(""); // Resetear la habilidad seleccionada
    setSelectedMove(""); // Resetear el movimiento seleccionado
    setMoveEffectiveness(null); // Resetear la efectividad del movimiento
    setTypeWeaknesses({}); // Resetear debilidades de tipos

    try {
      const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${searchTerm.toLowerCase()}`);
      if (!response.ok) {
        throw new Error(`Pokémon not found`);
      }
      const data = await response.json();
      setPokemonData(data);

      // Obtener las debilidades del Pokémon a través de sus tipos
      const types = data.types.map(type => type.type.name);
      
      // Obtener la efectividad de cada tipo
      const weaknessesPromises = types.map(type => fetch(`https://pokeapi.co/api/v2/type/${type}`));
      const weaknessesResponses = await Promise.all(weaknessesPromises);
      const weaknessesData = await Promise.all(weaknessesResponses.map(res => res.json()));

      // Preparar un objeto para almacenar las debilidades
      const weaknessesMap = {
        "Takes 4x from": [],
        "Takes 2x from": [],
        "Takes 1x from": [],
        "Takes 0.5x from": [],
        "Takes 0.25x from": [],
        "Takes 0x from": [],
      };

      // Rellenar el mapa de debilidades con las relaciones de daño
      weaknessesData.forEach(type => {
        if (type.damage_relations) {
          if (type.damage_relations.double_damage_from) {
            type.damage_relations.double_damage_from.forEach(weakType => {
              weaknessesMap["Takes 2x from"].push(weakType.name);
            });
          }
          if (type.damage_relations.half_damage_from) {
            type.damage_relations.half_damage_from.forEach(weakType => {
              weaknessesMap["Takes 0.5x from"].push(weakType.name);
            });
          }
          if (type.damage_relations.no_damage_from) {
            type.damage_relations.no_damage_from.forEach(weakType => {
              weaknessesMap["Takes 0x from"].push(weakType.name);
            });
          }
        }
      });

      // Eliminar duplicados
      Object.keys(weaknessesMap).forEach(category => {
        weaknessesMap[category] = [...new Set(weaknessesMap[category])];
      });

      // Filtrar tipos en otras categorías si están en No Damage
      const noDamageTypes = weaknessesMap["Takes 0x from"];
      weaknessesMap["Takes 2x from"] = weaknessesMap["Takes 2x from"].filter(type => !noDamageTypes.includes(type));
      weaknessesMap["Takes 0.5x from"] = weaknessesMap["Takes 0.5x from"].filter(type => !noDamageTypes.includes(type));
      weaknessesMap["Takes 1x from"] = weaknessesMap["Takes 1x from"].filter(type => !noDamageTypes.includes(type));

      // Comprobar si hay Takes 4x from
      if (types.length === 2) {
        const [type1, type2] = types;
        const doubleDamageTypes = weaknessesMap["Takes 2x from"];
        doubleDamageTypes.forEach(weakType => {
          // Comprobar si ambos tipos son débiles a weakType
          if (
            weaknessesData.some(weaknessData => 
              weaknessData.name === type1 && 
              weaknessData.damage_relations.double_damage_from && 
              weaknessData.damage_relations.double_damage_from.some(dt => dt.name === weakType)
            ) &&
            weaknessesData.some(weaknessData => 
              weaknessData.name === type2 && 
              weaknessData.damage_relations.double_damage_from && 
              weaknessData.damage_relations.double_damage_from.some(dt => dt.name === weakType)
            )
          ) {
            weaknessesMap["Takes 4x from"].push(weakType);
          }
        });
      }

      // Comprobar si hay Takes 0.25x from
      if (types.length === 2) {
        const [type1, type2] = types;
        const doubleDamageTypes = weaknessesMap["Takes 0.5x from"];
        doubleDamageTypes.forEach(weakType => {
          // Comprobar si ambos tipos son débiles a weakType
          if (
            weaknessesData.some(weaknessData => 
              weaknessData.name === type1 && 
              weaknessData.damage_relations.half_damage_from && 
              weaknessData.damage_relations.half_damage_from.some(dt => dt.name === weakType)
            ) &&
            weaknessesData.some(weaknessData => 
              weaknessData.name === type2 && 
              weaknessData.damage_relations.half_damage_from && 
              weaknessData.damage_relations.half_damage_from.some(dt => dt.name === weakType)
            )
          ) {
            weaknessesMap["Takes 0.25x from"].push(weakType);
          }
        });
      }

      // Filtrar "Takes 2x from" para incluir solo tipos que hacen 2x a un tipo y normal a otro
      if (types.length === 2) {
        const [type1, type2] = types;
        const filteredDoubleDamage = [];

        // Check each type against the weaknesses
        weaknessesMap["Takes 2x from"].forEach(weakType => {
          const isWeakToType1 = weaknessesData.some(weaknessData =>
            weaknessData.name === type1 &&
            weaknessData.damage_relations && // Check for existence
            weaknessData.damage_relations.double_damage_from && // Check for existence
            weaknessData.damage_relations.double_damage_from.some(dt => dt.name === weakType)
          );

          const isNormalToType2 = weaknessesData.some(weaknessData =>
            weaknessData.name === type2 &&
            weaknessData.damage_relations && // Check for existence
            !weaknessData.damage_relations.double_damage_from?.some(dt => dt.name === weakType) &&
            !weaknessData.damage_relations.half_damage_from?.some(ht => ht.name === weakType) &&
            !weaknessData.damage_relations.no_damage_from?.some(nt => nt.name === weakType)
          );

          if (isWeakToType1 && isNormalToType2) {
            filteredDoubleDamage.push(weakType);
          }
          else{
            const isNormalToType1 = weaknessesData.some(weaknessData =>
              weaknessData.name === type1 &&
              weaknessData.damage_relations && // Check for existence
              !weaknessData.damage_relations.double_damage_from?.some(dt => dt.name === weakType) &&
            !weaknessData.damage_relations.half_damage_from?.some(ht => ht.name === weakType) &&
            !weaknessData.damage_relations.no_damage_from?.some(nt => nt.name === weakType)
            );
  
            const isWeakToType2 = weaknessesData.some(weaknessData =>
              weaknessData.name === type2 &&
              weaknessData.damage_relations && // Check for existence
              weaknessData.damage_relations.double_damage_from && // Check for existence
              weaknessData.damage_relations.double_damage_from.some(nt => nt.name === weakType)
            );
            if (isNormalToType1 && isWeakToType2) {
              filteredDoubleDamage.push(weakType);
            }
          }
        });
        weaknessesMap["Takes 2x from"] = filteredDoubleDamage;
      }

      // Filtrar "Takes 0.5x from" para incluir solo tipos que hacen 1x a un tipo y 0.5x a otro
      if (types.length === 2) {
        const [type1, type2] = types;
        const filteredHalfDamage = [];

        // Check each type against the weaknesses
        weaknessesMap["Takes 0.5x from"].forEach(weakType => {
          const isHalfToType1 = weaknessesData.some(weaknessData =>
            weaknessData.name === type1 &&
            weaknessData.damage_relations && // Check for existence
            weaknessData.damage_relations.half_damage_from && // Check for existence
            weaknessData.damage_relations.half_damage_from.some(dt => dt.name === weakType)
          );

          const isNormalToType2 = weaknessesData.some(weaknessData =>
            weaknessData.name === type2 &&
            weaknessData.damage_relations && // Check for existence
            !weaknessData.damage_relations.double_damage_from?.some(dt => dt.name === weakType) &&
            !weaknessData.damage_relations.half_damage_from?.some(ht => ht.name === weakType) &&
            !weaknessData.damage_relations.no_damage_from?.some(nt => nt.name === weakType)
          );

          if (isHalfToType1 && isNormalToType2) {
            filteredHalfDamage.push(weakType);
          }
          else{
            const isNormalToType1 = weaknessesData.some(weaknessData =>
              weaknessData.name === type1 &&
              weaknessData.damage_relations && // Check for existence
              !weaknessData.damage_relations.double_damage_from?.some(dt => dt.name === weakType) &&
              !weaknessData.damage_relations.half_damage_from?.some(ht => ht.name === weakType) &&
              !weaknessData.damage_relations.no_damage_from?.some(nt => nt.name === weakType)
            );
  
            const isHalfToType2 = weaknessesData.some(weaknessData =>
              weaknessData.name === type2 &&
              weaknessData.damage_relations && // Check for existence
              weaknessData.damage_relations.half_damage_from && // Check for existence
              weaknessData.damage_relations.half_damage_from.some(nt => nt.name === weakType)
            );
            if (isNormalToType1 && isHalfToType2) {
              filteredHalfDamage.push(weakType);
            }
          }
        });
        weaknessesMap["Takes 0.5x from"] = filteredHalfDamage;
      }
      
      // Listado de todos los tipos de Pokémon
      const allTypes = [
        'normal', 'fire', 'water', 'electric', 'grass', 'ice', 'fighting', 'poison', 'ground', 
        'flying', 'psychic', 'bug', 'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy'
      ];

      // Obtener todos los tipos que no están en ninguna categoría
      const usedTypes = [
        ...weaknessesMap["Takes 4x from"],
        ...weaknessesMap["Takes 2x from"],
        ...weaknessesMap["Takes 0.5x from"],
        ...weaknessesMap["Takes 0.25x from"],
        ...weaknessesMap["Takes 0x from"],
      ];

      const remainingTypes = allTypes.filter(type => !usedTypes.includes(type));

      // Asignar los tipos restantes a "Takes 1x from"
      weaknessesMap["Takes 1x from"] = remainingTypes;

      setTypeWeaknesses(weaknessesMap);
      setOriginalWeaknesses(weaknessesMap); // Guardar el estado original de las debilidades
    } catch (error) {
      setError(error.message);
    }
  };

  const handleAbilityChange = (e) => {
    const ability = e.target.value;
    setSelectedAbility(ability);
  
    // Restaurar las debilidades originales antes de aplicar la nueva inmunidad
    setTypeWeaknesses(originalWeaknesses);
  
    if (ability === "") {
      // Si no se selecciona ninguna habilidad, restaurar las debilidades originales
      return;
    }
  
    // Actualizar las debilidades si la habilidad otorga inmunidad
    if (ability && abilityImmunities[ability]) {
      const immunityTypes = abilityImmunities[ability];
  
      setTypeWeaknesses((prevWeaknesses) => {
        // Crear una copia de las debilidades originales para modificarla
        const updatedWeaknesses = { ...originalWeaknesses };
  
        // Limpiar "Takes 0x from" y restaurar sus tipos originales antes de añadir las nuevas inmunidades
        updatedWeaknesses["Takes 0x from"] = originalWeaknesses["Takes 0x from"].filter(type => !immunityTypes.includes(type));
  
        // Mover los tipos inmunes a la categoría "Takes 0x from"
        immunityTypes.forEach((immuneType) => {
          // Eliminar el tipo inmune de otras categorías
          Object.keys(updatedWeaknesses).forEach(category => {
            if (category !== "Takes 0x from") {
              updatedWeaknesses[category] = updatedWeaknesses[category].filter(type => type !== immuneType);
            }
          });
  
          // Añadir el tipo a "Takes 0x from"
          if (!updatedWeaknesses["Takes 0x from"].includes(immuneType)) {
            updatedWeaknesses["Takes 0x from"].push(immuneType);
          }
        });
  
        return updatedWeaknesses;
      });
    }
  };

  const handleMoveChange = async (e) => {
    const moveName = e.target.value;
    setSelectedMove(moveName);
    setMoveEffectiveness(null);

    if (!moveName) return;

    try {
      // Obtener los detalles del movimiento
      const response = await fetch(`https://pokeapi.co/api/v2/move/${moveName}`);
      if (!response.ok) {
        throw new Error("Move data not found");
      }
      const moveData = await response.json();

      // Obtener el tipo del movimiento
      const moveType = moveData.type.name;

      // Obtener la efectividad del tipo del movimiento
      const typeResponse = await fetch(`https://pokeapi.co/api/v2/type/${moveType}`);
      const typeData = await typeResponse.json();

      // Listar todos los tipos posibles
      const allTypesResponse = await fetch('https://pokeapi.co/api/v2/type/');
      const allTypesData = await allTypesResponse.json();
      const allTypes = allTypesData.results
          .map(t => t.name)
          .filter(type => type !== 'stellar' && type !== 'unknown'); // Excluir Stellar y Unknown

      // Crear el objeto de efectividad basado en las relaciones de daño
      const superEffectiveTypes = typeData.damage_relations.double_damage_to.map(t => t.name);
      const notVeryEffectiveTypes = typeData.damage_relations.half_damage_to.map(t => t.name);
      const noEffectTypes = typeData.damage_relations.no_damage_to.map(t => t.name);

      // Tipos con daño normal (1x): aquellos que no están en las otras tres categorías
      const normalEffectiveTypes = allTypes.filter(type =>
          !superEffectiveTypes.includes(type) &&
          !notVeryEffectiveTypes.includes(type) &&
          !noEffectTypes.includes(type)
      );

      // Crear el mapa de efectividad final
      const effectivenessMap = {
          "Deals 2x to": superEffectiveTypes,
          "Deals 1x to": normalEffectiveTypes,
          "Deals 0.5x to": notVeryEffectiveTypes,
          "Deals 0x to": noEffectTypes,
      };
      
      setMoveEffectiveness(effectivenessMap);
    } catch (error) {
      setError("Error fetching move effectiveness");
    }
  };

  return (
    <div className="create-pokemon-container">
      <div className="upper-part">
        <h1 className="create-pokemon-header">Search for a Pokémon</h1>
    
        {/* Formulario de búsqueda */}
        <form onSubmit={handleSearchSubmit}>
          <label className="create-pokemon-label">Enter Pokémon Name:</label>
          <input
            className="create-pokemon-input"
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder=" e.g., Pikachu"
            required
          />
          <button className="create-pokemon-button" type="submit" disabled={!searchTerm}>
            Search Pokémon
          </button>
        </form>
      </div>
      {/* Mostrar errores si los hay */}
      {error && <p>{error}</p>}
    
      {/* Mostrar los datos del Pokémon si están disponibles */}
      {pokemonData && (
        <div className="pokemon-details-container">
          <div className="caja1">
              <img
              className="pokemon-image"
              src={pokemonData.sprites.other["official-artwork"].front_default}
              alt={pokemonData.name}
            />
              <h2 className="pokemon-name">{pokemonData.name.charAt(0).toUpperCase() + pokemonData.name.slice(1)}</h2>
              <p>
                <strong className="type">Type(s): </strong> 
                {pokemonData.types.map((type) => (
                  <span
                    key={type.type.name}
                    className="pokemon-type"
                    style={{ backgroundColor: typeColors[type.type.name] }}
                  >
                    {type.type.name.charAt(0).toUpperCase() + type.type.name.slice(1)}
                  </span>
                )).reduce((prev, curr) => [prev, '', curr])}
              </p>

              {/* Desplegable para seleccionar una habilidad */}
              <select
              className="create-pokemon-select"
              value={selectedAbility}
              onChange={handleAbilityChange}
            >
              <option value="">-- Select an Ability --</option>
              {pokemonData.abilities.map((ability) => (
                <option key={ability.ability.name} value={ability.ability.name}>
                  {ability.ability.name.charAt(0).toUpperCase() + ability.ability.name.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <div className="caja2">
            {/* Mostrar debilidades de tipos */}
            {Object.keys(typeWeaknesses).length > 0 && (
              <div className="pokemon-weakness">
                {Object.entries(typeWeaknesses).map(([weaknessCategory, types]) => (
                  types.length > 0 && (
                    <div key={weaknessCategory}>
                      <h4>{weaknessCategory}</h4>
                      <ul>
                        {types.map(type => (
                          <li key={type}>
                            <span
                              className="pokemon-type"
                              style={{ backgroundColor: typeColors[type] }}
                            >
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )
                ))}
              </div>
            )}
          </div>
          <div className="caja3">
              {/* Desplegable para seleccionar un movimiento */}
              <select
              className="create-pokemon-select-2"
              value={selectedMove}
              onChange={handleMoveChange}
            >
              <option value="">-- Select a Move --</option>
              {pokemonData.moves.map((move) => (
                <option key={move.move.name} value={move.move.name}>
                  {move.move.name.charAt(0).toUpperCase() + move.move.name.slice(1)}
                </option>
              ))}
            </select>
             {/* Mostrar la efectividad del movimiento seleccionado */}
             {moveEffectiveness && (
              <div className="pokemon-weakness">
                {Object.entries(moveEffectiveness).map(([effectivenessCategory, types]) => (
                  types.length > 0 && (
                    <div key={effectivenessCategory}>
                      <h4>{effectivenessCategory}</h4>
                      <ul>
                        {types.map(type => (
                          <li key={type}>
                            <span
                              className="pokemon-type"
                              style={{ backgroundColor: typeColors[type] }}
                            >
                              {type.charAt(0).toUpperCase() + type.slice(1)}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )
                ))}
              </div>
             )}
          </div>
        </div>
      )}
    </div>
  ); 
}

export default CreatePokemon;
