import React from 'react';
import services from '../../services/index';
import { connect } from 'react-redux';
import actions from '../../actions/index';
import redIcon from '../../assets/point_red-mobile.png';
import { Marker, ProviderPropType } from 'react-native-maps';
import SectorPolygon from "./SectorPolygon";
import WindRose from "./WindRose";

const components = {
  Current: SectorPolygon,
  Historical: WindRose,
};

class Danger extends React.Component {
  constructor(props) {
    super(props);
    this.updatePosition = this.updatePosition.bind(this);
  }

  updatePosition(id, e) {
    let { latitude, longitude } = e.nativeEvent.coordinate;
    let lngCorrect = longitude;
    lngCorrect = lngCorrect % 360;
    if (lngCorrect > 180) {
      lngCorrect -= 360;
    }
    if (lngCorrect < -180) {
      lngCorrect += 360;
    }
    return services.movePoint({
      danger: { lat: latitude, lng: lngCorrect, id, },
      stations: [...this.props.stations]
    })
      .then(res => {
        const dangers = this.props.dangers.filter(el => !(el.id === id));
        dangers.push(res.danger);
        let stationsData = this.props.stationsData;
        const stations = this.props.stations;
        stationsData = { ...stationsData, ...(res.stationsData || {}) };
        stations.push(...Object.keys((res.stationsData || {})));
        this.props.updateReduxState({ dangers, stations, stationsData });
      });
  };

  render() {
    const { viewType, point } = this.props;
    const marker = <Marker
      key={`marker ${point.type} ${point.id}`}
      coordinate={{
        latitude: point.lat,
        longitude: point.lng
      }}
      onDragEnd={(e) => this.updatePosition(point.id, e)}
      onPress={(e) => {
        e.stopPropagation();
        this.props.updateReduxState({ info: { point, type: 'danger' } });
        this.props.navigation.navigate('PointSettings')
      }}
      draggable
      image={redIcon}/>;

    const Component = components[viewType];

    return [].concat(marker, <Component key={'sectorPolygon'} point={point}/>)
  }
}

function mapStateToProps(state) {
  return {
    dangers: state.get('dangers'),
    stations: state.get('stations'),
    stationsData: state.get('stationsData'),
    viewType: state.get('viewType'),
  };
}

export default connect(mapStateToProps, actions)(Danger);
