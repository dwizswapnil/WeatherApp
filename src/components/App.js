import { useState, useEffect } from "react";
import { createMuiTheme, Container, ThemeProvider } from "@material-ui/core";
import CircularProgress from "@material-ui/core/CircularProgress";
import CssBaseline from "@material-ui/core/CssBaseline";

import AppLayout from "./AppLayout";

//NOTE: set the google api key in .env file, and restart the yarn start, then remove this comment

const mapDataToWeatherInterface = (data) => {
    const mapped = {
        city: data.name,
        country: data.sys.country,
        date: data.dt * 1000,
        humidity: data.main.humidity,
        icon_id: data.weather[0].id,
        temperature: data.main.temp,
        description: data.weather[0].description,
        wind_speed: Math.round(data.wind.speed * 3.6),
    };

    if (data.dt_txt) {
        mapped.dt_txt = data.dt_txt;
    }

    if (data.weather[0].icon) {
        mapped.icon = data.weather[0].icon;
    }

    if (data.main.temp_min && data.main.temp_max) {
        mapped.max = data.main.temp_max;
        mapped.min = data.main.temp_min;
    }

    Object.keys(mapped).forEach(
        (key) => mapped[key] === undefined && delete data[key]
    );

    return mapped;
};

const handleResponse = (response) => {
    if (response.ok) {
        return response.json();
    } else {
        throw new Error(
            "Error: Location " + response.statusText.toLowerCase()
        );
    }
};

const getWeather = (city) =>
    fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${process.env.REACT_APP_APIKEY}`
    )
        .then(res => handleResponse(res))
        .then(weather => {
            if (Object.entries(weather).length) {
                const mappedData = mapDataToWeatherInterface(weather);
                return mappedData;
            }
        });

const getForecast = (city) =>
    fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&APPID=${process.env.REACT_APP_APIKEY}`
    )
        .then(res => handleResponse(res))
        .then(result => {
            if (Object.entries(result).length) {
                const forecast = [];
                for (let i = 0; i < result.list.length; i += 8) {
                    forecast.push(
                        mapDataToWeatherInterface(result.list[i + 4])
                    );
                }
                return forecast;
            }
        });

const theme = createMuiTheme({
    typography: {
        fontFamily: [
            "Inter",
            "-apple-system",
            "BlinkMacSystemFont",
            '"Helvetica Neue"',
            "Arial",
            "sans-serif",
            '"Apple Color Emoji"',
            '"Segoe UI Emoji"',
            '"Segoe UI Symbol"',
        ].join(","),
        fontSize: 14,
        h5: {
            fontWeight: 600,
        },
    },
});

const App = () => {
    const [city, setCity] = useState("Ranchi");
    const [error, setError] = useState(null);
    const [currentWeather, setCurrentWeather] = useState(null);
    const [forecast, setForecast] = useState([]);

    useEffect(() => {
        getWeather(city)
            .then((weather) => {
                setCurrentWeather(weather);
                setError(null);
            })
            .catch(err => setError(err.message));

        getForecast(city)
            .then(data => {
                setForecast(data);
                setError(null);
            })
            .catch(err => setError(err.message));
    }, [city]);

    if (
        (currentWeather && Object.keys(currentWeather).length) ||
        (forecast && Object.keys(forecast).length)
    ) {
        return (
            <ThemeProvider theme={theme}>
                <CssBaseline />
                <Container maxWidth="sm">
                    <AppLayout
                        city={city}
                        currentWeather={currentWeather}
                        forecast={forecast}
                        onCityChange={setCity}
                        error={error}
                    />
                </Container>
            </ThemeProvider>
        );
    } else {
        return (
            <ThemeProvider theme={theme}>
                <CssBaseline />
                <Container maxWidth="sm" style={{ height: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                    <CircularProgress color={error ? "secondary" : "primary"} />
                    {error ? <p>{error}</p> : ""}
                </Container>
            </ThemeProvider>
        );
    }
};

export default App;
