import React from 'react';
import { Marker } from 'react-leaflet';
import services from '../../../services/index';
import { connect } from 'react-redux';
import actions from '../../../actions';
import { redIcon } from '../../icons/index';
import SectorPolygon from '../SectorPolygon';
import WindRose from '../WindRose';

class Danger extends React.Component {
  constructor(props) {
    super(props);
    this.updatePosition = this.updatePosition.bind(this);
  }

  updatePosition(id, e) {
    let { lat, lng } = e.target._latlng;
    let lngCorrect = lng;
    lngCorrect = lngCorrect % 360;
    if (lngCorrect > 180) {
      lngCorrect -= 360;
    }
    if (lngCorrect < -180) {
      lngCorrect += 360;
    }
    return services.movePoint({
      danger: { lat, lng: lngCorrect, id, },
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
        this.props.updateStatistic();
      });
  };

  render() {
    const { viewType } = this.props;
    return (
      <div><Marker
        draggable={true}
        onDragend={(e) => {
          this.updatePosition(this.props.point.id, e);
        }}
        onClick={() => {
          this.props.updateReduxState({info:{ point: this.props.point, type: 'danger' }});
        }}
        position={[this.props.point.lat, this.props.point.lng]}
        icon={redIcon}>
      </Marker>
        {(() => {
          if (viewType === "Current") {
            return <SectorPolygon point={this.props.point}/>
          } else {
            return <WindRose point={this.props.point}/>
          }
        })()}
      </div>);
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
