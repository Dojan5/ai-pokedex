import { LitElement, html } from 'lit';

class PokemonQueryComponent extends LitElement {
    static get properties() {
        return {
            pokemon: { type: Object },
            error: { type: String },
        };
    }

    constructor() {
        super();
        this.pokemon = null;
        this.error = null;
    }

    render() {
        const { pokemon, error } = this;
        return html`
      <input type="text" id="pokemon-name-input" @keyup=${this._onKeyUp} />
      <button @click=${this._queryPokemon}>Query Pokemon</button>
      ${pokemon
                ? html`
            <div class="pokemon-card">
              <h3>${pokemon.name}</h3>
              <div
                class="pokemon-type"
                style="background-color: ${this._getTypeColor(
                    pokemon.type
                )}"
              >
                ${pokemon.type}
              </div>
              <img src=${pokemon.imageUrl} alt=${pokemon.name} />
              <h4>Moves:</h4>
              ${this._renderMovesTable()}
            </div>
          `
                : ''}
      ${error
                ? html`
            <div class="error-message" style="color: red">
              ${error}
            </div>
          `
                : ''}
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
          ${pokemon.moves
                .filter((move) => move.learnedByPokemon === pokemon.name)
                .map(
                    (move) => html`
                <tr>
                  <td>${move.name}</td>
                  <td>
                    <div
                      class="move-type"
                      style="background-color: ${this._getTypeColor(
                        move.type
                    )}"
                    >
                      ${move.type}
                    </div>
                  </td>
                  <td>${move.level_learned_at}</td>
                  <td>${move.version_group_details[0].move_learn_method.name} (${move.version_group_details[0].version_group.name})</td>
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
        let allMoves = [];
        if (storedPokemonData) {
            allMoves = storedPokemonData.moves;
            this.pokemon = storedPokemonData;
            this.error = null;
            return;
        }

        try {
            // Make the API request if the data is not already stored
            const pokemonData = await this._fetchPokemonData(pokemonName);

            // Convert the allMoves array to a Map object
            const movesMap = new Map(
                allMoves.map((move) => [move.name, { ...move, learnedByPokemon: pokemonData.name }])
            );

            // Create the pokemon object
            const pokemon = this._createPokemonObject(pokemonData, movesMap);

            // Store the pokemon data in the browser's storage
            this._storePokemonData(pokemon);

            this.pokemon = pokemon;
            this.error = null;
        } catch (error) {
            this.error = error.message;
            this.pokemon = null;
        }
    }

    _getPokemonName() {
        return this.shadowRoot.getElementById('pokemon-name-input').value;
    }

    _fetchPokemonData(pokemonName) {
        return fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonName}`)
            .then((response) => response.json());
    }

    _createPokemonObject(pokemonData, moves) {
        return {
            name: pokemonData.name,
            type: pokemonData.types[0].type.name,
            imageUrl: pokemonData.sprites.front_default,
            moves: pokemonData.moves
                .map((moveData) => moves.get(moveData.move.name))
                .filter((move) => move !== undefined),
        };
    }

    _storePokemonData(pokemon) {
        localStorage.setItem(`pokemon:${pokemon.name}`, JSON.stringify(pokemon));
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
                return '#000000';
        }
    }

    _onKeyUp(event) {
        if (event.key === 'Enter') {
            this._queryPokemon();
        }
    }
}

customElements.define('pokemon-query-component', PokemonQueryComponent);