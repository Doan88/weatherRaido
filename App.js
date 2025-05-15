//StAuth10244: I Thanh Truong Doan, 000918024 certify that this material is my original work. No other person's work has been used without due acknowledgement. I have not made my work available to anyone else.

/**
 * Weather Radio Station App
 * 
 * This React Native application provides weather information, a 3-day forecast,
 * and a live Hamilton radio stream. It allows users to retrieve weather details based
 * on their current location or a selected city. The app also displays a history
 * of searched cities and integrates a map for visualization.
 */

import React,{useState, useEffect} from 'react';
import {View, Text, StyleSheet, TextInput,TouchableOpacity, FlatList, Image, ImageBackground } from 'react-native';
import MapView, {Marker} from 'react-native-maps';
import * as Location from 'expo-location';
import { Audio } from 'expo-av';

// API Key for Weather API
const API_Key = '8e3117e26de5478e80705609252603';

const App = () => {
  const [location, setLocation] = useState(null);
  const [weather, setWeather] = useState(null);
  const [city, setCity] = useState("");
  const [isCityValid, setIsCityValid] = useState(true);
  const [forecast, setForecast] = useState(null);
  const [cityHistory, setCityHistory] = useState([]);
  const [radio, setRadio] = useState();
  const [isPlaying, setIsPlaying] = useState(false);
  
  useEffect(() => {getLocation();},[]);

  /**
   * Function to retrieves the user's current location and fetches weather data.
   */
  const getLocation = async () => {
    const {status} = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      return;
    }
    const location = await Location.getCurrentPositionAsync({});
    setLocation(location.coords);
    getWeather(location.coords.latitude, location.coords.longitude);
    setCity("");
  };

  /**
   * Function to fetch weather data based on latitude and longitude.
   */
  const getWeather = async (latitude,longitude) => {
    const url = `https://api.weatherapi.com/v1/current.json?key=${API_Key}&q=${latitude},${longitude}&aqi=no`;
    try {
      const response = await fetch(url);
      const data = await response.json();
      if (data && data.current && data.current.condition) {
        setWeather(data);    
        setForecast(null);
      }
      else 
        return;
    }
    catch (error) {
      console.error(error);
    }
  };

  /**
   * Function to fetch weather data for a specific city.
   */
  const getCityWeather = async (city) => {
    if (!city) return;
    const url = `https://api.weatherapi.com/v1/current.json?key=${API_Key}&q=${city}&aqi=no`;
    try {
      const response = await fetch(url);
      const data = await response.json();
      if (data && data.current && data.current.condition) {
        setWeather(data);
        setIsCityValid(true);
        setForecast(null);
        const {lat, lon} = data.location;
        setLocation({latitude: lat,longitude: lon});
        updateCityHistory(city);
        setCity("");
      }
      else {
        setCity("");
        setIsCityValid(false);
      }
    }
    catch (error) {
      console.error(error);
      setCity("");
      setIsCityValid(false);
    }
  };
 
  /**
   * Function to handle city selection
   */
  const handleSelectCity = () => {
    const searchCity = city.trim(); // Remove leading and trailing spaces
    if (searchCity){
        getCityWeather(searchCity);
      }
  };

  /**
   * Function to fetch weather forecast for the current location
   */
  const getForecast = async (latitude, longitude) => {
    const url = `https://api.weatherapi.com/v1/forecast.json?key=${API_Key}&q=${latitude},${longitude}&days=3&aqi=no`;
    try {
      const response = await fetch(url);
      const data = await response.json();
      if (data && data.forecast && data.forecast.forecastday) {
        setForecast(data.forecast.forecastday);
      }
       else 
        return;
    }
    catch (error) {
      console.error(error);
    }
  }

  /**
   * Function to fetch weather forecast for a selected city
   */
  const getCityForecast = async (city) => {
    const url = `https://api.weatherapi.com/v1/forecast.json?key=${API_Key}&q=${city}&days=3&aqi=no`;
    try {
      const response = await fetch(url);
      const data = await response.json();
      if (data && data.forecast && data.forecast.forecastday) {
        setForecast(data.forecast.forecastday);
      }
      else
        return;
    }
    catch (error){
      console.error(error);
    }
  }

  /**
   * Function to update the city history list
   * Adds a new city to the history list while ensuring no duplicates and keeping the last 5 searches
   */
  const updateCityHistory = (newCity) => {
    setCityHistory(prevHistory => {
        if (prevHistory.includes(newCity)) {
          return prevHistory;
        }
        return [newCity, ...prevHistory].slice(0, 5);
    });
  };

  /**
   * Selects a city from the history list and retrieves its weather data.
   */
  const selectCityFromHistory = (selectedCity) => {
    setCity(selectedCity);
    getCityWeather(selectedCity);  
  };

  /**
   * Toggles the playback of Hamilton radio.
   */
  const playRadio = async () => {
    try {
      if (isPlaying) {
        await radio.stopAsync();
        await radio.unloadAsync();
        setIsPlaying(false);
        setRadio(null);
      }
      else {
        const {sound} = await Audio.Sound.createAsync(
          {uri: 'http://live.leanstream.co/CINGFM'}, //https://www.radio-browser.info/
          { shouldPlay: true}
        );
        setRadio(sound);
        setIsPlaying(true);
        await sound.playAsync();
      }
    }
    catch (error){
      console.error(error);
      setIsPlaying(false);
    }
  };

  return (
    
    <ImageBackground source={require('./assets/background.jpg')} style = {styles.container}>
      // App Title
      <Text style = {styles.appTitle}>Weather Radio Station</Text> 
      // Weather Inforamation Section
      <View style = {styles.weatherContainer}>
       {weather ? (
         <View style={styles.weatherRow}>
          // Weather Icon
          <Image
            source={{ uri: `https:${weather.current.condition.icon}` }}
            style={styles.weatherIcon}
          />
          //Weather Details
          <View>      
              <Text style = {styles.textWeather}>{weather.location.name.toUpperCase()}</Text>
              <Text style = {styles.textWeather}>{weather.current.condition.text}</Text>
              <Text style = {styles.textWeather}>Temperature: {weather.current.temp_c} °C</Text>
              <Text style = {styles.textWeather}>Feels Like: {weather.current.feelslike_c} °C</Text>
              <Text style = {styles.textWeather}>Wind Speed: {weather.current.wind_kph} km/h</Text>
              <Text style = {styles.textWeather}>Humidity: {weather.current.humidity}%</Text>
          </View>
        </View>
        ) : null}       
      </View>
    
      // Forecast Section
      <View style = {styles.middlePart}>
        <View style = {styles.forecast}>
          {forecast ? (
            <>
              <Text style={styles.forecastTitle}>3 Days Forecast:</Text>
              {forecast.map((day, index) => (
                <View key={index} style={styles.forecastDay}>                
                    <Text style={styles.forecastText}>{day.date}</Text>
                    <Text style={styles.forecastText}>Weather: {day.day.condition.text}</Text>
                    <Text style={styles.forecastText}>Temperature: {day.day.avgtemp_c} °C</Text>               
                </View>
              ))}
            </>
          ) : ("")}
        </View>

        // User Controls
        <View style = {styles.buttonContainer}>
            // Current Location Button        
            <TouchableOpacity style={styles.button} onPress={getLocation}>
              <Text style = {styles.buttonText}>Current Location</Text>
            </TouchableOpacity> 
            // City Input Box           
            <TextInput
              style = {styles.inputBox}
              placeholder={isCityValid ? "Enter city" : "Invalid city"}
              placeholderTextColor='#aae5ab'
              width='120'
              value={city}
              onChangeText={setCity}
            />
            // Select City Button
            <TouchableOpacity style={styles.button} onPress={handleSelectCity}>
              <Text style = {styles.buttonText}>Select City</Text>
            </TouchableOpacity>
            // Forecast Button
            <TouchableOpacity style={styles.button} onPress={ () => {
              if (!city) {
                getForecast(location.latitude, location.longitude)
                }
              else{
                getCityForecast(city);
              }
                }} >
                <Text style = {styles.buttonText}>Forecast</Text>
            </TouchableOpacity>
            // Play/Stop Radio Button        
            <TouchableOpacity style={styles.button} onPress={playRadio}>
              <Text style = {styles.buttonText}>{isPlaying ? 'Stop Radio' : 'Play Radio'}</Text>
            </TouchableOpacity>
        </View>
      </View>
      //City Search History Section
      <View>
        <FlatList
          data={cityHistory}
          keyExtractor={(index) => index.toString()}
          horizontal={true}
          renderItem = {({item}) => (
            <View style={styles.history}>
              <TouchableOpacity onPress={() => selectCityFromHistory(item)}>
                <Text style={styles.historyCity}>{item} </Text>
              </TouchableOpacity>
            </View>
          )}      
        />
      </View>
      // Map View Section
      <View>
        {location && (
          <MapView
            style={styles.map}
            region={{
              latitude: location.latitude,
              longitude: location.longitude,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            }}
          >
          // Marker for Location
          <Marker 
          coordinate={{latitude: location.latitude, longitude: location.longitude}}
          title={'Your location'}             
          />
        </MapView>
        )}
      </View>      
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
  flex: 1,
  resizeMode: "cover",
  paddingTop: 55,
  paddingRight: 10,
  paddingLeft: 10,
 
  },
  appTitle: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#43ffcf',
    textAlign: 'center',
    backgroundColor: 'black',
    borderRadius: 10,
    opacity: 0.5
  },
  weatherContainer: {
    backgroundColor: '#f0f1e1',
    width: '100%',
    marginTop: 5,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'white'
  },
  weatherRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  weatherIcon: {
    width: 120,
    height: 120,
    marginRight: 10,
  },
  textWeather: {
    paddingLeft: 5,
    paddingTop: 3,
    paddingBottom: 3,
    fontSize: 15,
    color: '#378362',
    fontWeight: 'bold'
  },
  middlePart: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10
  },
  forecast: {
    width: '65%',
    alignItems: 'left',
    paddingLeft: 5
  },
  buttonContainer: {
    alignItems: 'center',
    marginTop: 5
  },
  button: {
    backgroundColor: '#9de8a0',
    padding: 5,
    margin: 5,
    width: 120,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: 'white'
  },
  buttonText: {
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 12
  },
  inputBox: {
    backgroundColor: 'white'
  },
  forecastTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#a98000'
  },
  forecastDay: {
    marginBottom: 4,
    backgroundColor: '#76e1f6',
    borderRadius: 5
  },
  forecastText: {
    color: '#24675c',
    paddingLeft: 3,
    fontWeight: 'bold'
  },
  history: {
    flexDirection: 'row',
    marginTop: 10
  },
  historyCity: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 15,
    backgroundColor: '#efcf2d',
    margin: 5,
    borderRadius: 5,
    padding: 3,
    textAlign: 'center'
  },
  map: {
    marginTop: 10,
    width: '100%',
    height: 300
  }
});
export default App;









