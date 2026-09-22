import { useEffect, useState, useRef } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import { Magnetometer } from "expo-sensors";

const TOLERANCIA_NORTE = 10; // grados de margen para considerar "apuntando al norte"

export default function MagnetometerSensor() {
    const [datos, setDatos] = useState({ x: 0, y: 0, z: 0 });
    const [heading, setHeading] = useState(0);
    const [apuntandoNorte, setApuntandoNorte] = useState(false);

    const rotacion = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const subscribir = Magnetometer.addListener((measurements) => {
            setDatos(measurements);

            const angulo = calcularHeading(measurements);
            setHeading(angulo);

            // ¿está apuntando al norte? (considerando el "cruce" de 360° a 0°)
            const distanciaAlNorte = Math.min(angulo, 360 - angulo);
            setApuntandoNorte(distanciaAlNorte <= TOLERANCIA_NORTE);

            // rotamos la aguja en sentido contrario al giro del teléfono,
            // así siempre "apunta" hacia el norte real
            Animated.timing(rotacion, {
                toValue: -angulo,
                duration: 200,
                useNativeDriver: true,
            }).start();
        });

        Magnetometer.setUpdateInterval(200);

        return () => {
            subscribir.remove();
        };
    }, []);

    // convierte x, y del magnetómetro en un ángulo de 0 a 360 grados
    const calcularHeading = ({ x, y }) => {
        let angulo = Math.atan2(y, x) * (180 / Math.PI);
        angulo = angulo + 90; // ajusta para que 0° sea "arriba" del teléfono
        if (angulo < 0) {
            angulo += 360;
        }
        return angulo;
    };

    const rotacionInterpolada = rotacion.interpolate({
        inputRange: [-360, 360],
        outputRange: ["-360deg", "360deg"],
    });

    return (
        <View
            style={[
                styles.container,
                apuntandoNorte && styles.containerNorte, // fondo rojo si apunta al norte
            ]}
        >
            <Text style={styles.title}>Brújula</Text>

            <View style={styles.brujulaContenedor}>
                <Animated.Text
                    style={[
                        styles.aguja,
                        { transform: [{ rotate: rotacionInterpolada }] },
                    ]}
                >
                    🧭
                </Animated.Text>
            </View>

            <Text style={styles.heading}>{heading.toFixed(0)}°</Text>
            <Text style={styles.direccion}>{obtenerDireccion(heading)}</Text>

            {apuntandoNorte && (
                <Text style={styles.alerta}>¡Apuntando al Norte! 🔴</Text>
            )}

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
        </View>
    );
}

// traduce el ángulo a una dirección cardinal legible
function obtenerDireccion(heading) {
    const direcciones = ["N", "NE", "E", "SE", "S", "SO", "O", "NO"];
    const index = Math.round(heading / 45) % 8;
    return direcciones[index];
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        padding: 25,
        backgroundColor: "#fff",
    },
    containerNorte: {
        backgroundColor: "#ff3b30", // rojo cuando apunta al norte
    },
    title: {
        fontSize: 35,
        textAlign: "center",
        marginBottom: 20,
        color: "#3a4a5a",
    },
    brujulaContenedor: {
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 10,
    },
    aguja: {
        fontSize: 100,
    },
    heading: {
        textAlign: "center",
        fontSize: 40,
        fontWeight: "bold",
        color: "#3a4a5a",
    },
    direccion: {
        textAlign: "center",
        fontSize: 24,
        fontWeight: "600",
        color: "#3a4a5a",
        marginBottom: 15,
    },
    alerta: {
        textAlign: "center",
        fontSize: 18,
        fontWeight: "bold",
        color: "#fff",
        marginBottom: 20,
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
});