import React, {useState} from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {
  UsbSerialManager,
  Parity,
  Codes,
} from 'react-native-usb-serialport-for-android';

const App = () => {
  const [status, setStatus] = useState('Idle');

  const handleUsbCommunication = async () => {
    setStatus('Attempting to communicate with USB...');
    try {
      const devices = await UsbSerialManager.list();
      console.log('Devices:', devices);

      await UsbSerialManager.tryRequestPermission(2004);
      const usbSerialport = await UsbSerialManager.open(2004, {
        baudRate: 38400,
        parity: Parity.None,
        dataBits: 8,
        stopBits: 1,
      });

      const sub = usbSerialport.onReceived(event => {
        console.log('Received data:', event.deviceId, event.data);
        setStatus(`Received data: ${event.data}`);
      });

      await usbSerialport.send('00FF');
      setStatus('Data sent successfully');

      // Clean up and close the connection
      sub.remove();
      await usbSerialport.close();
    } catch (err) {
      console.log(err);
      if (err.code === Codes.DEVICE_NOT_FOUND) {
        setStatus('Device not found');
      } else {
        setStatus(`Error: ${err.message}`);
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.status}>{status}</Text>
      <TouchableOpacity style={styles.button} onPress={handleUsbCommunication}>
        <Text style={styles.buttonText}>Start USB Communication</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  status: {
    marginBottom: 20,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default App;
