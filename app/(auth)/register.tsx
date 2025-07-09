import { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet, Alert } from 'react-native';
import { supabase } from '@/app/supabase';
import { router } from 'expo-router';
import { useAppContext } from '@/app/AppContext';

export default function Register() {
    const { themeColors } = useAppContext();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const isValidEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleRegister = async () => {
        if (!isValidEmail(email)) {
            Alert.alert('Ungültige E-Mail-Adresse', 'Bitte gib eine gültige E-Mail-Adresse ein.');
            return;
        }

        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { display_name: name },
            },
        });

        if (error) {
            if (
                error.message.toLowerCase().includes('user already registered') ||
                error.message.toLowerCase().includes('email already registered')
            ) {
                Alert.alert('E-Mail bereits verwendet', 'Diese E-Mail-Adresse ist schon registriert.');
            } else {
                Alert.alert('Registrierung fehlgeschlagen', error.message);
            }
        } else {
            Alert.alert('Registrierung erfolgreich', 'Bitte bestätige deine E-Mail.');
            router.replace('/(auth)/login');
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: themeColors.background }]}>
            <Text style={[styles.title, { color: themeColors.text }]}>Registrieren</Text>

            <TextInput
                placeholder="Name"
                placeholderTextColor={themeColors.subtleText}
                style={[styles.input, { color: themeColors.text, borderBottomColor: themeColors.subtleText }]}
                value={name}
                onChangeText={setName}
            />

            <TextInput
                placeholder="E-Mail"
                placeholderTextColor={themeColors.subtleText}
                style={[styles.input, { color: themeColors.text, borderBottomColor: themeColors.subtleText }]}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
            />

            <TextInput
                placeholder="Passwort"
                placeholderTextColor={themeColors.subtleText}
                style={[styles.input, { color: themeColors.text, borderBottomColor: themeColors.subtleText }]}
                secureTextEntry
                value={password}
                onChangeText={setPassword}
            />

            <Button title="Registrieren" onPress={handleRegister} />

            <Text
                style={[styles.link, { color: themeColors.icon }]}
                onPress={() => router.push('/(auth)/login')}
            >
                Bereits registriert? Jetzt einloggen
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, justifyContent: 'center' },
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
