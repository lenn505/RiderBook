import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    ReactNode
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/app/supabase';

interface Ride {
    id: string;
    name: string;
    distance: number;
    duration: string;
    image?: string | null;
    routePoints: { latitude: number; longitude: number }[];
}

interface ThemeColors {
    background: string;
    card: string;
    text: string;
    subtleText: string;
    icon: string;
    tint: string;
}

export const lightColors: ThemeColors = {
    background: '#fff',
    card: '#f3f3f3',
    text: '#111',
    subtleText: '#666',
    icon: '#4A90E2',
    tint: '#007aff',
};

export const darkColors: ThemeColors = {
    background: '#111',
    card: '#1e1e1e',
    text: '#fff',
    subtleText: '#aaa',
    icon: '#81C3FF',
    tint: '#0a84ff',
};

interface AppContextType {
    darkMode: boolean;
    themeColors: ThemeColors;
    toggleDarkMode: () => void;
    rides: Ride[];
    addRide: (ride: Ride) => void;
    loadRides: () => Promise<void>;
    deleteRide: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
    const [rides, setRides] = useState<Ride[]>([]);
    const [darkMode, setDarkMode] = useState(true);
    const [session, setSession] = useState<any>(null);

    const themeColors = darkMode ? darkColors : lightColors;

    useEffect(() => {
        const loadDarkModeSetting = async () => {
            const stored = await AsyncStorage.getItem('darkMode');
            if (stored !== null) {
                setDarkMode(stored === 'true');
            }
        };
        loadDarkModeSetting();

        supabase.auth.getSession().then(({ data }) => {
            setSession(data.session);
        });

        const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });

        return () => {
            listener?.subscription.unsubscribe();
        };
    }, []);

    useEffect(() => {
        if (session) {
            loadRides();
        }
    }, [session]);

    const toggleDarkMode = async () => {
        const newValue = !darkMode;
        setDarkMode(newValue);
        await AsyncStorage.setItem('darkMode', String(newValue));
    };

    const loadRides = async () => {
        if (!session) return;

        const { data: ridesData, error: ridesError } = await supabase
            .from('rides')
            .select('id, name, image_url, duration, distance')
            .eq('user_id', session.user.id)
            .order('created_at', { ascending: false });

        if (ridesError || !ridesData) {
            console.error('Fehler beim Laden der Fahrten:', ridesError);
            return;
        }

        const rideIds = ridesData.map(r => r.id);

        const { data: pointsData, error: pointsError } = await supabase
            .from('route_points')
            .select('ride_id, latitude, longitude, order_index')
            .in('ride_id', rideIds);

        if (pointsError) {
            console.error('Fehler beim Laden der Routepunkte:', pointsError);
            return;
        }

        const routeMap: { [rideId: string]: { latitude: number; longitude: number }[] } = {};
        for (const point of pointsData ?? []) {
            if (!routeMap[point.ride_id]) routeMap[point.ride_id] = [];
            routeMap[point.ride_id].push({
                latitude: point.latitude,
                longitude: point.longitude,
            });
        }

        const completeRides = ridesData.map(ride => ({
            id: ride.id,
            name: ride.name,
            image: ride.image_url,
            duration: ride.duration,
            distance: ride.distance,
            routePoints: routeMap[ride.id] ?? [],
        }));

        setRides(completeRides);
    };

    const addRide = async (ride: Ride) => {
        setRides(prev => [ride, ...prev]);

        await supabase.from('rides').insert({
            id: ride.id,
            name: ride.name,
            user_id: session?.user.id,
            duration: ride.duration,
            distance: ride.distance,
            image_url: ride.image,
        });

        const pointsToInsert = ride.routePoints.map((point, index) => ({
            ride_id: ride.id,
            latitude: point.latitude,
            longitude: point.longitude,
            order_index: index,
        }));

        await supabase.from('route_points').insert(pointsToInsert);
    };

    const deleteRide = async (id: string) => {
        await supabase.from('route_points').delete().eq('ride_id', id);
        await supabase.from('rides').delete().eq('id', id);
        setRides(prev => prev.filter(r => r.id !== id));
    };

    return (
        <AppContext.Provider
            value={{
                rides,
                addRide,
                loadRides,
                deleteRide,
                themeColors,
                toggleDarkMode,
                darkMode,
            }}
        >
            {children}
        </AppContext.Provider>
    );
}

export function useAppContext() {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('AppContext muss innerhalb des Providers verwendet werden!');
    }
    return context;
}