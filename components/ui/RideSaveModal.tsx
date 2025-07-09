import React, { useState } from 'react';
import {
    View,
    Text,
    Modal,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useAppContext } from '@/app/AppContext';
import { useRouter } from 'expo-router';
import uuid from 'react-native-uuid';
import { supabase } from '@/app/supabase';
import Animated from 'react-native-reanimated';

interface RideData {
    routePoints: { latitude: number; longitude: number }[];
    duration: number;
    distance: number;
}

interface Props {
    visible: boolean;
    onClose: () => void;
    rideData: RideData;
}

export default function RideSaveModal({ visible, onClose, rideData }: Props) {
    const { themeColors, addRide } = useAppContext();
    const [rideName, setRideName] = useState('');
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [scale, setScale] = useState(1);
    const [translateX, setTranslateX] = useState(0);
    const [translateY, setTranslateY] = useState(0);
    const router = useRouter();

    const handlePickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.5,
        });
        if (!result.canceled) {
            setImageUrl(result.assets[0].uri);
        }
    };

    const handleTakePhoto = async () => {
        const result = await ImagePicker.launchCameraAsync({
            quality: 0.5,
        });
        if (!result.canceled) {
            setImageUrl(result.assets[0].uri);
        }
    };

    const handleSave = async () => {
        if (!rideName.trim()) return;

        const id = uuid.v4() as string;
        const formattedDuration = formatTime(rideData.duration);

        const imageTransform = {
            scale,
            translateX,
            translateY,
        };

        const newRide = {
            id,
            name: rideName,
            image: imageUrl,
            duration: formattedDuration,
            distance: rideData.distance,
            routePoints: rideData.routePoints,
            imageTransform,
        };

        addRide(newRide);

        const { data: userData } = await supabase.auth.getUser();
        const userId = userData?.user?.id;
        if (!userId) return;

        await supabase.from('rides').insert({
            id,
            name: rideName,
            image_url: imageUrl,
            duration: formattedDuration,
            distance: rideData.distance,
            user_id: userId,
            image_transform: imageTransform,
        });

        const pointsToInsert = rideData.routePoints.map((point, index) => ({
            ride_id: id,
            latitude: point.latitude,
            longitude: point.longitude,
            order_index: index,
        }));

        await supabase.from('route_points').insert(pointsToInsert);

        setRideName('');
        setImageUrl(null);
        onClose();
        router.push('/(tabs)/RiderBook');
    };

    const formatTime = (sec: number) => {
        const mins = Math.floor(sec / 60);
        const secs = sec % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <Modal visible={visible} transparent animationType="slide">
            <View style={styles.overlay}>
                <View style={[styles.modalContainer, { backgroundColor: themeColors.card }]}>
                    <Text style={[styles.title, { color: themeColors.text }]}>Fahrt speichern</Text>

                    <View style={styles.imageRow}>
                        <TouchableOpacity onPress={handlePickImage}>
                            <Ionicons name="images-outline" size={28} color={themeColors.icon} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handleTakePhoto}>
                            <Ionicons name="camera-outline" size={28} color={themeColors.icon} />
                        </TouchableOpacity>
                    </View>

                    {imageUrl && (
                        <Animated.View
                            style={[
                                styles.previewContainer,
                                {
                                    transform: [
                                        { scale: scale },
                                        { translateX: translateX },
                                        { translateY: translateY },
                                    ],
                                },
                            ]}
                        >
                            <Image source={{ uri: imageUrl }} style={styles.imagePreview} />
                            <TouchableOpacity style={styles.removeButton} onPress={() => setImageUrl(null)}>
                                <Ionicons name="close-circle" size={22} color="red" />
                            </TouchableOpacity>
                        </Animated.View>
                    )}

                    <TextInput
                        placeholder="Name der Fahrt"
                        placeholderTextColor={themeColors.subtleText}
                        style={[styles.input, { color: themeColors.text, borderColor: themeColors.subtleText }]}
                        value={rideName}
                        onChangeText={setRideName}
                    />

                    <TouchableOpacity style={[styles.saveButton, { backgroundColor: themeColors.icon }]} onPress={handleSave}>
                        <Text style={{ color: '#fff' }}>Speichern</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={onClose} style={styles.cancel}>
                        <Text style={{ color: themeColors.subtleText }}>Abbrechen</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: '#0006',
        paddingHorizontal: 20,
    },
    modalContainer: {
        padding: 20,
        borderRadius: 12,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
        textAlign: 'center',
    },
    input: {
        borderWidth: 1,
        borderRadius: 8,
        padding: 12,
        marginBottom: 16,
    },
    saveButton: {
        alignItems: 'center',
        padding: 12,
        borderRadius: 8,
    },
    cancel: {
        marginTop: 12,
        alignItems: 'center',
    },
    imageRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 16,
    },
    previewContainer: {
        position: 'relative',
        marginBottom: 16,
    },
    imagePreview: {
        width: '100%',
        height: 150,
        borderRadius: 8,
    },
    removeButton: {
        position: 'absolute',
        top: 6,
        right: 6,
        backgroundColor: '#fff',
        borderRadius: 10,
    },
});
