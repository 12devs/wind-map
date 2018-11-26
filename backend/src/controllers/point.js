import { Point, Account, Danger, Place, Subscription, Notification, Station } from './../models';
import { getStationId, getHistoricalData, getDailyHistoricalData, getCurrenData } from '../api/wind';
import getWindRoseData from '../api/windRoseParses';
import _ from 'lodash';
import BluebirdPromise from 'bluebird';

const getNotificationSettings = async (userId) => {
  const query = {
    where: { account_id: userId },
    include: [
      {
        model: Place,
        as: "place",
      },
      {
        model: Danger,
        as: "danger",
      }
    ],
  };
  let subscriptions = await Subscription.findAll(query);
  subscriptions = JSON.parse(JSON.stringify(subscriptions));
  let temp = subscriptions.reduce((acc, curent) => {
    const { place_id, danger_id, danger, place } = curent;
    if (acc[place_id]) {
      acc[place_id].danger.push({
        value: danger_id,
        label: danger.name,
      })
    } else {
      acc[place_id] = {
        place: {
          value: place_id,
          label: place.name,
        },
        danger: [{
          value: danger_id,
          label: danger.name,
        }]
      }
    }
    return acc
  }, {});
  const notificationSettings = [];
  for (let key in temp) {
    notificationSettings.push(temp[key])
  }
  return notificationSettings;
};

const getStationsData = async (stations) => {
  const promises = stations.map(elem => {
    return getCurrenData(elem.station_id)
      .then(result => {
        return {
          current: {
            dir: result.direction,
            speed: result.speed,
          },
          history: {},
          period: 0,
        }
      })
  });
  const promisesHistorical = stations.map(elem => getWindRoseData(elem.lat, elem.lng));
  const stsData = await Promise.all(promises);
  const historicalData = await Promise.all(promisesHistorical);

  return stsData.reduce((acc, elem, i) => {
    elem = Object.assign(elem, historicalData[i]);
    acc[stations[i].station_id] = elem;
    return acc;
  }, {});
};

const getPlacesDangersStationsDataStations = async (userId) => {
  return Promise.all([Place.findAll({ where: { account_id: userId } }), Danger.findAll({ where: { account_id: userId } })])
    .then(async result => {
      const places = result[0];
      const dangers = result[1];
      const stations = _.uniqBy([...places, ...dangers], (elem => elem.station_id)).map(elem => {
        return {
          station_id: elem.station_id,
          lat: elem.lat,
          lng: elem.lng,
        }
      });
      const stationsData = await getStationsData(stations);
      return { places, dangers, stationsData, stations }
    });
};

export default {

  async save(req, res) {
    try {
      const { user } = req;
      const { danger, stations, place } = req.body;
      if (danger) {
        const { lat, lng } = danger;
        danger.account_id = user.id;
        danger.station_id = await getStationId({ lat, lng });
        const savedDanger = await Danger.create(danger);
        let stationsData;
        if (!stations || stations.indexOf(savedDanger.station_id) === -1) {
          stationsData = await getStationsData([{
            station_id: savedDanger.station_id,
            lat: savedDanger.lat,
            lng: savedDanger.lng,
          }]);
        }
        res.status(200).json({ danger: savedDanger, stationsData });
      } else {
        const { lat, lng } = place;
        place.account_id = user.id;
        place.station_id = await getStationId({ lat, lng });
        const savedPlace = await Place.create(place);
        let stationsData;
        if (!stations || stations.indexOf(savedPlace.station_id) === -1) {
          stationsData = await getStationsData([{
            station_id: savedPlace.station_id,
            lat: savedPlace.lat,
            lng: savedPlace.lng,
          }]);
        }
        res.status(200).json({ place: savedPlace, stationsData });
      }
    } catch (err) {
      console.log(err);
      return res.status(500).json({ error: err.message });
    }
  },

  async withData(req, res) {
    try {
      const { places, dangers, stations, stationsData, notificationSettings, notifications } = await Promise.all([
        getPlacesDangersStationsDataStations(req.user.id),
        Notification.findAll({ where: { account_id: req.user.id } }),
        getNotificationSettings(req.user.id)
      ])
        .then(result => {
          const { places, dangers, stationsData, stations } = result[0];
          const notifications = result[1];
          const notificationSettings = result[2];
          return { places, dangers, stations, stationsData, notificationSettings, notifications }
        });

      res.status(200).json({ places, dangers, stations, stationsData, notificationSettings, notifications })
    } catch (err) {
      console.log(err);
      return res.status(500).json({ error: err.message })
    }
  },

  async deletePoint(req, res) {
    try {
      const { danger, place } = req.body;
      if (danger) {
        await Danger.destroy({ where: { id: danger.id } });
        await Subscription.destroy({ where: { danger_id: danger.id } });
        res.status(200).json({ message: danger.id + ' successful deleted' })
      } else {
        await Place.destroy({ where: { id: place.id } });
        await Subscription.destroy({ where: { place_id: place.id } });
        res.status(200).json({ message: place.id + ' successful deleted' })
      }
    } catch (err) {
      return res.status(500).json({ error: err.message })
    }
  },

  async deleteAllPoints(req, res) {
    try {
      const userId = req.user.id;
      await Subscription.destroy({ where: { account_id: userId } });
      await Danger.destroy({ where: { account_id: userId } });
      await Place.destroy({ where: { account_id: userId } });

      res.status(200).json({ message: 'All points were successful deleted' })
    } catch (err) {
      return res.status(500).json({ error: err.message })
    }
  },

  async update(req, res) {
    try {
      const { danger, place } = req.body;
      if (place) {
        await Place.update({ name: place.name }, { where: { id: place.id } });
      }
      if (danger) {
        await Danger.update({ name: danger.name, dangerRadius: danger.dangerRadius }, { where: { id: danger.id } });
      }
      res.status(200).json({ message: 'Successful updated' })
    } catch (err) {
      return res.status(500).json({ error: err.message })
    }
  },

  async movePoint(req, res) {
    try {
      const { danger, stations, place } = req.body;
      if (danger) {
        const { lat, lng } = danger;
        danger.station_id = await getStationId({ lat, lng });
        const savedDanger = (await Danger.update(danger, {
          where: { id: danger.id },
          returning: true,
          plain: true
        }))[1];
        let stationsData;
        if (!stations || stations.indexOf(savedDanger.station_id) === -1) {
          stationsData = await getStationsData([{
            station_id: savedDanger.station_id,
            lat: savedDanger.lat,
            lng: savedDanger.lng
          }])
        }
        res.status(200).json({ danger: savedDanger, stationsData })
      } else {
        const { lat, lng } = place;
        place.station_id = await getStationId({ lat, lng });
        const savedPlace = (await Place.update(place, { where: { id: place.id }, returning: true, plain: true }))[1];
        let stationsData;
        if (!stations || stations.indexOf(savedPlace.station_id) === -1) {
          stationsData = await getStationsData([{
            station_id: savedPlace.station_id,
            lat: savedPlace.lat,
            lng: savedPlace.lng
          }]);
        }
        res.status(200).json({ place: savedPlace, stationsData })
      }
    } catch (err) {
      console.log(err);
      return res.status(500).json({ error: err.message })
    }
  }
}
