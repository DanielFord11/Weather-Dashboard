const key = '64f2ee2a8261daa4d9f780f5b365f275';
let city = 'Denver';
const cityHist = JSON.parse(localStorage.getItem('city')) || [];

const date = moment().format('dddd, MMMM Do YYYY');

const contHistEl = $('.cityHist');
const cardTodayBody = $('.cardBodyToday');
const fiveForecastEl = $('.fiveForecast');

function retrieveHistory() {
  contHistEl.empty();
  cityHist.forEach((hist) => {
    const rowEl = $('<row>');
    const btnEl = $('<button>').text(hist);
    rowEl.addClass('row histBtnRow');
    btnEl.addClass('btn btn-outline-secondary histBtn').attr('type', 'button');
    contHistEl.prepend(rowEl.append(btnEl));
  });

  $('.histBtn').on('click', function (event) {
    event.preventDefault();
    city = $(this).text();
    fiveForecastEl.empty();
    fetchWeatherToday();
  });
}

function fetchWeatherToday() {
  const getUrlCurrent = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=imperial&appid=${key}`;

  $(cardTodayBody).empty();

  $.get(getUrlCurrent, (response) => {
    $('.cardTodayCityName').text(response.name);
    $('.cardTodayDate').text(date);
    $('.icons').attr('src', `https://openweathermap.org/img/wn/${response.weather[0].icon}@2x.png`);
    ['Temperature', 'Feels Like', 'Humidity', 'Wind Speed'].forEach((key) => {
      const pEl = $('<p>').text(`${key}: ${response.main[key.toLowerCase().split(' ').join('_')]} ${key === 'Wind Speed' ? 'MPH' : '°F'}`);
      cardTodayBody.append(pEl);
    });

    const { lon, lat } = response.coord;
    const getUrlUvi = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=hourly,daily,minutely&appid=${key}`;

    $.get(getUrlUvi, (response) => {
      const pElUvi = $('<p>').text('UV Index: ');
      const uviSpan = $('<span>').text(response.current.uvi).appendTo(pElUvi);
      const { uvi } = response.current;
      pElUvi.append(uviSpan);
      cardTodayBody.append(pElUvi);

      if (uvi >= 0 && uvi <= 2) {
        uviSpan.addClass('green');
      } else if (uvi > 2 && uvi <= 5) {
        uviSpan.addClass('yellow');
      } else if (uvi > 5 && uvi <= 7) {
        uviSpan.addClass('orange');
      } else if (uvi > 7 && uvi <= 10) {
        uviSpan.addClass('red');
      } else {
        uviSpan.addClass('purple');
      }
    });
  });
  fetchFiveDayForecast();
}

function fetchFiveDayForecast() {
  const getUrlFiveDay = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=imperial&appid=${key}`;

  $.get(getUrlFiveDay, (response) => {
    const myWeather = response.list.filter((value) => value.dt_txt.split(' ')[1] === '12:00:00').map((value) => ({
      date: moment(value.dt_txt.split(' ')[0]).format('MM-DD-YYYY'),
      time: value.dt_txt.split(' ')[1],
      temp: value.main.temp,
      feels_like: value.main.feels_like,
      icon: value.weather[0].icon,
      humidity: value.main.humidity,
    }));

    myWeather.forEach((weather) => {
      const divElCard = $('<div>').addClass('card text-white bg-primary mb-3 cardOne').attr('style', 'max-width: 200px;');
      fiveForecastEl.append(divElCard);
      const divElHeader = $('<div>').addClass('card-header').text(weather.date);
      divElCard.append(divElHeader);
      const divElBody = $('<div>').addClass('card-body');
      divElCard.append(divElBody);
      const divElIcon = $('<img>').addClass('icons').attr('src', `https://openweathermap.org/img/wn/${weather.icon}@2x.png`);
      divElBody.append(divElIcon);
      ['Temperature', 'Feels Like', 'Humidity'].forEach((key) => {
        const pEl = $('<p>').text(`${key}: ${weather[key.toLowerCase().split(' ').join('_')]} ${key === 'Humidity' ? '%' : '°F'}`);
        divElBody.append(pEl);
      });
    });
  });
}

$('.search').on('click', function (event) {
  event.preventDefault();
  city = $(this).parent('.btnPar').siblings('.textVal').val().trim();
  if (city === '') {
    return;
  }
  cityHist.push(city);

  localStorage.setItem('city', JSON.stringify(cityHist));
  fiveForecastEl.empty();
  retrieveHistory();
  fetchWeatherToday();
});

function initializeLoad() {
  retrieveHistory();
  fetchWeatherToday();
}

initializeLoad();
