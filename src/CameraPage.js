import React from 'react';
import { View, Text, TouchableOpacity, ImageBackground, Alert } from 'react-native';
import { Camera } from 'expo-camera';
import * as Permissions from 'expo-permissions';
import * as MediaLibrary from 'expo-media-library';
import * as ImagePicker from 'expo-image-picker';
import { FontAwesome, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import FormData from 'form-data';

export default class CameraPage extends React.Component {
  camera = null;

  state = {
    hasPermission: null,
    cameraType: Camera.Constants.Type.back,
    image: null,
  }

  async componentDidMount() {
    this.getPermissionAsync();
  }

  getPermissionAsync = async () => {
    // Camera roll Permission 
    if (Platform.OS === 'ios') {
      const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL);
      if (status !== 'granted') {
        alert('Sorry, we need camera roll permissions to make this work.');
      }
    }
    // Camera Permission
    const { status } = await Permissions.askAsync(Permissions.CAMERA);
    this.setState({hasPermission: status === 'granted'});
  }

  pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
    });

    if (!result.cancelled) {
      this.setState({image: result.uri});
    }
  }

  takePicture = async () => {
    if (this.camera) {
      let photo = await this.camera.takePictureAsync().then(data => {
        MediaLibrary.saveToLibraryAsync(data.uri);
        this.setState({image: data.uri});
      });
    }
  }

  handleCameraType = () => {
    const { cameraType } = this.state;

    this.setState({cameraType:
      cameraType === Camera.Constants.Type.back
      ? Camera.Constants.Type.front
      : Camera.Constants.Type.back
    });
  }

  detectWeed = () => {
    const apiUrl = 'My-Prediction-Endpoint';    // Requires editing the prediction endpoint URL
    const predictionKey = 'My-Prediction-Key';  // Requires editing the prediction key
    const contentType = 'application/octet-stream';

    const { image } = this.state;
    var formData = new FormData();
    formData.append('file', {
      uri: Platform.OS === 'android' ? image : image.replace('file://', ''),
    });

    // Call prediction URL to classify the image
    axios.post(apiUrl, formData, {
        headers: {
            'Prediction-Key': predictionKey,
            'Content-Type': contentType,
        },
    })
    .then(response =>{
      if (response.data.predictions.length > 0) {
        console.log(response.data.predictions);
        switch (response.data.predictions[0].tagName) {
          case 'Common wheat':
          case 'Maize':
          case 'Sugar beet':
            Alert.alert('Crop detected', 'Please take good care of the seedling.');
            break;
          default:
            Alert.alert('Weed detected!', 'Please take appropriate actions.');
        }
      } else {
        Alert.alert('Error', 'Sorry, the seedling cannot be classified.');
      }
    })
    .catch(error => {
      console.log(error);
      Alert.alert('Error', 'Sorry, we cannot connect to the server at the moment. Please try again later.');
    });
  }

  showCamera = () => {
    this.setState({image: null});
  }

  uploadImage = () => {
    this.detectWeed();
  }

  renderCamera() {
    return(
      <Camera style={{flex: 1}} type={this.state.cameraType} ref={ref => {this.camera = ref;}}>
        <View style={{flex: 1, flexDirection: "row", justifyContent: "space-between", margin: 20}}>
          <TouchableOpacity
            style={{
              alignSelf: 'flex-end',
              alignItems: 'center',
              backgroundColor: 'transparent',
            }}
            onPress={() => this.pickImage()}
            >
            <Ionicons
                name="ios-photos"
                style={{ color: "#fff", fontSize: 40}}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              alignSelf: 'flex-end',
              alignItems: 'center',
              backgroundColor: 'transparent',
            }}
            onPress={() => this.takePicture()}
            >
            <FontAwesome
                name="camera"
                style={{ color: "#fff", fontSize: 40}}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              alignSelf: 'flex-end',
              alignItems: 'center',
              backgroundColor: 'transparent',
            }}
            onPress={() => this.handleCameraType()}
            >
            <MaterialCommunityIcons
                name="camera-switch"
                style={{ color: "#fff", fontSize: 40}}
            />
          </TouchableOpacity>
        </View>
      </Camera>
    )
  }
  
  renderImage() {
    return (
      <ImageBackground style={{ width: "100%", height: "100%" }} source={{ uri: this.state.image }}>
        <View style={{flex: 1, flexDirection: "row", justifyContent: "space-between", margin: 20}}>
        <TouchableOpacity
            style={{
              alignSelf: 'flex-end',
              alignItems: 'center',
              backgroundColor: 'transparent',
            }}
            onPress={() => this.uploadImage()}
            >
            <MaterialCommunityIcons
                name="cloud-upload"
                style={{ color: "#fff", fontSize: 40}}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              alignSelf: 'flex-end',
              alignItems: 'center',
              backgroundColor: 'transparent',
            }}
            onPress={() => this.showCamera()}
            >
            <MaterialCommunityIcons
                name="close"
                style={{ color: "#fff", fontSize: 40}}
            />
          </TouchableOpacity>
        </View>
     </ImageBackground>
    )
  }

  render() {
    const { hasPermission, image } = this.state;

    if (hasPermission === null) {
      return <View />;
    } else if (hasPermission === false) {
      return <Text>No access to camera</Text>;
    } else {
      return (
        <View style={{flex: 1}}>
          {(image===null) ? this.renderCamera() : this.renderImage()}
        </View>
      );
    }
  }
}
