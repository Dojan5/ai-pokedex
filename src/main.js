import { LitElement, html } from 'lit';

class PokemonQueryComponent extends LitElement {
    static get properties() {
        return {
            pokemon: { type: Object },
            error: { type: String },
        };
    }

    render() {
        const { pokemon, error } = this;
        return html`
          <input 
          type="text" 
          id="pokemon-name-input" 
          @keydown=${(event) => {
                if (event.key === 'Enter') {
                    this._queryPokemon();
                }
            }}
          />
          <button @click=${this._queryPokemon}>Query Pokemon</button>
          ${pokemon ? this._renderPokemonCard() : ''}
          ${error ? this._renderErrorMessage() : ''}
        `;
    }

    _renderPokemonCard() {
        const { pokemon } = this;
        return html`
          <div class="pokemon-card">
            <h3>${pokemon.name}</h3>
            <div class="pokemon-type" style="background-color: ${this._getTypeColor(pokemon.type)}">
              ${pokemon.type}
            </div>
            <img src=${pokemon.imageUrl} alt=${pokemon.name} />
            <h4>Moves:</h4>
            ${this._renderMovesTable()}
          </div>
        `;
    }

    _renderErrorMessage() {
        const { error } = this;
        return html`
          <div class="error-message" style="color: red">
            ${error}
          </div>
        `;
    }

    _renderMovesTable() {
        const { pokemon } = this;
        return html`
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Learned at (lv)</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              ${pokemon.moves.map(
            (move) => html`
                  <tr>
                    <td>${move.name}</td>
                    <td>
                      <div class="move-type" style="background-color: ${this._getTypeColor(move.type)}">
                        ${move.type}
                      </div>
                    </td>
                    <td>${move.level}</td>
                    <td>${move.details}</td>
                  </tr>
                `
        )}
            </tbody>
          </table>
        `;
    }


    async _queryPokemon() {
        const pokemonName = this._getPokemonName();
      
        // Check if the data is already stored in the browser's storage
        const storedPokemonData = JSON.parse(localStorage.getItem(`pokemon:${pokemonName}`));
        if (storedPokemonData) {
          this.pokemon = storedPokemonData;
          this.error = null;
          return;
        }
      
        try {
          // Make the API request if the data is not already stored
          const pokemonData = await this._fetchPokemonData(pokemonName);
      
          // Check if the move data is already stored in the browser's storage
          const storedMovesData = JSON.parse(localStorage.getItem(`moves`));
          const moves = storedMovesData ? storedMovesData : await this._fetchPokemonMoves(pokemonData);
      
          // Create the pokemon object
          const pokemon = this._createPokemonObject(pokemonData, moves);
      
          // Store the data in the browser's storage
          this._storePokemonData(pokemonName, pokemon);
          this._storePokemonMoves(moves);
      
          // Set the pokemon and error properties
          this.pokemon = pokemon;
          this.error = null;
        } catch (error) {
          this.error = error.message;
          this.pokemon = null;
        }
      }

    _getPokemonName() {
        const input = this.shadowRoot.getElementById('pokemon-name-input');
        return input.value;
    }

    async _fetchPokemonData(pokemonName) {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonName}`);
        return response.json();
    }

    async _fetchPokemonMoves(pokemonData) {
        const moves = [];
        for (const moveData of pokemonData.moves) {
            const moveResponse = await fetch(moveData.move.url);
            const move = await moveResponse.json();
            moves.push({
                name: move.name,
                type: move.type.name,
                level: moveData.version_group_details[0].level_learned_at,
                details: `${move.generation.name} - ${moveData.version_group_details[0].move_learn_method.name}`,
            });
        }
        return moves;
    }

    _createPokemonObject(pokemonData, moves) {
        return {
            name: pokemonData.name,
            type: pokemonData.types[0].type.name,
            imageUrl: pokemonData.sprites.front_default,
            moves,
        };
    }

    _storePokemonData(pokemonName, pokemon) {
        // Store the Pokémon data in the browser's storage
        localStorage.setItem(`pokemon:${pokemonName}`, JSON.stringify(pokemon));
      }      

    _storePokemonMoves(moves) {
        localStorage.setItem(`moves`, JSON.stringify(moves));
      }

    _getTypeColor(type) {
        switch (type) {
            case 'normal':
                return '#A8A77A';
            case 'fire':
                return '#EE8130';
            case 'fighting':
                return '#C22E28';
            case 'water':
                return '#6390F0';
            case 'flying':
                return '#A98FF3';
            case 'grass':
                return '#7AC74C';
            case 'poison':
                return '#A33EA1';
            case 'electric':
                return '#F7D02C';
            case 'ground':
                return '#E2BF65';
            case 'psychic':
                return '#F95587';
            case 'rock':
                return '#B6A136';
            case 'ice':
                return '#96D9D6';
            case 'bug':
                return '#A6B91A';
            case 'dragon':
                return '#6F35FC';
            case 'ghost':
                return '#735797';
            case 'dark':
                return '#705746';
            case 'steel':
                return '#B7B7CE';
            case 'fairy':
                return '#D685AD';
            default:
                return '#FFFFFF';
        }
    }
}

customElements.define('pokemon-query-component', PokemonQueryComponent);