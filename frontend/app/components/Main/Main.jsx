import React from 'react';
import services from "./../../services";
import { connect } from 'react-redux';
import actions from './../../actions';
import Map from './Map'
import NotificationSettings from './NotificationSettings';
import PointSettings from './PointSettings';
import SavePointSettings from './SavePointSettings';
import geolib from "geolib";

class Main extends React.Component {
  constructor() {
    super();
    this.state = {
      isNotificationSettingsOpen: false,
    };
    this.getInfo = this.getInfo.bind(this);
    this.openNotificationSettings = this.openNotificationSettings.bind(this);
    this.closeNotificationSettings = this.closeNotificationSettings.bind(this);
    this.changeViewType = this.changeViewType.bind(this);
    this.logout = this.logout.bind(this);
  }

  componentDidMount() {
    return this.getInfo()
  }

  openNotificationSettings() {
    this.setState({ isNotificationSettingsOpen: true })
  }

  changeViewType() {
    if (this.props.viewType === 'Current') {
      this.props.changeViewType('Historical')
    } else {
      this.props.changeViewType('Current')
    }
  }

  closeNotificationSettings() {
    this.setState({ isNotificationSettingsOpen: false })
  }

  getInfo() {
    return services.getInfo()
      .then(res => {
        res.savePointSettings = {};
        let { latitude, longitude } = geolib.getCenter([...res.places, ...res.dangers]);
        const { minLat, maxLat, minLng, maxLng } = geolib.getBounds([...res.places, ...res.dangers]);
        res.mapCenter = {
          lat: parseFloat(latitude) || 51.505,
          lng: parseFloat(longitude) || -0.09,
        };
        if (minLat && maxLat && minLng && maxLng){
          res.mapBounds = [[minLat, minLng ], [maxLat, maxLng ]];
        } else {
          res.mapBounds =[[50.505, -29.09], [52.505, 29.09]];
        }

        res.mapZoom = {
          lat: parseFloat(latitude) || 51.505,
          lng: parseFloat(longitude) || -0.09,
        };
        this.props.setMainData(res);
        this.props.updateStatistic();
      })
  }

  logout() {
    return localStorage.setItem('windToken', '')
  }

  render() {
    return (
      <div>
        <h1>Main</h1>
        <button onClick={this.openNotificationSettings}> Settings</button>
        <button onClick={this.changeViewType}> Mode</button>
        <button onClick={this.logout}>logout</button>
        <input type="range" id="start" name="size"
               min="0" max="1000000" onChange={(e) => this.props.changeScaleWind(e.target.value)}/>
        <NotificationSettings open={this.state.isNotificationSettingsOpen} close={this.closeNotificationSettings}/>
        <PointSettings open={this.state.isNotificationSettingsOpen} close={this.closeNotificationSettings}/>
        <SavePointSettings/>
        <Map/>
      </div>
    )
  }
}

function mapStateToProps(state) {
  return {
    places: state.get('places'),
    dangers: state.get('dangers'),
    stations: state.get('stations'),
    stationsData: state.get('stationsData'),
    markerType: state.get('markerType'),
    viewType: state.get('viewType'),
    actionType: state.get('actionType'),
    isSavePointSettingsOpen: state.get('isSavePointSettingsOpen'),
  };
}

export default connect(mapStateToProps, actions)(Main);
