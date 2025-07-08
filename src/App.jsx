import { useState } from 'react'
import { useEffect } from 'react'
import './App.css'

const API_URL = 'https://api.thecatapi.com/v1/images/search?size=med&mime_types=jpg&format=json&has_breeds=true&order=RANDOM&page=0&limit=1';
const ACCESS_KEY = import.meta.env.VITE_APP_ACCESS_KEY;

function App() {
  const [catData, setCatData] = useState(null);
  const [banList, setBanList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);

  const isBanned = (cat) => {
    return (
      banList.includes(cat.breeds[0].name) ||
      banList.includes(cat.breeds[0].origin) ||
      banList.some(term => cat.breeds[0].temperament.includes(term))
    );
  };

  const fetchCat = async () => {
    setLoading(true);
    let result;
    let attempts = 0;
    do {
      const response = await fetch(API_URL, {
        headers: {
          'x-api-key': ACCESS_KEY,
        },
      });
      const data = await response.json();
      result = data[0];
      console.log('Fetched cat:', result);
      attempts++;
    } while (
      result &&
      result.breeds.length > 0 &&
      isBanned(result) &&
      attempts < 10
    );

    if (result && result.breeds.length > 0 && !isBanned(result)) {
      const newCat = {
        image: result.url,
        breed: result.breeds[0].name,
        origin: result.breeds[0].origin,
        temperament: result.breeds[0].temperament,
      };
      setCatData(newCat);
      setHistory((prev) => [newCat, ...prev]);
    } else {
      setCatData(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCat();
  }, [banList]);

  const toggleBan = (value) => {
    setBanList((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };


  return (
    <div className="body">
      <h1 className="title">Cats Veni Vici! 🐱</h1>
      <p className="subtitle">Discover random cats, ban breeds or traits, and explore your feline history!</p>
      <button
        onClick={fetchCat}
        className="fetch-btn"
      >
        Discover New Cat
      </button>

      {loading && <p className="loading">Loading cat...</p>}

      {catData && !loading && (
        <div className="cat-card">
          <img src={catData.image} alt={catData.breed} className="cat-image" />
          <div className="cat-data">
            <p>
              <strong>Breed: </strong>
              <span
                className="cat-breed"
                onClick={() => toggleBan(catData.breed)}
              >
                {catData.breed}
              </span>
            </p>
            <p>
              <strong>Origin:</strong>{' '}
              <span
                className="cat-breed"
                onClick={() => toggleBan(catData.origin)}
              >
                {catData.origin}
              </span>
            </p>
            <p>
              <strong>Temperament:</strong>{' '}
              {catData.temperament.split(',').map((trait) => (
                <span
                  key={trait.trim()}
                  className="cat-breed"
                  onClick={() => toggleBan(trait.trim())}
                >
                  {trait.trim()} 
                </span>
              ))}
            </p>
          </div>
        </div>
      )}

      {!catData && !loading && (
        <p className="no-cat">No valid cat found (possibly all matching attributes are banned).</p>
      )}

      <div className="ban-list-container">
        <h2 className="ban-list-text">Ban List</h2>
        <ul className="ban-list">
          {banList.map((item) => (
            <li
              key={item}
              className="ban-list-item"
              onClick={() => toggleBan(item)}
            >
              {item} ❌
            </li>
          ))}
        </ul>
      </div>

      <div className="history-list-container">
        <h2 className="ban-list-text">View History</h2>
        <div>
          {history.map((item, index) => (
            <div key={index} className='history-item'>
              <img src={item.image} alt={item.breed} className="cat-image-h" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App
