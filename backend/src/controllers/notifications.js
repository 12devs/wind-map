import { Point, Account } from './../models';
import { getStationId, getHistoricalData } from '../api/wind';
import _ from 'lodash';

export default {

  async save(req, res) {
    try {
      const { user } = req;
      const { notifications } = req.body;

      point.station_id = await getStationId({ lat, lng });
      const savedPoint = await Point.create(point);
      let stationsData;
      if (!stations || stations.indexOf(savedPoint.station_id) === -1) {
        stationsData = {
          [savedPoint.station_id]: await getHistoricalData(savedPoint.station_id)
        }
      }
      res.status(200).json({ point: savedPoint, stationsData })
    } catch (err) {
      return res.status(500).json({ error: err.message })
    }
  },


}
