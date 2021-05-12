import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { Dimensions, Image, ImageBackground, Keyboard, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';

const entireScreenHeight = Dimensions.get('window').height;
const rem = entireScreenHeight / 380;
const entireScreenWidth = Dimensions.get('window').width;
const wid = entireScreenWidth / 380;

export default function App() {
  return (
    <View style={styles.container}>
      <ImageBackground style={styles.container} source={require('./assets/background.png')}>



        <TouchableOpacity style={styles.buttonStyle}>
        <Text style={{color: 'red'}}>Dan, </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.buttonStyle}>

        </TouchableOpacity>
        
      
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonStyle: {
    
    width: 333,
    height: 70,
    paddingLeft: 47,
    paddingTop: 65,
    paddingBottom: 15,
    marginBottom: -250,
    marginTop: 65,
    marginLeft: 15,
    backgroundColor:"#fff",
    borderRadius: 8,
  },
  textButton: {
    width: 329,
    height: 27,
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 47,
    paddingTop: 546,
    fontWeight: 'bold',
    fontSize: 24,
    color: '#438DC2', 
  },
});
