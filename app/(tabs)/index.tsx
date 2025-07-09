import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
    Platform,
} from 'react-native';
import MapView, { Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { useAppContext } from '@/app/AppContext';
import RideSaveModal from '@/components/ui/RideSaveModal';

export default function Index() {
    const { themeColors } = useAppContext();

    const [location, setLocation] = useState<Location.LocationObject | null>(null);
    const [routePoints, setRoutePoints] = useState<{ latitude: number, longitude: number }[]>([]);
    const [tracking, setTracking] = useState(false);
    const [paused, setPaused] = useState(false);
    const [startTime, setStartTime] = useState<number | null>(null);
    const [duration, setDuration] = useState(0);
    const [distance, setDistance] = useState(0);
    const [modalVisible, setModalVisible] = useState(false);

    const timerRef = useRef<number | null>(null);
    const watchRef = useRef<Location.LocationSubscription | null>(null);

    useEffect(() => {
        const loadInitialLocation = async () => {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                console.warn('Standortberechtigung nicht erteilt');
                return;
            }

            const current = await Location.getCurrentPositionAsync({});
            setLocation(current);
        };

        loadInitialLocation();
    }, []);

    const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
        const R = 6371e3;
        const lat1Rad = lat1 * Math.PI / 180;
        const lat2Rad = lat2 * Math.PI / 180;
        const deltaLat = (lat2 - lat1) * Math.PI / 180;
        const deltaLon = (lon2 - lon1) * Math.PI / 180;

        const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
            Math.cos(lat1Rad) * Math.cos(lat2Rad) *
            Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c / 1000;
    };

    const startTracking = async () => {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') return;

        const current = await Location.getCurrentPositionAsync({});
        setLocation(current);
        setRoutePoints([{ latitude: current.coords.latitude, longitude: current.coords.longitude }]);
        setStartTime(Date.now());
        setTracking(true);
        setPaused(false);
        setDuration(0);
        setDistance(0);

        timerRef.current = setInterval(() => {
            setDuration((prev) => prev + 1);
        }, 1000);

        watchRef.current = await Location.watchPositionAsync(
            {
                accuracy: Location.Accuracy.High,
                timeInterval: 2000,
                distanceInterval: 3,
            },
            (loc) => {
                setLocation(loc);
                const newPoint = {
                    latitude: loc.coords.latitude,
                    longitude: loc.coords.longitude,
                };
                setRoutePoints((prev) => {
                    if (prev.length > 0) {
                        const last = prev[prev.length - 1];
                        const dist = getDistance(last.latitude, last.longitude, newPoint.latitude, newPoint.longitude);
                        setDistance(d => d + dist);
                    }
                    return [...prev, newPoint];
                });
            }
        );
    };

    const pauseTracking = () => {
        if (timerRef.current) clearInterval(timerRef.current);
        watchRef.current?.remove();
        setPaused(true);
    };

    const resumeTracking = async () => {
        setPaused(false);
        timerRef.current = setInterval(() => {
            setDuration((prev) => prev + 1);
        }, 1000);

        watchRef.current = await Location.watchPositionAsync(
            {
                accuracy: Location.Accuracy.High,
                timeInterval: 2000,
                distanceInterval: 3,
            },
            (loc) => {
                const newPoint = {
                    latitude: loc.coords.latitude,
                    longitude: loc.coords.longitude,
                };
                setRoutePoints((prev) => {
                    if (prev.length > 0) {
                        const last = prev[prev.length - 1];
                        const dist = getDistance(last.latitude, last.longitude, newPoint.latitude, newPoint.longitude);
                        setDistance(d => d + dist);
                    }
                    return [...prev, newPoint];
                });
            }
        );
    };

    const stopTracking = () => {
        if (timerRef.current) clearInterval(timerRef.current);
        watchRef.current?.remove();
        setTracking(false);
        setPaused(false);
        setModalVisible(true);
    };

    const formatTime = (totalSec: number) => {
        const hrs = Math.floor(totalSec / 3600);
        const mins = Math.floor((totalSec % 3600) / 60);
        const secs = totalSec % 60;
        return `${hrs.toString().padStart(2, '0')}:${mins
            .toString()
            .padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const region = location
        ? {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
        }
        : {
            latitude: 47.3769,
            longitude: 8.5417,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
        };

    return (
        <SafeAreaView style={[styles.safe, { backgroundColor: themeColors.background }]}>
            <View style={styles.container}>
                <View style={[styles.statsBox, { backgroundColor: themeColors.card }]}>
                    <View style={styles.statItem}>
                        <Text style={[styles.statLabel, { color: themeColors.subtleText }]}>📍 Distanz</Text>
                        <Text style={[styles.statValue, { color: themeColors.text }]}>{distance.toFixed(2)} km</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={[styles.statLabel, { color: themeColors.subtleText }]}>⏱ Dauer</Text>
                        <Text style={[styles.statValue, { color: themeColors.text }]}>{formatTime(duration)}</Text>
                    </View>
                </View>

                <MapView style={styles.map} region={region} showsUserLocation={true}>
                    <Polyline coordinates={routePoints} strokeWidth={4} strokeColor={themeColors.tint} />
                </MapView>

                <View style={styles.buttonRow}>
                    {!tracking ? (
                        <TouchableOpacity style={[styles.iconButton, { backgroundColor: themeColors.card }]} onPress={startTracking}>
                            <Ionicons name="play" size={34} color={themeColors.icon} />
                        </TouchableOpacity>
                    ) : paused ? (
                        <TouchableOpacity style={[styles.iconButton, { backgroundColor: themeColors.card }]} onPress={resumeTracking}>
                            <Ionicons name="play" size={34} color={themeColors.icon} />
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity style={[styles.iconButton, { backgroundColor: themeColors.card }]} onPress={pauseTracking}>
                            <Ionicons name="pause" size={34} color={themeColors.icon} />
                        </TouchableOpacity>
                    )}

                    {tracking && (
                        <TouchableOpacity style={[styles.iconButton, { backgroundColor: themeColors.card }]} onPress={stopTracking}>
                            <Ionicons name="stop" size={34} color={themeColors.icon} />
                        </TouchableOpacity>
                    )}
                </View>

                <RideSaveModal
                    visible={modalVisible}
                    onClose={() => setModalVisible(false)}
                    rideData={{
                        routePoints,
                        duration,
                        distance,
                    }}
                />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: {
        flex: 1,
    },
    container: {
        flex: 1,
    },
    map: {
        flex: 1,
    },
    statsBox: {
        position: 'absolute',
        top: 12,
        alignSelf: 'center',
        zIndex: 10,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
        flexDirection: 'row',
        gap: 24,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 2,
    },
    statItem: {
        alignItems: 'center',
    },
    statLabel: {
        fontSize: 14,
        marginBottom: 4,
    },
    statValue: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    buttonRow: {
        position: 'absolute',
        bottom: 80,
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'space-around',
        paddingHorizontal: 32,
    },
    iconButton: {
        padding: 16,
        borderRadius: 50,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOpacity: 0.1,
                shadowOffset: { width: 0, height: 4 },
                shadowRadius: 6,
            },
            android: {
                elevation: 5,
            },
        }),
    },
});