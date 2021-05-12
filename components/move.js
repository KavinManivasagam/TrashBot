import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  View,
  Button,
  FlatList,
  Switch
} from 'react-native';

import BluetoothSerial from 'react-native-bluetooth-serial'

export default class App extends Component<{}> {
  constructor (props) {
    super(props)
    this.state = {
      isEnabled: false,
      discovering: false,
      devices: [],
      unpairedDevices: [],
      connected: false,
    }
  }
  var posX = 0; //initializes robot's current x position
  var posY = 0; //initializes robot's curent y position
  var position[3] = {posX, posY, 0}; //initializes robot's current coordinate
  var grid[3][3][3]; //creates array of grid
  var gridSizeX = sizeof(grid)/sizeof(grid[0]);
  var gridSizeY = sizeof(grid[0])/sizeof(grid[0][0]);
  var orientation = "up";
//char moves[] = {'w', 'a', 's', 'd'};

  var trigPin = 7; //sets up pin to release sonar ping
  var echoPin = 5; //sets up pin to recieve the info on the sonar ping
  var ultra5V= 10;
  componentWillMount(){

    Promise.all([
      BluetoothSerial.isEnabled(),
      BluetoothSerial.list()
    ])
    .then((values) => {
      const [ isEnabled, devices ] = values

      this.setState({ isEnabled, devices })
    })

    BluetoothSerial.on('bluetoothEnabled', () => {

      Promise.all([
        BluetoothSerial.isEnabled(),
        BluetoothSerial.list()
      ])
      .then((values) => {
        const [ isEnabled, devices ] = values
        this.setState({  devices })
      })

      BluetoothSerial.on('bluetoothDisabled', () => {

         this.setState({ devices: [] })

      })
      BluetoothSerial.on('error', (err) => console.log(`Error: ${err.message}`))

    })

  }
  _renderItem(item){

    return(<View style={styles.deviceNameWrap}>
            <Text style={styles.deviceName}>{item.item.name}</Text>
          </View>)
  }
  enable () {
    BluetoothSerial.enable()
    .then((res) => this.setState({ isEnabled: true }))
    .catch((err) => Toast.showShortBottom(err.message))
  }

  disable () {
    BluetoothSerial.disable()
    .then((res) => this.setState({ isEnabled: false }))
    .catch((err) => Toast.showShortBottom(err.message))
  }

  toggleBluetooth (value) {
    if (value === true) {
      this.enable()
    } else {
      this.disable()
    }
  }

  void initializeGrid(){
    //gives grid coordinate values
    for(int y=0; y<gridSizeY; y++){
      for(int x=0; x<gridSizeX; x++){
        grid[x][y][0] = x; //defines x value for coordinate
        grid[x][y][1] = y; //defines y value for coordinate
        grid[x][y][2] = 0; //defines status of coordinat (0 = open, 1 = blocked, 2 = robot is there)
      }
    }
  }

  void movePosition(char m){
    int pos[] = {posX, posY};
    
    if(m=='w'){
      if(orientation != "up"){
        //***rotate motors***
        Serial.print("rotating...   ");
        delay(3000);
        Serial.println("rotated up");
        orientation="up";
      }
      else{
        grid[posX][posY][2] = 2;
        posY -=1;
        //***move motors here***
      }
    }
    else if(m=='s'){
      if(orientation != "down"){
       //***rotate motors***
         Serial.print("rotating...   ");
         delay(3000);
         Serial.println("rotated down");
       orientation="down";
      } 
      else{
        grid[posX][posY][2] = 2;
        posY +=1;
       //***move motors here***
       }
     }
     
     else if(m=='d'){
      if(orientation != "right"){
       //**rotate motors***
         Serial.print("rotating...   ");
         delay(3000);
         Serial.println("rotated right");
       orientation = "right";
      }
      else{
        grid[posX][posY][2] = 2;
        posX +=1;
        //***move motors here***
      }
     }
     
     else if(m=='a'){
       if(orientation != "left"){
         //***rotate motors***
         Serial.print("rotating...   ");
         delay(3000);
         Serial.println("rotated left");
         orientation="left";
       }
       else{
         grid[posX][posY][2] = 2;
         posX -=1;
         //***move motors here***
       }
     }
     position[0] = posX;
     position[1] = posY;
   }
   
   
   
