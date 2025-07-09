import React from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    Image,
    TouchableOpacity,
    SafeAreaView,
} from 'react-native';
import { useAppContext } from '@/app/AppContext';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function RiderBook() {
    const { rides, themeColors, deleteRide } = useAppContext();
    const router = useRouter();

    return (
        <SafeAreaView style={[styles.safe, { backgroundColor: themeColors.background }]}>
            <FlatList
                contentContainerStyle={[
                    styles.list,
                    rides.length === 0 && { flex: 1, justifyContent: 'center' },
                ]}
                data={rides}
                keyExtractor={(item) => item.id}
                ListEmptyComponent={
                    <Text style={[styles.emptyText, { color: themeColors.subtleText }]}>
                        Noch keine Rides bis jetzt.
                    </Text>
                }
                renderItem={({ item }) => (
                    <View style={[styles.card, { backgroundColor: themeColors.card }]}>
                        <TouchableOpacity
                            onPress={() =>
                                router.push({
                                    pathname: '/DetailRide',
                                    params: { rideId: item.id },
                                })
                            }
                        >
                            <View style={styles.row}>
                                <Text style={[styles.text, { color: themeColors.text }]}>
                                    {item.name}
                                </Text>
                                <Text style={[styles.text, { color: themeColors.subtleText }]}>
                                    {item.distance.toFixed(2)} km • {item.duration}
                                </Text>
                            </View>

                            {item.image && (
                                <Image source={{ uri: item.image }} style={styles.image} />
                            )}
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.deleteIcon}
                            onPress={() => deleteRide(item.id)}
                        >
                            <Ionicons name="trash" size={20} color="red" />
                        </TouchableOpacity>
                    </View>
                )}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        paddingTop: 48,
    },
    list: {
        paddingHorizontal: 16,
        paddingBottom: 20,
    },
    card: {
        borderRadius: 12,
        marginBottom: 16,
        padding: 12,
        overflow: 'hidden',
        position: 'relative',
    },
    row: {
        marginBottom: 10,
    },
    text: {
        fontSize: 16,
    },
    image: {
        width: '100%',
        height: 160,
        borderRadius: 8,
        marginTop: 8,
    },
    emptyText: {
        textAlign: 'center',
        fontSize: 16,
    },
    deleteIcon: {
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 4,
        elevation: 2,
    },
});