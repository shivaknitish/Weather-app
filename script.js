const apiKey = "cf59e562fd541df2e389301e6b04dd86"; // It's best to hide this key in a real application

const searchBtn = document.getElementById("searchBtn");
const cityInput = document.getElementById("cityInput");
const currentWeather = document.getElementById("currentWeather");
const forecast = document.getElementById("forecast");

searchBtn.addEventListener("click", () => {
  handleSearch();
});

cityInput.addEventListener("keypress", (event) => {
  if (event.key === "Enter") {
    handleSearch();
  }
});

function handleSearch() {
  // Clean the input by trimming whitespace and removing common trailing punctuation
  const city = cityInput.value.trim().replace(/[.,;:]+$/, "");

  if (!city) {
    alert("Please enter a city name");
    return;
  }
  getWeather(city);
}

async function getWeather(city) {
  try {
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`;
    const currentRes = await fetch(weatherUrl);
    if (!currentRes.ok) {
      if (currentRes.status === 404) {
        throw new Error("City not found");
      } else if (currentRes.status === 401) {
        throw new Error("Invalid API Key. Please check your key in script.js.");
      } else {
        throw new Error("An error occurred. Please try again later.");
      }
    }
    const currentData = await currentRes.json();

    displayCurrentWeather(currentData);

    // Get 5-day forecast (3-hour intervals)
    const forecastRes = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${apiKey}`
    );
    const forecastData = await forecastRes.json();
    displayForecast(forecastData);
  } catch (error) {
    currentWeather.innerHTML = `<p style="color: #ffcc00;">${error.message}. Please try again.</p>`;
    forecast.innerHTML = "";
  }
}

function displayCurrentWeather(data) {
  const { main, weather, name, sys } = data;
  // Get current day and time
  const now = new Date();
  const dayName = now.toLocaleDateString('en-US', { weekday: 'long' });
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  currentWeather.innerHTML = `
    <div class="datetime" style="font-size:15px; color:#bdb7e2; margin-bottom:8px;">
      ${dayName}, ${timeStr}
    </div>
    <img src="https://openweathermap.org/img/wn/${weather[0].icon}@2x.png" alt="${weather[0].description}">
    <div class="temp">${Math.round(main.temp)}°C</div>
    <div class="details">
      ${weather[0].main} <br>
      H: ${Math.round(main.temp_max)}° L: ${Math.round(main.temp_min)}° <br>
      ${name}, ${sys.country}
    </div>
  `;
}

function displayForecast(data) {
  // Filter one forecast per day (around 12:00)
  const forecastList = data.list.filter(item => item.dt_txt.includes("12:00:00")).slice(1,5);

  forecast.innerHTML = forecastList.map(item => {
    const date = new Date(item.dt_txt);
    const day = date.toLocaleDateString('en-US', { weekday: 'short' });
    return `
      <div class="forecast-day">
        <div class="day">${day}</div>
        <img src="https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png" alt="${item.weather[0].description}">
        <div class="temp">${Math.round(item.main.temp)}°C</div>
      </div>
    `;
  }).join("");
}
