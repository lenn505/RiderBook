import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
} from 'react-native';
import MapView, { Polyline } from 'react-native-maps';
import { useLocalSearchParams, router } from 'expo-router';
import { useAppContext } from '@/app/AppContext';
import { Ionicons } from '@expo/vector-icons';

export default function DetailRide() {
    const { themeColors, rides } = useAppContext();
    const { rideId } = useLocalSearchParams<{ rideId: string }>();

    const ride = rides.find((r) => r.id === rideId);

    if (!ride || !Array.isArray(ride.routePoints) || ride.routePoints.length === 0) {
        return (
            <SafeAreaView style={[styles.safe, { backgroundColor: themeColors.background }]}>
                <View style={styles.container}>
                    <Text style={[styles.noRouteText, { color: themeColors.text }]}>
                        Keine Route verfügbar.
                    </Text>
                </View>
            </SafeAreaView>
        );
    }

    const initialRegion = {
        latitude: ride.routePoints[0]?.latitude ?? 47.3769,
        longitude: ride.routePoints[0]?.longitude ?? 8.5417,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
    };

    return (
        <SafeAreaView style={[styles.safe, { backgroundColor: themeColors.background }]}>
            <View style={styles.container}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.replace('/(tabs)/RiderBook')}>
                    <Ionicons name="chevron-back" size={28} color={themeColors.text} />
                </TouchableOpacity>

                <Text style={[styles.title, { color: themeColors.text }]}>
                    {ride.name}
                </Text>
                <Text style={[styles.details, { color: themeColors.subtleText }]}>
                    ⏱ {ride.duration}   •   📍 {ride.distance.toFixed(2)} km
                </Text>

                <MapView
                    style={styles.map}
                    initialRegion={initialRegion}
                    scrollEnabled={true}
                    zoomEnabled={true}
                    pitchEnabled={false}
                    rotateEnabled={false}
                >
                    <Polyline
                        coordinates={ride.routePoints}
                        strokeColor={themeColors.tint}
                        strokeWidth={4}
                    />
                </MapView>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: {
        flex: 1,
    },
    container: {
        padding: 16,
    },
    backButton: {
        position: 'absolute',
        top: 10,
        left: 10,
        zIndex: 10,
        padding: 6,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: 40,
        marginBottom: 6,
        textAlign: 'center',
    },
    details: {
        fontSize: 16,
        marginBottom: 12,
        textAlign: 'center',
    },
    map: {
        width: '100%',
        height: 280,
        borderRadius: 10,
        overflow: 'hidden',
    },
    noRouteText: {
        fontSize: 16,
        textAlign: 'center',
        marginTop: 32,
    },
});