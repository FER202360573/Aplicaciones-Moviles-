import React, { useState } from "react";
import { View, Text, TextInput, Button } from "react-native";

export default function CurrencyScreen(){
    const [usd, setUsd] = useState(' ');
    const [mxn, setMxn] = useState(null);

    const convetir = () =>{
        if (!usd) return;
        setMxn((parseFloat(usd)*18).toFixed(2));
    };

    return (
        <View style={{flex: 1, justifyContent: 'center', padding:20}}>
            <Text> Cantidad en dolares:  </Text>
            <TextInput
                keyboardType="numeric"
                value={usd}
                onChangeText={setUsd}
                style={{borderWidth: 1, marginBottom:10, padding:5}}
            />
            <Button
                title="Convertir MXN"
                onPress={convetir}
            />
            {mxn && <Text style={{margin:20, fontSize:18}}>{usd} USD ={mxn} MXN </Text>}

        </View>
    );
}