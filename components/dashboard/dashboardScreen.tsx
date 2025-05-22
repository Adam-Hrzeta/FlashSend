import { useEffect, useState } from 'react';
import { View, TextInput, FlatList, StyleSheet, Text, Image } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { supabase } from '@/lib/supabase';

export default function DashboardScreen() {
  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Buscar negocios..."
        style={styles.searchInput}
        //value={}
        //onChangeText={}
      />

      <View style={styles.pickerContainer}>
        <Picker
          // selectedValue={}
          // onValueChange={(value) => setCategoryFilter(value)}
          // style={styles.picker}
        >
          <Picker.Item label="Todas las categorías" value="" />
          <Picker.Item label="Comida" value="comida" />
          <Picker.Item label="Tecnología" value="tecnologia" />
          <Picker.Item label="Ropa" value="ropa" />
          <Picker.Item label="Hogar" value="hogar" />
          <Picker.Item label="Salud" value="salud" />
        </Picker>
      </View>

      {/* <FlatList
        data={filteredBusinesses}
        keyExtractor={(item) => item.id}
        renderItem={renderBusinessCard}
        contentContainerStyle={{ paddingBottom: 20 }}
      /> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: '#f3e5f5',
  },
  searchInput: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },
  pickerContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    marginBottom: 15,
  },
  picker: {
    height: 50,
    width: '100%',
  },
  card: {
    flexDirection: 'row',
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  category: {
    fontSize: 14,
    color: '#555',
  },
});
