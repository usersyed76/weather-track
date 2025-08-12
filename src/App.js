import React, { useState, useEffect, useRef } from "react";
import "./App.css";
import "@fortawesome/fontawesome-free/css/all.min.css";

const CITY_OPTIONS = [
  "Hyderabad",
  "New York",
  "London",
  "Tokyo",
  "Sydney",
  "Paris"
];
const DEFAULT_CITY = "Hyderabad";
const API_KEY = "d9f6670a1b77967bfc31cb660d82bb3a"; // Use your real API key

export default function App() {
  const [city, setCity] = useState(DEFAULT_CITY); // dropdown/main city
  const [inputValue, setInputValue] = useState(""); // input value
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState("");
  const intervalRef = useRef(null);

  // Fetch weather
  const fetchWeather = async (cityName) => {
    setLoading(true);
    setError("");
    try {
      const resp = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
          cityName
        )}&units=metric&appid=${API_KEY}`
      );
      if (!resp.ok) throw new Error("City not found or network error.");
      const data = await resp.json();
      setWeather({
        name: data.name,
        temp: Math.round(data.main.temp),
        feels: Math.round(data.main.feels_like),
        desc: data.weather[0].description,
        main: data.weather.main,
        wind: Math.round(data.wind.speed * 3.6), // km/h
        humidity: data.main.humidity,
        visibility: Math.round(data.visibility / 1000), // km
        pressure: data.main.pressure,
        icon: data.weather.icon,
      });
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (err) {
      setWeather(null);
      setError("Failed to fetch weather. Please check city name or try again later.");
      setLastUpdated("");
    } finally {
      setLoading(false);
    }
  };

  // Fetch on mount and when city changes
  useEffect(() => {
    fetchWeather(city);
  }, [city]);

  // Auto-refresh effect
  useEffect(() => {
    if (!autoRefresh) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(() => fetchWeather(city), 10000);
    return () => clearInterval(intervalRef.current);
  }, [city, autoRefresh]);

  // Search bar: set main city if search pressed or Enter
  const handleSearch = () => {
    if (inputValue.trim() && inputValue.trim().length > 0) {
      setCity(inputValue.trim());
    }
  };

  // Dropdown change
  const handleDropdown = (e) => {
    setCity(e.target.value);
    setInputValue("");
  };

  // Helper for icon names (FontAwesome, based on OpenWeather icon)
  const getBgIcon = (main) => {
    switch ((main || "").toLowerCase()) {
      case "clear":
        return "fa-sun";
      case "clouds":
        return "fa-cloud";
      case "rain":
      case "drizzle":
        return "fa-cloud-showers-heavy";
      case "thunderstorm":
        return "fa-bolt";
      case "snow":
        return "fa-snowflake";
      case "mist":
      case "haze":
      case "fog":
        return "fa-smog";
      default:
        return "fa-sun";
    }
  };
  const getMainIcon = (code) => {
    if (!code) return "fa-sun";
    if (code.startsWith("01")) return "fa-sun";
    if (code.startsWith("02")) return "fa-cloud-sun";
    if (code.startsWith("03") || code.startsWith("04")) return "fa-cloud";
    if (code.startsWith("09") || code.startsWith("10"))
      return "fa-cloud-showers-heavy";
    if (code.startsWith("11")) return "fa-bolt";
    if (code.startsWith("13")) return "fa-snowflake";
    if (code.startsWith("50")) return "fa-smog";
    return "fa-sun";
  };

  // Allow pressing Enter in input
  const onInputKeyDown = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  return (
    <div className="backdrop">
      {/* Dropdown for city selection */}
      <div className="dropdown-bar">
        <select
          value={city}
          onChange={handleDropdown}
          className="city-dropdown"
          aria-label="City selector"
        >
          {CITY_OPTIONS.map((opt) => (
            <option value={opt} key={opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>
      <div className="weather-main-card">
        {/* Large faded icon */}
        <i className={`weather-bg-icon fas ${getBgIcon(weather?.main)}`}></i>
        {/* Search bar */}
        <div className="search-bar">
          <input
            className="search-input"
            placeholder="Enter city name"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={onInputKeyDown}
          />
          <button onClick={handleSearch} className="search-btn" title="Search">
            <i className="fas fa-search"></i>
          </button>
          <button
            onClick={() => setAutoRefresh((v) => !v)}
            className="refresh-btn"
            title={autoRefresh ? "Stop auto-refresh" : "Resume auto-refresh"}
          >
            <i className={`fas fa-sync-alt${autoRefresh ? "" : " fa-spin"}`}></i>
          </button>
        </div>
        {/* Main weather display */}
        {loading ? (
          <div className="loading-block">
            <i className="fas fa-circle-notch fa-spin"></i>
            <span style={{ marginLeft: 10 }}>Updating weather…</span>
          </div>
        ) : error ? (
          <div className="error-block">{error}</div>
        ) : weather ? (
          <>
            <div className="city-block">
              <div className="city-name">{weather.name}</div>
              <div className="current-date">
                {new Date().toLocaleDateString(undefined, {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </div>
            </div>

            <div className="info-group">
              <div className="weather-info">
                <i className={`main-icon fas ${getMainIcon(weather.icon)}`}></i>
                <div>
                  <div className="info-title">{capitalize(weather.desc)}</div>
                  <div className="info-label">Feels like {weather.feels}°C</div>
                </div>
              </div>
              <div className="weather-temp">{weather.temp}°C</div>
            </div>
            <div className="details-group">
              <div className="details-item">
                <i className="fas fa-wind"></i> Wind: {weather.wind} km/h
              </div>
              <div className="details-item">
                <i className="fas fa-tint"></i> Humidity: {weather.humidity}%
              </div>
              <div className="details-item">
                <i className="fas fa-eye"></i> Visibility: {weather.visibility} km
              </div>
              <div className="details-item">
                <i className="fas fa-cloud"></i> Pressure: {weather.pressure} hPa
              </div>
            </div>
          </>
        ) : null}
        <div className="timestamp">Last updated: {lastUpdated || "—"}</div>
      </div>
    </div>
  );
}

// Helper: Capitalize string
function capitalize(str) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}
