document.getElementById('getCountryInfo').addEventListener('click', function() {
    const countryName = document.getElementById('countryInput').value.trim();
    if (!countryName) {
      alert('Please enter a valid country code.');
      return;
    }
  
    fetch(`/country/${countryName}`)
      .then(response => {
        if (!response.ok) throw new Error('Failed to fetch country data.');
        return response.json();
      })
      .then(country => {
        const container = document.getElementById('country-container');
        container.classList.remove('d-none');
        container.innerHTML = `
          <h2>${country.name}</h2>
          <p>Capital: ${country.capital}</p>
          <p>Region: ${country.region}</p>
          <p>Subregion: ${country.subregion}</p>
          <p>Population: ${country.population.toLocaleString()}</p>
          <p>Languages: ${country.languages.join(', ')}</p>
          <img src="${country.flag}" alt="Flag of ${country.name}" class="img-fluid">
        `;
      })
      .catch(error => {
        alert(error.message);
      });
  });
  