import { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet, Alert } from 'react-native';
import { supabase } from '@/app/supabase';
import { router } from 'expo-router';
import { useAppContext } from '@/app/AppContext';

export default function Login() {
    const { themeColors, loadRides } = useAppContext();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async () => {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
            Alert.alert('Fehler beim Login', error.message);
        } else {
            await loadRides();
            router.replace('/(tabs)');
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: themeColors.background }]}>
            <Text style={[styles.title, { color: themeColors.text }]}>Login</Text>

            <TextInput
                placeholder="E-Mail"
                placeholderTextColor={themeColors.subtleText}
                style={[styles.input, { color: themeColors.text, borderBottomColor: themeColors.subtleText }]}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
            />

            <TextInput
                placeholder="Passwort"
                placeholderTextColor={themeColors.subtleText}
                style={[styles.input, { color: themeColors.text, borderBottomColor: themeColors.subtleText }]}
                secureTextEntry
                value={password}
                onChangeText={setPassword}
            />

            <Button title="Login" onPress={handleLogin} color={themeColors.icon} />

            <Text
                style={[styles.link, { color: themeColors.tint }]}
                onPress={() => router.push('/(auth)/register')}
            >
                Noch kein Konto? Jetzt registrieren
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        justifyContent: 'center',
    },
    input: {
        borderBottomWidth: 1,
        marginBottom: 16,
        fontSize: 16,
    },
    title: {
        fontSize: 24,
        marginBottom: 24,
        textAlign: 'center',
    },
    link: {
        marginTop: 20,
        textAlign: 'center',
    },
});
