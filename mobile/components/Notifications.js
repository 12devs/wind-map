import React, { Component } from 'react'
import { View, StyleSheet, Text, ScrollView, Dimensions, BackHandler } from 'react-native'
import actions from '../actions/index'
import services from '../services/index'
import { connect } from "react-redux"
import { Button, List, ListItem } from 'react-native-elements'
import service from '../services'

const { width } = Dimensions.get('window')

class Notifications extends Component {

  componentDidMount() {
    BackHandler.addEventListener('hardwareBackPress', this.handleBackPress)
    service.getNotification().then(res => {
      this.props.updateReduxState({ notifications: res  })
    })
  }

  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this.handleBackPress)
  }

  handleBackPress = () => {
    this.props.navigation.navigate('Map')
    return true
  }

  handleClick(id) {
    const notifications = this.props.notifications
    const index = notifications.findIndex(el => el.id === id)

    notifications[index].view_at = new Date()
    this.props.updateReduxState({ notifications })
    services.viewNotifications({ notification: notifications[index] })
    this.forceUpdate()
  };

  viewAllNotification() {
    const notifications = this.props.notifications

    return service.viewAllNotification().then(res => {
      notifications.map(el => el.view_at = new Date())
      this.props.updateReduxState({ notifications })
      console.log(res)
      this.forceUpdate()
    })
  };

  render() {
    const unviewedNotifications = this.props.notifications.filter(elem => !elem.view_at)

    if (!unviewedNotifications.length) {
      return <View style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
      }}>
        <Text style={styles.textContainer}>
          {'No notifications'}
        </Text>
      </View>
    }
    return (
      <ScrollView contentContainerStyle={{
        flexDirection: 'column',
        justifyContent: 'center'
      }}>
        <View>
          {
            unviewedNotifications.map((notification, i) => (
              <ListItem
                key={i}
                title={notification.message}
                titleNumberOfLines={2}
                subtitle={notification.created_at}
                leftIcon={{ name: 'notifications' }}
                rightIcon={{ name: 'close' }}
                containerStyle={styles.list}
                onPressRightIcon={() => {
                  this.handleClick(notification.id)
                }}
              />
            ))
          }
        </View>
        <Button
          containerViewStyle={{ marginLeft: width / 5, marginRight: width / 5, marginBottom: 20, marginTop: 20 }}
          backgroundColor={'#3D6DCC'}
          borderRadius={50}
          color={'#fff'}
          title='Clear All'
          onPress={() => {
            this.viewAllNotification()
          }}/>
      </ScrollView>
    )
  }
}

function mapStateToProps(state) {
  return {
    notifications: state.get('notifications'),
  }
}

export default connect(mapStateToProps, actions)(Notifications)


const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    margin: 5,
    backgroundColor: 'steelblue',
    borderWidth: 2,
    borderColor: 'steelblue',
    borderRadius: 20,
  },
  textContainer: {
    textAlign: 'center',
    textAlignVertical: "center",
    color: 'silver',
    padding: 10,
  },
  list: {
    borderBottomColor: '#eee',
    marginBottom: 2,
    borderTopColor: 'transparent',
    marginLeft: 10,
    marginRight: 10
  },
})
