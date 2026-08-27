import { react } from "react";
import { StyleSheet, Text, View, Modal, Button } from 'react-native';

const CustomModal = ({visible, onClose, contenido}) =>{
    return(
        <Modal
            animationType='fade'
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View sytle={styles.centeredView}>
                <View sytle={styles.modalView}> 
                    <Text sytle={styles.modalText}>Hola,{contenido ? contenido.valor : " Mundo"} </Text>
                    <Button
                    title="Cerrar"
                    onPress={onClose}
                    />
                </View>
            </View>
        
        </Modal>
    );

}

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalView: {
        margin:20,
        backgroundColor: 'white',
        borderRadius: 15,
        padding: 25,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {width: 0, height:2},
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
    },
    modalText: {
        marginBottom:20,
        textAlign:'center',
        fontsize:20,
        fontWeight: '500',
    },
});
export default CustomModal;