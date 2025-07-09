import React, { useEffect, useState } from 'react';
import {
    SafeAreaView,
    StyleSheet,
    View,
    Switch,
    Text,
    TouchableOpacity,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppContext } from '@/app/AppContext';
import { supabase } from '@/app/supabase';
import { router } from 'expo-router';

export default function AccountPage() {
    const { darkMode, themeColors, toggleDarkMode, rides } = useAppContext();
    const [displayName, setDisplayName] = useState<string | null>(null);

    const totalTrips = rides.length;
    const totalDistance = rides.reduce((sum, ride) => sum + ride.distance, 0).toFixed(1);
    const totalMinutes = rides.reduce((sum, ride) => {
        const [h, m] = ride.duration.split(':').map(Number);
        return sum + h * 60 + m;
    }, 0);
    const totalDuration = `${Math.floor(totalMinutes / 60)
        .toString()
        .padStart(2, '0')}:${(totalMinutes % 60).toString().padStart(2, '0')}`;

    useEffect(() => {
        const fetchUser = async () => {
            const { data: { user }, error } = await supabase.auth.getUser();
            if (error) {
                console.log('Fehler beim Laden des Nutzers:', error.message);
            } else {
                setDisplayName(user?.user_metadata?.display_name || null);
            }
        };
        fetchUser();
    }, []);

    const handleLogout = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            Alert.alert('Fehler beim Logout', error.message);
        } else {
            router.replace('/(auth)/login');
        }
    };

    return (
        <SafeAreaView style={[styles.safe, { backgroundColor: themeColors.background }]}>
            <View style={styles.container}>

                {/* Profil Icon */}
                <View style={styles.iconContainer}>
                    <View style={[styles.iconCircle, { backgroundColor: themeColors.card }]}>
                        <Ionicons name="person-circle-outline" size={100} color={themeColors.icon} />
                    </View>
                    {displayName && (
                        <Text style={[styles.helloText, { color: themeColors.text }]}>
                            Hallo {displayName}
                        </Text>
                    )}
                </View>

                {/* Dark Mode */}
                <View style={styles.toggleRow}>
                    <Text style={[styles.label, { color: themeColors.text }]}>
                        Dark Mode ist {darkMode ? 'aktiviert' : 'deaktiviert'}
                    </Text>
                    <Switch
                        value={darkMode}
                        onValueChange={toggleDarkMode}
                        trackColor={{ false: '#767577', true: '#81b0ff' }}
                        thumbColor="#f4f3f4"
                        ios_backgroundColor="#3e3e3e"
                    />
                </View>

                {/* Statistik */}
                <View style={[styles.statsBox, { backgroundColor: themeColors.card }]}>
                    <View style={styles.statsRow}>
                        <View style={styles.statColumn}>
                            <Text style={[styles.statValue, { color: themeColors.text }]}>{totalTrips}</Text>
                            <Text style={[styles.statLabel, { color: themeColors.subtleText }]}>Trips</Text>
                        </View>

                        <View style={styles.statDivider} />

                        <View style={styles.statColumn}>
                            <Text style={[styles.statValue, { color: themeColors.text }]}>{totalDistance} km</Text>
                            <Text style={[styles.statLabel, { color: themeColors.subtleText }]}>Distanz</Text>
                        </View>

                        <View style={styles.statDivider} />

                        <View style={styles.statColumn}>
                            <Text style={[styles.statValue, { color: themeColors.text }]}>{totalDuration}</Text>
                            <Text style={[styles.statLabel, { color: themeColors.subtleText }]}>Dauer</Text>
                        </View>
                    </View>
                </View>

                {/* Logout */}
                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <Ionicons name="log-out-outline" size={20} color={themeColors.icon} />
                    <Text style={[styles.logoutText, { color: themeColors.text }]}>Logout</Text>
                </TouchableOpacity>
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
        paddingHorizontal: 24,
        paddingTop: 48,
        alignItems: 'center',
    },
    iconContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    iconCircle: {
        borderRadius: 100,
        padding: 8,
        elevation: 4,
    },
    helloText: {
        marginTop: 8,
        fontSize: 18,
        fontWeight: '500',
    },
    toggleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        maxWidth: 300,
        marginVertical: 16,
    },
    label: {
        fontSize: 16,
        fontWeight: '500',
    },
    statsBox: {
        width: '100%',
        maxWidth: 360,
        borderRadius: 14,
        paddingVertical: 20,
        paddingHorizontal: 10,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 6,
        elevation: 2,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
    },
    statColumn: {
        flex: 1,
        alignItems: 'center',
    },
    statValue: {
        fontSize: 22,
        fontWeight: 'bold',
    },
    statLabel: {
        fontSize: 14,
        marginTop: 4,
    },
    statDivider: {
        width: 1,
        backgroundColor: '#8884',
        marginHorizontal: 8,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 32,
        padding: 10,
        borderRadius: 8,
    },
    logoutText: {
        fontSize: 16,
        marginLeft: 8,
    },
});