import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import TabBarBackground from '@/components/ui/TabBarBackground';
import { useAppContext } from '@/app/AppContext';

export default function TabLayout() {
    const { themeColors } = useAppContext();

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarBackground: TabBarBackground,
                tabBarActiveTintColor: themeColors.icon,
                tabBarInactiveTintColor: themeColors.subtleText,
                tabBarStyle: {

                    backgroundColor: themeColors.card,
                    borderTopColor: themeColors.subtleText,
                    borderTopWidth: 0.5,
                    ...Platform.select({
                        ios: {
                            position: 'absolute',
                        },
                    }),
                },
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Recording',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="radio-button-on" size={size} color={color} />
                    ),
                }}
            />

            <Tabs.Screen
                name="RiderBook"
                options={{
                    title: 'RiderBook',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="book" size={size} color={color} />
                    ),
                }}
            />

            <Tabs.Screen
                name="AccountPage"
                options={{
                    title: 'Account',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="person-circle" size={size} color={color} />
                    ),
                }}
            />
        </Tabs>
    );
}
