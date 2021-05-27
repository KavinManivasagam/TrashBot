import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { fetch } from ‘@tensorflow/tfjs-react-native’

class image extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  async componentDidMount() {
    await tf.ready(); // preparing TensorFlow
    this.setState({ isTfReady: true,});
    this.model = await mobilenet.load(); // preparing MobileNet model
    this.setState({ isModelReady: true });
    this.getPermissionAsync(); // get permission for accessing camera on mobile device
  }
getPermissionAsync = async () => {
    if (Constants.platform.ios) {
        const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL)
        if (status !== 'granted') {
            alert('Please grant camera roll permission for this project!')
        }
    }async componentDidMount() {
    await tf.ready(); // preparing TensorFlow
    this.setState({ isTfReady: true,});
    this.model = await mobilenet.load(); // preparing MobileNet model
    this.setState({ isModelReady: true });
    this.getPermissionAsync(); // get permission for accessing camera on mobile device
  }
getPermissionAsync = async () => {
    if (Constants.platform.ios) {
        const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL)
        if (status !== 'granted') {
            alert('Please grant camera roll permission for this project!')
        }
    }


    selectImage = async () => {
        try {
          let response = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            allowsEditing: true,
            aspect: [4, 3]
          })
          if (!response.cancelled) {
              const source = { uri: response.uri }
              this.setState({ image: source })
              this.classifyImage()
          }
        } catch (error) {
          console.log(error)
        }
    }

    classifyImage = async () => {
        try {
          const imageAssetPath = Image.resolveAssetSource(this.state.image)
          const response = await fetch(imageAssetPath.uri, {}, { isBinary: true })
          const rawImageData = await response.arrayBuffer()
          const imageTensor = this.imageToTensor(rawImageData)
          const predictions = await this.model.classify(imageTensor)
          this.setState({ predictions: predictions })
        } catch (error) {
          console.log('Exception Error: ', error)
        }
    }
    imageToTensor(rawImageData) {
        const TO_UINT8ARRAY = true
        const { width, height, data } = jpeg.decode(rawImageData, TO_UINT8ARRAY)
        // Drop the alpha channel info for mobilenet
        const buffer = new Uint8Array(width * height * 3)
        let offset = 0 // offset into original data
        for (let i = 0; i < buffer.length; i += 3) {
          buffer[i] = data[offset]
          buffer[i + 1] = data[offset + 1]
          buffer[i + 2] = data[offset + 2]
          offset += 4
        }
        return tf.tensor3d(buffer, [height, width, 3])
    }

    renderPrediction = (prediction) => {
        return (
          <View style={styles.welcomeContainer}>
            <Text key={prediction.className} style={styles.text}>
              Prediction: {prediction.className} {', '} Probability: {prediction.probability}
            </Text>
          </View>
        )
    }

export default image;
