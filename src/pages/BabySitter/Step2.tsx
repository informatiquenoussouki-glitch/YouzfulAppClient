import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  View,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { useSelector, useDispatch } from 'react-redux';
import { Text, TextInput, Checkbox, Button } from 'react-native-paper';
import RNPickerSelect from 'react-native-picker-select';
import { setChildren } from '../../redux/actions/babySitting';
import { COLOR } from '../../helpers/functions';
import Icon from 'react-native-vector-icons/Feather';
import { useTranslation } from 'react-i18next';

const BabySitterScreenStep2: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  
  // Récupération dynamique depuis globalSetting
  const globalsettings = useSelector((state: any) => state.globalSetting);

  const [nbChildren, setNbChildren] = useState(1);
  const [ageItems, setAgeItems] = useState<any[]>([]);
  const [childrenDetails, setChildrenDetails] = useState<any[]>([{ age: null, sex: null }]);

  // CHARGEMENT OBLIGATOIREMENT DYNAMIQUE
  useEffect(() => {
    // Si l'API n'a pas encore chargé, on intercepte la valeur '1' de l'initialState 
    // et on applique temporairement vos valeurs de base de données (2 et 9) en secours.
    const minAge = globalsettings?.AMIN && globalsettings.AMIN !== '1' ? parseInt(globalsettings.AMIN) : 2;
    const maxAge = globalsettings?.AMAX && globalsettings.AMAX !== '1' ? parseInt(globalsettings.AMAX) : 9;

    const items = [];
    for (let i = minAge; i <= maxAge; i++) {
      items.push({ 
        label: `${i} ${t('years')}`, 
        value: i.toString() 
      });
    }
    setAgeItems(items);
    console.log(`Liste des âges mise à jour dynamiquement : ${minAge} à ${maxAge}`);
  }, [globalsettings, t]);

  const handleNextStep = () => {
    const isIncomplete = childrenDetails.some((c) => c.age === null || c.sex === null);
    if (isIncomplete) {
      Toast.show({
        text1: t('fillAgeAndGender'),
        type: 'info',
        position: 'top',
      });
      return;
    }
    dispatch(setChildren(childrenDetails, nbChildren));
    navigation.navigate('BabySitterScreenStep3');
  };

  const handleDecrement = () => {
    if (nbChildren > 1) {
      setNbChildren(nbChildren - 1);
      setChildrenDetails(prev => prev.slice(0, -1));
    }
  };

  const handleIncrement = () => {
    const maxAllowed = globalsettings?.NBME && globalsettings.NBME !== '1' ? parseInt(globalsettings.NBME) : 5;
    if (nbChildren < maxAllowed) {
      setNbChildren(nbChildren + 1);
      setChildrenDetails(prev => [...prev, { age: null, sex: null }]);
    }
  };

  const updateChildAge = (value: any, index: number) => {
    const updated = [...childrenDetails];
    updated[index].age = value;
    setChildrenDetails(updated);
  };

  const updateChildSex = (value: string, index: number) => {
    const updated = [...childrenDetails];
    updated[index].sex = value;
    setChildrenDetails(updated);
  };

  return (
    <SafeAreaView style={styles.background}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled={true} // Résout le conflit de défilement pour Android
      >
        <View style={styles.container}>
          <Text style={styles.title}>{t('babysitterRequestStep2')}</Text>

          <View style={styles.card}>
            <Text style={styles.label}>{t('childrenToKeep')}</Text>

            <View style={styles.counterContainer}>
              <TouchableOpacity onPress={handleDecrement}>
                <Icon name="minus-circle" size={35} color="#000" />
              </TouchableOpacity>

              <TextInput
                value={nbChildren.toString()}
                mode="outlined"
                disabled
                style={styles.counterInput}
                textColor="#000"
              />

              <TouchableOpacity onPress={handleIncrement}>
                <Icon name="plus-circle" size={35} color="#000" />
              </TouchableOpacity>
            </View>

            {childrenDetails.map((child, index) => (
              <View key={`child-field-${index}`} style={styles.childCard}>
                <Text style={styles.childTitle}>
                  👶 {t('child')} {index + 1}
                </Text>

                <Text style={styles.label}>{t('sex')} *</Text>
                <View style={styles.row}>
                  <TouchableOpacity 
                    onPress={() => updateChildSex('B', index)} 
                    style={styles.checkOption}
                  >
                    <Checkbox
                      status={child.sex === 'B' ? 'checked' : 'unchecked'}
                      color={COLOR.primary2}
                      onPress={() => updateChildSex('B', index)}
                    />
                    <Text style={styles.checkLabel}>{t('boy')}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    onPress={() => updateChildSex('G', index)} 
                    style={styles.checkOption}
                  >
                    <Checkbox
                      status={child.sex === 'G' ? 'checked' : 'unchecked'}
                      color={COLOR.primary2}
                      onPress={() => updateChildSex('G', index)}
                    />
                    <Text style={styles.checkLabel}>{t('girl')}</Text>
                  </TouchableOpacity>
                </View>

                <Text style={styles.label}>{t('age')} *</Text>
                <View style={styles.pickerContainer}>
                  <RNPickerSelect
                    onValueChange={(v) => updateChildAge(v, index)}
                    items={ageItems}
                    value={child.age}
                    placeholder={{ label: t('selectAge'), value: null }}
                    useNativeAndroidPickerStyle={false}
                    style={pickerSelectStyles}
                    // Désactive l'ouverture d'une FlatList modale en natif sur Android
                    pickerProps={{ mode: 'dropdown' }} 
                  />
                </View>
              </View>
            ))}
          </View>

          <View style={styles.buttonContainer}>
            <Button
              mode="contained"
              icon="arrow-right"
              contentStyle={{ flexDirection: 'row-reverse' }}
              style={styles.button}
              onPress={handleNextStep}
            >
              {t('nextStep')}
            </Button>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  background: { flex: 1, backgroundColor: 'transparent' },
  scroll: { flex: 1 },
  scrollContent: { alignItems: 'center', paddingBottom: 40 },
  container: { width: '100%', alignItems: 'center', paddingTop: 20 },
  title: { fontSize: 22, fontWeight: '700', color: '#0f172a', marginBottom: 20 },
  card: { width: '90%', backgroundColor: '#fff' },
  label: { fontSize: 15, fontWeight: '600', color: '#1e293b', marginTop: 10 },
  counterContainer: { 
    flexDirection: 'row', 
    justifyContent: 'center', 
    alignItems: 'center', 
    gap: 25, 
    marginVertical: 15 
  },
  counterInput: { 
    width: 60, 
    textAlign: 'center', 
    backgroundColor: '#fff', 
    height: 40 
  },
  childCard: { 
    marginTop: 15, 
    padding: 15, 
    borderWidth: 1, 
    borderColor: '#e2e8f0', 
    borderRadius: 12, 
    backgroundColor: '#f8fafc' 
  },
  childTitle: { fontSize: 16, fontWeight: '700', color: '#334155' },
  row: { flexDirection: 'row', alignItems: 'center', marginTop: 5 },
  checkOption: { flexDirection: 'row', alignItems: 'center', marginRight: 20 },
  checkLabel: { fontSize: 14, color: '#475569' },
  pickerContainer: { 
    borderWidth: 1, 
    borderColor: '#cbd5e1', 
    borderRadius: 8, 
    height: 50, 
    justifyContent: 'center', 
    backgroundColor: '#fff', 
    marginTop: 8 
  },
  buttonContainer: { marginTop: 30, width: '100%', alignItems: 'center' },
  button: { width: '80%', borderRadius: 10, backgroundColor: '#000', paddingVertical: 5 },
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: { fontSize: 16, paddingHorizontal: 10, paddingVertical: 12, color: 'black' },
  inputAndroid: { fontSize: 16, paddingHorizontal: 10, paddingVertical: 8, color: 'black' },
});

export default BabySitterScreenStep2;