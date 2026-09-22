import { useEffect, useState, useRef } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import { Gyroscope } from "expo-sensors";

// Tamaño del área donde se moverá la estrella (ya no toda la pantalla)
const AREA_TAMANO = 250;
const CENTRO = AREA_TAMANO / 2;

const SENSIBILIDAD = 40;
const LIMITE = AREA_TAMANO / 2 - 25; // deja margen para que la estrella no se salga del cuadro

export default function GyroscopeSensor() {
    const [datos, setDatos] = useState({ x: 0, y: 0, z: 0 });

    const posicion = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
    const offsetRef = useRef({ x: 0, y: 0 });
    const ultimoTiempo = useRef(Date.now());

    useEffect(() => {
        const subscribir = Gyroscope.addListener((measurements) => {
            setDatos(measurements);

            const ahora = Date.now();
            const dt = (ahora - ultimoTiempo.current) / 1000;
            ultimoTiempo.current = ahora;

            const { x, y } = measurements;

            let nuevoX = offsetRef.current.x + y * SENSIBILIDAD * dt * 10;
            let nuevoY = offsetRef.current.y + x * SENSIBILIDAD * dt * 10;

            nuevoX = Math.max(-LIMITE, Math.min(LIMITE, nuevoX));
            nuevoY = Math.max(-LIMITE, Math.min(LIMITE, nuevoY));

            offsetRef.current = { x: nuevoX, y: nuevoY };
            posicion.setValue({ x: nuevoX, y: nuevoY });
        });

        Gyroscope.setUpdateInterval(100);

        return () => {
            subscribir.remove();
        };
    }, []);

    const centrarEstrella = () => {
        offsetRef.current = { x: 0, y: 0 };
        Animated.spring(posicion, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: true,
        }).start();
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Giroscopio</Text>

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

            <Text style={styles.hint} onPress={centrarEstrella}>
                Toca aquí para volver al centro ⭐
            </Text>

            {/* Contenedor fijo donde vive la estrella */}
            <View style={styles.areaJuego}>
                <Animated.Text
                    style={[
                        styles.estrella,
                        {
                            left: CENTRO - 20,
                            top: CENTRO - 20,
                            transform: [
                                { translateX: posicion.x },
                                { translateY: posicion.y },
                            ],
                        },
                    ]}
                >
                    ⭐
                </Animated.Text>
            </View>
        </View>
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
        color: "#3a4a5a",
        marginTop: 10,
        marginBottom: 20,
        fontSize: 16,
        fontWeight: "600",
    },
    areaJuego: {
        width: AREA_TAMANO,
        height: AREA_TAMANO,
        alignSelf: "center",
        backgroundColor: "#f0f4f8",
        borderRadius: 20,
        borderWidth: 2,
        borderColor: "#3a4a5a33",
        position: "relative",
        overflow: "hidden", // evita que la estrella se dibuje fuera del cuadro
    },
    estrella: {
        position: "absolute",
        fontSize: 40,
    },
});