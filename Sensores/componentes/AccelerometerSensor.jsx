import { useEffect, useState, useRef } from "react";
import { View, Text, StyleSheet, Animated, Dimensions } from "react-native";
import { Accelerometer } from "expo-sensors";

const SHAKE_THRESHOLD = 1.8; // ajusta la sensibilidad aquí
const COOLDOWN_MS = 1000;    // tiempo mínimo entre hormigas
const MAX_HORMIGAS = 25;     // límite para no saturar el rendimiento

const { width, height } = Dimensions.get("window");

export default function AccelemeterSensor() {
    const [datos, setDatos] = useState({ x: 0, y: 0, z: 0 });
    const [hormigas, setHormigas] = useState([]);
    const lastShakeRef = useRef(0);

    useEffect(() => {
        const subscribir = Accelerometer.addListener((measurements) => {
            setDatos(measurements);

            const { x, y, z } = measurements;
            const magnitud = Math.sqrt(x * x + y * y + z * z);

            const ahora = Date.now();
            if (magnitud > SHAKE_THRESHOLD && ahora - lastShakeRef.current > COOLDOWN_MS) {
                lastShakeRef.current = ahora;
                agregarHormiga();
            }
        });

        Accelerometer.setUpdateInterval(100);

        return () => {
            subscribir.remove();
        };
    }, []);

    const agregarHormiga = () => {
        const id = Date.now().toString();
        const left = Math.random() * (width - 60) + 10;
        const top = Math.random() * (height - 300) + 250;

        setHormigas((prev) => {
            const nuevas = [...prev, { id, left, top }];
            return nuevas.length > MAX_HORMIGAS ? nuevas.slice(-MAX_HORMIGAS) : nuevas;
        });
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Acelerómetro</Text>

            <View style={styles.card}>
                <Text style={styles.axis}>X</Text>
                <Text style={styles.value}>{datos.x.toFixed(2)}</Text>
            </View>
            <View style={styles.card}>
                <Text style={styles.axis}>Y</Text>
                <Text style={styles.value}>{datos.y.toFixed(2)}</Text>
            </View>
            <View style={styles.card}>
                <Text style={styles.axis}>Z</Text>
                <Text style={styles.value}>{datos.z.toFixed(2)}</Text>
            </View>

            <Text style={styles.hint}>¡Sacude el teléfono! ({hormigas.length} hormigas)</Text>

            {hormigas.map((h) => (
                <Hormiga key={h.id} left={h.left} top={h.top} />
            ))}
        </View>
    );
}

function Hormiga({ left, top }) {
    const scale = useRef(new Animated.Value(0)).current;
    const posX = useRef(new Animated.Value(0)).current;
    const posY = useRef(new Animated.Value(0)).current;

    // animación de aparición (pop)
    useEffect(() => {
        Animated.spring(scale, {
            toValue: 1,
            friction: 3,
            tension: 100,
            useNativeDriver: true,
        }).start();
    }, []);

    // movimiento aleatorio constante, como si caminara
    useEffect(() => {
        let activo = true;

        const caminar = () => {
            if (!activo) return;

            const nuevoX = (Math.random() - 0.5) * 40; // se mueve +-20px
            const nuevoY = (Math.random() - 0.5) * 40;

            Animated.parallel([
                Animated.timing(posX, {
                    toValue: nuevoX,
                    duration: 800 + Math.random() * 700,
                    useNativeDriver: true,
                }),
                Animated.timing(posY, {
                    toValue: nuevoY,
                    duration: 800 + Math.random() * 700,
                    useNativeDriver: true,
                }),
            ]).start(() => caminar());
        };

        caminar();

        return () => {
            activo = false;
        };
    }, []);

    return (
        <Animated.Text
            style={[
                styles.hormiga,
                {
                    left,
                    top,
                    transform: [
                        { scale },
                        { translateX: posX },
                        { translateY: posY },
                    ],
                },
            ]}
        >
            🐜
        </Animated.Text>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        padding: 25,
        backgroundColor: "#fff",
    },
    title: {
        fontSize: 35,
        textAlign: "center",
        marginBottom: 35,
        color: "#3a4a5a",
    },
    card: {
        backgroundColor: "#fff",
        padding: 20,
        marginBottom: 20,
        flexDirection: "row",
        justifyContent: "space-between",
    },
    axis: {
        fontSize: 24,
        fontWeight: "bold",
    },
    value: {
        fontSize: 24,
        fontWeight: "bold",
    },
    hint: {
        textAlign: "center",
        color: "#999",
        marginTop: 10,
    },
    hormiga: {
        position: "absolute",
        fontSize: 40,
    },
});