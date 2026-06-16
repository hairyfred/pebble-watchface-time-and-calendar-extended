import dateFns from 'date-fns';
import getGeoPosition from '../../lib/geoposition-cached';
import { getTZOffestInSeconds, getLocalTimeStampFromUtc } from '../../lib/time';

const getLocalTimeStamp = () => Math.round(new Date().getTime() / 1000) - getTZOffestInSeconds();

const getLocation = async (options) => {
  const errors = {};
  if (options.locationType === 'cid') {
    if (options.cityId === 'not_set' || options.cityId === 'invalid_id') {
      errors.message = 'City ID Error';
      return { errors };
    }
    const location = `?id=${options.cityId}`;
    return { errors, location };
  }

  try {
    const pos = await getGeoPosition();
    const location = `?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`;
    return { errors, location };
  } catch (e) {
    errors.message = 'GPS Location Error';
    return { errors };
  }
};

const getTemperatureUnits = (unitsKey) => {
  switch (unitsKey) {
    case 'imperial':
      return '&units=imperial';

    case 'metric':
      return '&units=metric';

    case 'default':
      return '';

    default:
      return '';
  }
};

export const makeUrl = async (options) => {
  const addr = 'http://api.openweathermap.org/data/2.5/';
  const requestType = options.type;
  const { errors, location } = await getLocation(options);
  // console.log(`location errer: ${errors.message}`);
  const temperatureUnits = getTemperatureUnits(options.units);
  const key = `&appid=${options.apiKey}`;

  const urlParts = [addr, requestType, location, temperatureUnits, key];
  return { errors, url: urlParts.join('') };
};

const makeWeather = weather => ({
  temperature: Math.round(weather.main.temp),
  condition: weather.weather[0].id,
  // desc: weather.weather[0].description,
  timeStamp: getLocalTimeStamp(),
  pressure: Math.round(weather.main.pressure * 0.75) - 14,
  windSpeed: weather.wind.speed,
  windDirection: weather.wind.deg,
  humidity: weather.main.humidity,
  sunrise: getLocalTimeStampFromUtc(weather.sys.sunrise * 1000),
  sunset: getLocalTimeStampFromUtc(weather.sys.sunset * 1000),
});


const getForecastItems = (forecastType) => {
  switch (forecastType) {
    case 'ft_off':
      return [];
    case 'ft_3h':
      return [0, 1, 2, 3, 4];
    case 'ft_6h':
      return [0, 2, 4, 6, 8];
    default:
      return [0, 1, 2, 3, 4];
  }
};

// Aggregate the 5-day / 3-hour list into upcoming whole-day summaries. dateFns
// formats UTC ms in the runtime's local timezone, so day boundaries and labels
// are local. Bucket 0 is "today" (partial) and is skipped so each day is whole.
const makeDailyForecast = (weather) => {
  const buckets = {};
  weather.list.forEach((item) => {
    const ms = item.dt * 1000;
    const key = dateFns.format(ms, 'YYYY-MM-DD');
    if (!buckets[key]) {
      buckets[key] = [];
    }
    buckets[key].push(item);
  });

  return Object.keys(buckets).sort().slice(1, 6).map((key) => {
    const items = buckets[key];
    const high = Math.round(Math.max.apply(null, items.map(it => it.main.temp)));
    // representative condition: the entry closest to local 13:00
    let rep = items[0];
    let bestDist = 99;
    items.forEach((it) => {
      const dist = Math.abs(new Date(it.dt * 1000).getHours() - 13);
      if (dist < bestDist) {
        bestDist = dist;
        rep = it;
      }
    });
    return {
      dayLabel: dateFns.format(rep.dt * 1000, 'ddd'),
      temperature: high,
      condition: rep.weather[0].id,
      midTimeStamp: rep.dt * 1000,
    };
  });
};

const makeForecast = (weather, forecastType) => {
  const forecastItems = new Set(getForecastItems(forecastType));
  const hourly = weather.list
    .filter((_, index) => forecastItems.has(index))
    .map(item => ({
      timeStamp: item.dt,
      temperature: Math.round(item.main.temp),
      condition: item.weather[0].id,
    }));
  return { hourly, daily: makeDailyForecast(weather) };
};

export const makeWeatherObj = (options, weatherResponse) => {
  if (options.type === 'forecast') {
    return makeForecast(weatherResponse, options.forecastType);
  }
  return makeWeather(weatherResponse);
};
