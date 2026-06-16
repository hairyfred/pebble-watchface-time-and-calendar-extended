import dateFns from 'date-fns';
import messageKeys from 'message_keys'; //eslint-disable-line
import { conditions, getWindDirectionSymbol, messages } from './weatherAttributeTables';
import errorHandler, { resetErrors } from './errorHandler';
// import { getTZOffestInSeconds } from '../lib/time';

const sunStorageKey = 'SunTimes';

const isDayAt = (sunrise, sunset, time) => dateFns
  .isWithinRange(time, sunrise, sunset);

const getConditionSymbol = (conditionCode, sunrise, sunset, time = new Date()) => {
  const symbol = conditions[conditionCode].symbol || 'h';
  if (conditionCode >= 800 && conditionCode <= 803) {
    const [day, night] = symbol;
    return isDayAt(sunrise, sunset, time) ? day : night;
  }
  return symbol;
};

const formatTime = (time, formatString) => dateFns.format(time, formatString);

const saveSunTimes = (sunrise, sunset) => {
  const item = { sunrise, sunset };
  localStorage.setItem(sunStorageKey, JSON.stringify(item));
};

const getSunTimes = () => JSON.parse(localStorage.getItem(sunStorageKey));

const makeWeather = (weather) => {
  const { sunrise, sunset } = weather;
  saveSunTimes(sunrise, sunset);
  return {
    WeatherMarker: true,
    WeatherTemperature: weather.temperature,
    WeatherCondition: getConditionSymbol(weather.condition, sunrise, sunset),
    // timestamp from OWM is toooooo old
    WeatherTimeStamp: weather.timeStamp,
    WeatherPressure: weather.pressure,
    WeatherWindSpeed: weather.windSpeed,
    WeatherWindDirection: getWindDirectionSymbol(weather.windDirection),
    WeatherHumidity: weather.humidity,
    WeatherSunrise: formatTime(sunrise, 'HH:mm'),
    WeatherSunset: formatTime(sunset, 'HH:mm'),
    WeatherError: messages.weather_ok,
  };
};

const makeForecast = (data) => {
  const { sunrise = new Date(), sunset = new Date() } = getSunTimes() || {};
  const hourly = data.hourly || [];
  const daily = data.daily || [];

  // Hourly: show just the time (HH:mm) above each icon, not the date.
  const hourlyData = hourly.reduce((acc, item, index) => {
    const timeStamp = item.timeStamp * 1000;
    const conditionSymbol = getConditionSymbol(item.condition, sunrise, sunset, timeStamp);
    return {
      ...acc,
      [messageKeys.ForecastTemperature + index]: item.temperature,
      [messageKeys.ForecastTimeStamp + index]: formatTime(timeStamp, 'HH:mm'),
      [messageKeys.ForecastCondition + index]: conditionSymbol,
    };
  }, {});

  // Daily: a short day label (Mon, Tue...) above each icon.
  const dailyData = daily.reduce((acc, day, index) => {
    const conditionSymbol = getConditionSymbol(day.condition, sunrise, sunset, day.midTimeStamp);
    return {
      ...acc,
      [messageKeys.DailyForecastTemperature + index]: day.temperature,
      [messageKeys.DailyForecastDayLabel + index]: day.dayLabel,
      [messageKeys.DailyForecastCondition + index]: conditionSymbol,
    };
  }, {});

  return {
    WeatherMarkerForecast: true,
    ForecastQty: hourly.length,
    ForecastTime: hourly.length ? hourly[0].timeStamp : 0,
    DailyForecastQty: daily.length,
    ...hourlyData,
    ...dailyData,
    WeatherError: messages.weather_ok,
  };
};

export const makeError = (code, type) => errorHandler(code, type);

export default (data, type) => {
  const { WeatherError } = data;
  if (WeatherError) {
    return makeError(data, type);
  }
  switch (type) {
    case 'weather':
      resetErrors();
      return makeWeather(data);
    case 'forecast':
      resetErrors();
      return makeForecast(data);
    default:
      return makeError(data, type);
  }
};