   char decideMove(){
     char moves[] = {'w', 'a', 's', 'd'};
     int movesRank[4] = {10, 10, 10, 10};
   
     //prevents bot from leaving map and crashing into obstacles
     //up
     if(orientation == "up" && ultraSonicSense() <20){
         grid[posX][posY-1][2]=1;
     }
     if(posY-1<0 || grid[posX][posY-1][2]==1){
       movesRank[0] = 0;
     }
     
     //left
     if(orientation =="left" && ultraSonicSense() < 20){
         grid[posX-1][posY][2]=1;
     }
     if(posX-1<0 || grid[posX-1][posY][2]==1){
       movesRank[1] = 0;
     }
   
     //down
     if(orientation == "down" && ultraSonicSense() < 20){
         grid[posX][posY+1][2]=1;
     }
     if(posY+1>gridSizeY-1 || grid[posX][posY+1][2]==1){
       movesRank[2] = 0;
     }
   
     //right
     if(orientation =="right" && ultraSonicSense() < 20){
         grid[posX+1][posY][2]=1;
     }
     if(posX+1>gridSizeX-1 || grid[posX+1][posY][2]==1){
         movesRank[3] = 0;
     }
   
   
     //prevents bot from alternating between two spots
     if(orientation=="down"){
       movesRank[0] -=2;
       movesRank[2] +=2;
     }
     if(orientation=="up"){
       movesRank[2] -=2;
       movesRank[0] +=2;
     }
     if(orientation=="right"){
       movesRank[1] -=2;
       movesRank[3] +=2;
     }
     if(orientation=="left"){
       movesRank[3] -=2;
       movesRank[1] +=2;
     }
   
     //prevents bot from retracing steps
     if(grid[posX][posY-1][2]==2){
       movesRank[0] -=3;
     }
     if(grid[posX+1][posY][2]==2){
       movesRank[3] -=3;
     }
     if(grid[posX-1][posY][2]==2){
       movesRank[1] -=3;
     }
     if(grid[posX][posY+1][2]==2){
       movesRank[2] -=3;
     }
   
     int big = 0;
     for(int i =0; i<4;i++){
       if(movesRank[i]>movesRank[big]){
         big = i;
       }
     }
     
     if(moves[big]=='w'){
       Serial.println("Move UP");
     }
     else if(moves[big]=='a'){
       Serial.println("Move LEFT");
     }
     else if(moves[big]=='s'){
       Serial.println("Move DOWN");
     }
     else if(moves[big]=='d'){
       Serial.println("Move RIGHT");
     }
     Serial.print("Rank: ");
     Serial.println(movesRank[big]);
     
     return moves[big];
   }
   
   /*char remoteControl(){
     if (IrReceiver.decode()) {
       Serial.println(IrReceiver.decodedIRData.decodedRawData);
       int freq = IrReceiver.decodedIRData.decodedRawData;
       if(freq == upFreq){
         return 'w';
       }
       else if(freq == downFreq){
         return 's';
       }
       else if(freq == leftFreq){
         return 'a';
       }
       else if(freq == rightFreq){
         return 'd';
       }
       IrReceiver.resume(); // Receive the next value
     }
   }*/
   
   int ultraSonicSense(){
     digitalWrite(ultra5V, HIGH);
     long duration;
     digitalWrite(trigPin, LOW);//idk what this does
     delayMicroseconds(2); //idk what this does
     digitalWrite(trigPin, HIGH); //sends out sonar ping
     delayMicroseconds(10);
     digitalWrite(trigPin, LOW);//resets trig pin
     duration = pulseIn(echoPin, HIGH);//takes recieves the ping
     int distance = duration/29/2; //distance in cm
     return distance;
   }
   
   void setup() {
     Serial.begin(9600);
     posX = gridSizeX/2; //robot's current x position (puts it in the middle of map)
     posY = gridSizeY/2; //robot's curent y position (puts it in the middle of the map)
     position[0] = posX; 
     position[1] = posY;//robot's current coordinate
     pinMode(ultra5V, OUTPUT);
     pinMode(trigPin, OUTPUT);
     pinMode(echoPin, INPUT);
     //IrReceiver.begin(IR_RECEIVE_PIN, true); // Start the receiver
     initializeGrid();
   }
   
   void loop() {
     int obstaclesX[3];
     int obstaclesY[3];
     for(int steps = 0; steps<15; steps++){
       Serial.println("\n\nDeciding...");
       delay(5000);
       char movement = decideMove();
       movePosition(movement);
     }
     int c=0;
     Serial.println("DONE");
     for(int x = 0; x <gridSizeX; x++){
       for(int y = 0; y <gridSizeY; y++){
         if(grid[x][y][2]==1){
           obstaclesX[c]=x;
           obstaclesY[c] = y;
           c++;
         }
       }
     }
     for(int i=0; i<3; i++){
       //x and y are flipped
       Serial.print(obstaclesY[i]);
       Serial.print(", ");
       Serial.println(obstaclesX[i]);
     }
   }

  render() {

    return (
      <View style={styles.container}>
      <View style={styles.toolbar}>

            <Text style={styles.toolbarTitle}>Bluetooth Device List</Text>

            <View style={styles.toolbarButton}>

              <Switch
                value={this.state.isEnabled}
                onValueChange={(val) => this.toggleBluetooth(val)}
              />

            </View>
      </View>
        <FlatList
          style={{flex:1}}
          data={this.state.devices}
          keyExtractor={item => item.id}
          renderItem={(item) => this._renderItem(item)}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5FCFF',
  },
  toolbar:{
    paddingTop:30,
    paddingBottom:30,
    flexDirection:'row'
  },
  toolbarButton:{
    width: 50,
    marginTop: 8,
  },
  toolbarTitle:{
    textAlign:'center',
    fontWeight:'bold',
    fontSize: 20,
    flex:1,
    marginTop:6
  },
  deviceName: {
    fontSize: 17,
    color: "black"
  },
  deviceNameWrap: {
    margin: 10,
    borderBottomWidth:1
  }
});