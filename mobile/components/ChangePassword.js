import React, { Component } from 'react';
import { View, Text, TextInput, StyleSheet, Dimensions, TouchableOpacity, ScrollView } from 'react-native';
import services from '../services/index';
import { Button, Icon } from 'react-native-elements';

const { width, height } = Dimensions.get('window');

class ChangePassword extends Component {
  state = {
    login: '',
    password: '',
    email: '',
    repeatPassword: '',
    error: '',
    changePasswordCode: '',
    showCode: false,
  };

  changePassword = () => {
    const { login, password, repeatPassword, changePasswordCode } = this.state;
    if (password === repeatPassword) {
      services.changePassword({ login, password, changePasswordCode })
        .then((res) => {
          console.log(res);
          const { error, message, email } = res;
          if (message === 'code') {
            this.setState({ error: '' });
            return this.setState({ email, showCode: true });
          }
          if (message !== 'OK') {
            error ? this.setState({ error }) : this.setState({ error: message });
          } else {
            return this.props.navigation.navigate('Login');
          }
        })
        .catch((error) => {
          this.setState({ error: error.toString() });
        });
    }
    else {
      this.setState({ error: 'Passwords do not match' });
    }
  };

  render() {
    if (this.state.showCode) {
      return (
        <ScrollView>
          <View style={styles.mainContainer}>
            <View style={styles.container}>
              <View style={{
                flexDirection: 'row',
                justifyContent: 'center',
              }}>
                <TextInput style={styles.input}
                           value={this.state.code}
                           underlineColorAndroid="transparent"
                           placeholder={"code from " + this.state.email}
                           placeholderTextColor="#3D6DCC"
                           autoCapitalize="none"
                           onChangeText={(changePasswordCode) => this.setState({ changePasswordCode })}/>
                <View style={styles.iconContainer}>
                  <Icon name='lock-outline' color='#3D6DCC'/>
                </View>
              </View>

              {this.state.error ? <Text style={{ textAlign: 'center', color: 'red' }}> {this.state.error}</Text> : null}
              <View style={{
                flexDirection: 'row',
                justifyContent: 'center',
              }}>
                <Button
                  containerViewStyle={styles.buttonContainer}
                  backgroundColor={'#3D6DCC'}
                  // large
                  // borderRadius={50}
                  title='SEND'
                  color={'#fff'}
                  onPress={this.changePassword}/>
              </View>
            </View>
          </View>
        </ScrollView>
      );
    } else {
      return (
        <ScrollView>
          <View style={styles.mainContainer}>
            <View style={styles.container}>
              <View style={{
                flexDirection: 'row',
                justifyContent: 'center',
              }}>
                <TextInput style={styles.input}
                           underlineColorAndroid="transparent"
                           placeholder="Username"
                           placeholderTextColor="#3D6DCC"
                           autoCapitalize="none"
                           value={this.state.login}
                           onChangeText={(login) => this.setState({ login })}/>
                <View style={styles.iconContainer}>
                  <Icon name='mail-outline' color='#3D6DCC'/>
                </View>
              </View>
              <View style={{
                flexDirection: 'row',
                justifyContent: 'center',
              }}>
                <TextInput style={styles.input}
                           underlineColorAndroid="transparent"
                           secureTextEntry={true}
                           placeholder="Password"
                           placeholderTextColor="#3D6DCC"
                           autoCapitalize="none"
                           value={this.state.password}
                           onChangeText={(password) => this.setState({ password })}/>
                <View style={styles.iconContainer}>
                  <Icon name='lock-outline' color='#3D6DCC'/>
                </View>
              </View>
              <View style={{
                flexDirection: 'row',
                justifyContent: 'center',
              }}>
                <TextInput style={styles.input}
                           underlineColorAndroid="transparent"
                           secureTextEntry={true}
                           placeholder="Repeat Password"
                           placeholderTextColor="#3D6DCC"
                           autoCapitalize="none"
                           value={this.state.repeatPassword}
                           onChangeText={(repeatPassword) => this.setState({ repeatPassword })}/>
                <View style={styles.iconContainer}>
                  <Icon name='lock-outline' color='#3D6DCC'/>
                </View>
              </View>
              {this.state.error ? <Text style={{ textAlign: 'center', color: 'red' }}> {this.state.error}</Text> : null}
              <View style={{
                flexDirection: 'row',
                justifyContent: 'center',
              }}>
                <Button
                  containerViewStyle={styles.buttonContainer}
                  backgroundColor={'#3D6DCC'}
                  // large
                  // borderRadius={50}
                  title='Change'
                  color={'#fff'}
                  onPress={this.changePassword}/>
              </View>
            </View>
            <TouchableOpacity
              onPress={() => {
                this.props.navigation.navigate('Login');
              }}
            >
              <Text style={styles.textContainer}>You can login here.</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      );
    }
  }
}

export default ChangePassword;

const styles = StyleSheet.create({
  mainContainer: {
    // marginTop: 10,
    flexDirection: 'column',
    alignItems: 'stretch',
    flex: 2,
    backgroundColor: '#fff',

  },
  container: {
    paddingTop: 30,
    paddingBottom: 30,
    backgroundColor: '#fff',
    // margin: 10,
    // elevation: 5
  },
  iconContainer: {
    borderBottomColor: '#3D6DCC',
    borderBottomWidth: 1,
    width: 40,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  input: {
    // marginTop: 10,
    marginBottom: 10,
    height: 60,
    borderBottomColor: '#3D6DCC',
    borderBottomWidth: 1,
    width: "80%",
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    textAlign: 'center',
    textAlignVertical: "center",
    color: '#3D6DCC',
    padding: 10,
  },
  secondaryTextContainer: {
    textAlign: 'center',
    textAlignVertical: "center",
    color: '#3D6DCC',
    padding: 10,
  },
  buttonContainer: {
    marginTop: 35,
    marginBottom: 10,
    width: "80%",
    borderWidth: 1,
    borderColor: '#3D6DCC'
  }
});
