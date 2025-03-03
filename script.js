let url = "https://pokeapi.co/api/v2/pokemon?limit=100000&offset=0.";
let pokemonArray = [];
let currentPokemons = [];
let limit = 0;
let endPoint = 0;

async function getContent() {
  showLoadingSpinner();
  let response = await fetch(url);
  let responseAsJson = await response.json();
  let results = responseAsJson["results"];
  endPoint += 20;
  await processPokemonData(results);
  hideLoadingSpinner();
}

async function processPokemonData(results) {
  for (let i = limit; i < endPoint; i++) {
    const result = results[i];
    let pokemonData = await fetchPokemonData(result.url);
    let speciesData = await fetchSpeciesData(pokemonData.species.url);
    let pokemon = createPokemonObject(pokemonData, speciesData, result.name);
    pokemonArray.push(pokemon);
  }
  init();
}

async function fetchPokemonData(url) {
  let response = await fetch(url);
  let data = await response.json();
  return data;
}

async function fetchSpeciesData(url) {
  let response = await fetch(url);
  let data = await response.json();
  return data;
}

function createPokemonObject(pokemonData, speciesData, name) {
  let pokemonSprite = pokemonData.sprites.front_default;
  let pokedexNumber = speciesData.id;
  let pokemonName = capitalizeFirstLetter(name);
  let pokemonType = pokemonData.types.map((typeInfo) =>
    typsNames(typeInfo.type.name)
  );
  let typesHtml = generateTypesHtml(pokemonType);
  let stats = extractStats(pokemonData.stats);

  return {
    sprite: pokemonSprite,
    pokedexNumber: pokedexNumber,
    name: pokemonName,
    type: pokemonType,
    typesHtml: typesHtml,
    stats: stats,
  };
}

function generateTypesHtml(types) {
  return types
    .map(
      (type) => `<div class="pokemonCardUnderTyp typFont ${type}">${type}</div>`
    )
    .join("");
}

function extractStats(stats) {
  return stats.reduce((acc, stat) => {
    let key = mapStatToKeyValue(stat.stat.name);
    if (key) {
      acc[key] = stat.base_stat;
    }
    return acc;
  }, {});
}

function mapStatToKeyValue(statName) {
  switch (statName) {
    case "hp":
      return "hp";
    case "attack":
      return "attack";
    case "defense":
      return "defense";
    case "special-attack":
      return "specialAttack";
    case "special-defense":
      return "specialDefense";
    case "speed":
      return "speed";
    default:
      return null;
  }
}

function typsNames(string) {
  return string;
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function renderPokemonCart() {
  let content = document.getElementById("pokemonCard");
  content.innerHTML = currentPokemons
    .map((pokemon, i) => pokemonCardTemplate(pokemon, i))
    .join("");
}

function otherCard(index) {
  if (index < 0 || index >= pokemonArray.length) return;
  openOverlay(index);
}

function closeOverlay(){
  let overlayRef = document.getElementById("overlay");
  let bodyRef = document.getElementById("myBody");
  overlayRef.classList.add("d-none");
  bodyRef.classList.remove("no-scroll");
}

function openOverlay(index){
  let overlayRef = document.getElementById("overlay");
  let bodyRef = document.getElementById("myBody");
  overlayRef.classList.remove("d-none");
  bodyRef.classList.add("no-scroll");
  const pokemon = pokemonArray[index];
  const {pokedexNumber, name, sprite, type, stats } = pokemon;
  let typesArray = type.join(',').split(',');
  let typesHtmlContent = generateTypesHtml(typesArray);
  let primaryType = type[0];
  overlayRef.innerHTML = overlayPokemonContent(index, pokedexNumber, name, sprite, typesHtmlContent, primaryType, stats);

  if (index === 0) {
    let previousContent = document.getElementById("previous");
    previousContent.classList.add('previousBackgrund')
  }
 if (index >= pokemonArray.length -1) {
  let nextContent = document.getElementById("next");
  nextContent.classList.add('previousBackgrund')
 }
}

function bubblingProtection(event) {
  event.stopPropagation();
}

function init() {
  currentPokemons = pokemonArray;
  renderPokemonCart();
}

function filterAndShowPokemon(filterWord) {
  currentPokemons = pokemonArray.filter(pokemon => pokemon.name.toLowerCase().includes(filterWord.toLowerCase()));
  renderPokemonCart();
}

function pokemonNameFilter() {
  let filterWord = document.getElementById("pokemonNameFilter").value;
  if (filterWord.length >= 3) {
    filterAndShowPokemon(filterWord);
  } else {
    currentPokemons = pokemonArray;
    renderPokemonCart();
  }
}

function showLoadingSpinner() {
  document.getElementById("loadingSpinner").classList.remove("d-none");
}

function hideLoadingSpinner() {
  document.getElementById("loadingSpinner").classList.add("d-none");
  let bodyRef = document.getElementById("myBody");
  bodyRef.classList.remove("no-scroll");
  document.getElementById('morePokemon').disabled = false;
}

function loadMorePokemon() {
  limit += 20;
  let bodyRef = document.getElementById("myBody");
  bodyRef.classList.add("no-scroll");
  document.getElementById('morePokemon').disabled = true;
  getContent();
}
