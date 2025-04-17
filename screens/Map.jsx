import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';

const Map = () => {
  const [routeCoordinates, setRouteCoordinates] = useState([]);

  // Tọa độ Lăng Chủ tịch Hồ Chí Minh
  const startCoordinates = { latitude: 21.0367, longitude: 105.8347 };
  // Tọa độ Nhà thờ Lớn Hà Nội
  const endCoordinates = { latitude: 21.0257, longitude: 105.8515 };

  useEffect(() => {
    const getRoute = async () => {
      try {
        // Cập nhật URL với tọa độ Lăng Chủ tịch Hồ Chí Minh và Nhà thờ Lớn Hà Nội
        const response = await fetch(
          `http://router.project-osrm.org/route/v1/driving/105.8347,21.0367;105.8515,21.0257?overview=full&geometries=polyline`
        );
        const data = await response.json();
        if (data.routes && data.routes.length > 0) {
          const polyline = decodePolyline(data.routes[0].geometry);
          setRouteCoordinates(polyline);
        } else {
          console.warn("No routes found in API response");
        }
      } catch (error) {
        console.error("Error fetching route:", error);
      }
    };

    getRoute();
  }, []);

  const decodePolyline = (encoded) => {
    let index = 0, len = encoded.length, lat = 0, lng = 0, array = [];
    while (index < len) {
      let b, shift = 0, result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      let dlat = result & 1 ? ~(result >> 1) : result >> 1;
      lat += dlat;
      shift = 0;
      result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      let dlng = result & 1 ? ~(result >> 1) : result >> 1;
      lng += dlng;
      array.push({ latitude: lat / 1E5, longitude: lng / 1E5 });
    }
    return array;
  };

  return (
    <View style={{ flex: 1 }}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: 21.0312, // Điểm trung tâm giữa Lăng Chủ tịch và Nhà thờ Lớn
          longitude: 105.8431,
          latitudeDelta: 0.05, // Hiển thị khu vực trung tâm Hà Nội
          longitudeDelta: 0.05,
        }}
      >
        <Marker coordinate={startCoordinates} title="Lăng Chủ tịch Hồ Chí Minh" />
        <Marker coordinate={endCoordinates} title="Nhà thờ Lớn Hà Nội" />
        {routeCoordinates.length > 0 && (
          <Polyline
            coordinates={routeCoordinates}
            strokeColor="blue"
            strokeWidth={3}
          />
        )}
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  map: {
    flex: 1,
  },
});

export default Map;