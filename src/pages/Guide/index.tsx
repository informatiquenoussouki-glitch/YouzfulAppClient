import React, { useState, useEffect } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, View, TouchableOpacity } from 'react-native';
import moment from 'moment';
import Toast from 'react-native-toast-message';
import { Text, Checkbox, Button, TextInput } from 'react-native-paper';
import RNPickerSelect from 'react-native-picker-select';
import { useSelector, useDispatch } from 'react-redux';
import { settings } from '../../api';
import { COLOR } from '../../helpers/functions';
import SelectBox from 'react-native-multi-selectbox-typescript';
import { xorBy } from 'lodash';
import Icon from 'react-native-vector-icons/Feather';
import { setFirstInfo } from '../../redux/actions/guide';
import { ChangeColor } from '../../redux/actions/Signin';
import { useTranslation } from 'react-i18next';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';

moment.locale('fr');

const GuideScreen: React.FC<{ navigation: any; route: any }> = ({ route, navigation }) => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const globalsettings = useSelector(({ globalSetting }: any) => globalSetting);
  const token = useSelector(({ userReducer }: any) => userReducer.token);

  const [withCar, setHaveCar] = useState('');
  const [nbrpassager, updatenbrpassager] = useState(1);
  const [languages, setLanguages] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [visitTypes, setVisitTypes] = useState<any[]>([]);
  const [selectedLang, setSelectedLang] = useState<any[]>([]);
  const [selectedCity, setSelectedCity] = useState<any>(null);
  const [selectedVisitType, setSelectedVisitType] = useState(null);

  const [customVisitType, setCustomVisitType] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);

  const [showDescription, setShowDescription] = useState(false);
  const [currentDescription, setCurrentDescription] = useState("");

  // ==========================================
  // 1️⃣ CHARGEMENT DES COMPOSANTES INITIALES (VILLES & LANGUES)
  // ==========================================
  useEffect(() => {
    dispatch(ChangeColor(COLOR.primary1));

    const fetchInitialData = async () => {
      try {
        const cachedLangs = await AsyncStorage.getItem('languages');
        const cachedCities = await AsyncStorage.getItem('cities');

        if (cachedLangs) setLanguages(JSON.parse(cachedLangs));
        if (cachedCities) setCities(JSON.parse(cachedCities));

        const Langs = await settings.Languages(token);
        const data2 = await settings.Cities();

        const langArray = Langs?.data ?? [];
        const cityArray = data2?.data ?? [];

        if (langArray.length > 0) {
          const langOptions = langArray.map((val: any) => ({
            item: val.name,
            code: val.code,
            id: val.id,
          }));
          setLanguages(langOptions);
          await AsyncStorage.setItem('languages', JSON.stringify(langOptions));
        }

        if (cityArray.length > 0) {
          const cityOptions = cityArray.map((val: any) => ({
            label: val.name,
            value: val.id,
            id: val.id,
          }));
          setCities(cityOptions);
          await AsyncStorage.setItem('cities', JSON.stringify(cityOptions));
        }
      } catch (err) {
        console.error('Erreur fetchInitialData:', err);
      }
    };

    fetchInitialData();
  }, [token, dispatch]);

  // ==========================================
  // 2️⃣ CHARGEMENT DYNAMIQUE DES TYPES DE VISITE SELON LA VILLE
  // ==========================================
  useEffect(() => {
    if (!selectedCity) {
      setVisitTypes([]);
      setSelectedVisitType(null);
      return;
    }

    const cityId = selectedCity.value ?? selectedCity;

    const fetchVisitTypes = async () => {
      try {
        const cacheKey = `visitTypes_${cityId}`;
        const cachedVisits = await AsyncStorage.getItem(cacheKey);
        
        if (cachedVisits) {
          setVisitTypes(JSON.parse(cachedVisits));
        }

        const bisitType = await settings.VisitType(token, cityId);

        if (bisitType) {
          const visitOptions = bisitType.map((val: any) => ({
            label: val?.label,
            value: val?.id,
            periode: val?.periode,
            description: val?.description,
            ...val,
          }));

          setVisitTypes(visitOptions);
          await AsyncStorage.setItem(cacheKey, JSON.stringify(visitOptions));
          await AsyncStorage.setItem("guide_typevisite", JSON.stringify(visitOptions));
        }
      } catch (err) {
        console.error("Erreur fetchVisitTypes:", err);
      }
    };

    fetchVisitTypes();
  }, [selectedCity, token]);

  // Suivi de la période sélectionnée pour la console
  useEffect(() => {
    if (selectedVisitType && visitTypes.length > 0) {
      const selected = visitTypes.find((v) => v.value === selectedVisitType);
      if (selected) {
        console.log("🕒 Période du type de visite sélectionné :", selected.periode);
      }
    }
  }, [selectedVisitType, visitTypes]);

  // ==========================================
  // 🔢 GESTION ET PROTECTION DU COMPTEUR PASSAGERS
  // ==========================================
  function MinusF() {
    if (nbrpassager > 1) {
      updatenbrpassager(nbrpassager - 1);
    }
  }

  function PlusF() {
    let maxPassengers = 10; // Limite par défaut si vide

    // On parcourt dynamiquement les lignes de la BDD pour extraire la valeur réelle de NMP
    if (Array.isArray(globalsettings)) {
      const nmpParam = globalsettings.find((param: any) => param.code === 'NMP');
      if (nmpParam && nmpParam.value) {
        maxPassengers = parseInt(nmpParam.value, 10);
      }
    } else if (globalsettings && typeof globalsettings === 'object') {
      const rawData = globalsettings.globalSetting ?? globalsettings.data ?? globalsettings;
      if (Array.isArray(rawData)) {
        const nmpParam = rawData.find((param: any) => param.code === 'NMP');
        if (nmpParam && nmpParam.value) {
          maxPassengers = parseInt(nmpParam.value, 10);
        }
      } else if (rawData?.NMP) {
        maxPassengers = parseInt(rawData.NMP, 10);
      }
    }

    if (nbrpassager < maxPassengers) {
      updatenbrpassager(nbrpassager + 1);
    } else {
      Toast.show({
        text1: `${t('maxPassengersReached') || 'Limite maximale atteinte'} (${maxPassengers})`,
        type: "info",
        position: "top",
      });
    }
  }

  // ==========================================
  // 🚀 CHEMINEMENT ET VALIDATION DES CHAMPS
  // ==========================================
  function navigatee() {
    const cityId = selectedCity?.value ?? selectedCity;
    const cityObj = cities.find((c) => c.value === cityId);
    const selectedVisit = visitTypes.find((v) => v.value === selectedVisitType);
    
    let finalVisitType = selectedVisitType;

    if (selectedVisit && selectedVisit.label?.toLowerCase() === "autre") {
      if (!customVisitType.trim()) {
        return Toast.show({
          text1: t("enterOtherVisit"),
          type: "info",
          position: "top",
        });
      }
      finalVisitType = customVisitType.trim();
    }

    if (!withCar || selectedLang.length === 0 || !finalVisitType || !cityObj) {
      return Toast.show({
        text1: t("fillAllFields"),
        type: "info",
        position: "top",
      });
    }

    dispatch(setFirstInfo(selectedLang, withCar, nbrpassager, finalVisitType));

    navigation.navigate("GuideStep2", {
      selectedCityId: cityObj.value,
      selectedCityName: cityObj.label,
      price: selectedVisit?.forfait === "1" ? selectedVisit.price : null,
      selectedType: selectedVisit,
    });
  }

  function onMultiChange() {
    return (item: any) => setSelectedLang(xorBy(selectedLang, [item], 'id'));
  }

  return (
    <SafeAreaView style={styles.background}>
      <ScrollView style={styles.scrollContainer} contentInsetAdjustmentBehavior="automatic" keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>{t('guideStep1')}</Text>

        <View style={styles.cardContainer}>
          {/* SELECTION VILLE */}
          <Text style={styles.label}>
            {t('chooseCity')} <Text style={{ color: 'red' }}>*</Text>
          </Text>
          <View style={styles.card}>
            <RNPickerSelect
              onValueChange={(value) => setSelectedCity(value)}
              items={cities}
              value={selectedCity}
              placeholder={{ label: t('selectCity'), value: null }}
              useNativeAndroidPickerStyle={true}
              style={pickerSelectStyles}
            />
          </View>

          {/* SELECTION TYPE VISITE */}
          <Text style={styles.label}>
            {t('visitWanted')} <Text style={{ color: 'red' }}>*</Text>
          </Text>
          <View style={styles.card}>
            <RNPickerSelect
              onValueChange={(value) => {
                setSelectedVisitType(value);
                if (!value) return;

                const selected = visitTypes.find(v => v.value === value);

                if (selected?.label?.toLowerCase() === "autre") {
                  setShowCustomInput(true);
                } else {
                  setShowCustomInput(false);
                  setCustomVisitType("");
                }

                if (selected?.description && selected.description.trim() !== "") {
                  setCurrentDescription(selected.description);
                  setShowDescription(false);
                } else {
                  setCurrentDescription("");
                  setShowDescription(false);
                }
              }}
              items={visitTypes}
              value={selectedVisitType}
              placeholder={{ label: t('selectVisitType'), value: null }}
              useNativeAndroidPickerStyle={true}
              style={pickerSelectStyles}
            />
          </View>

          {/* ACCORDEON DESCRIPTION */}
          {selectedVisitType && currentDescription.trim() !== "" && (
            <TouchableOpacity
              onPress={() => setShowDescription(prev => !prev)}
              style={styles.descriptionToggle}
            >
              <Text style={styles.descriptionToggleText}>
                {showDescription ? t("hideDescription") : t("viewDescription")}
              </Text>
              <Ionicons
                name={showDescription ? "remove-circle-outline" : "add-circle-outline"}
                size={26}
                color="#000"
              />
            </TouchableOpacity>
          )}

          {showDescription && currentDescription.trim() !== "" && (
            <View style={{ width: "100%" }}>
              <Text style={styles.descrioptionLabel}>
                {t('descvisite')}
              </Text>
              <View style={styles.descriptionBox}>
                <Text style={styles.descriptionText}>
                  {currentDescription}
                </Text>
              </View>
            </View>
          )}

          {/* CHAMP OPTIONNEL AUTRE */}
          {showCustomInput && (
            <>
              <Text style={styles.label}>
                {t("otherSpecify")} <Text style={{ color: "red" }}>*</Text>
              </Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.textInput}
                  placeholder={t("enterOtherVisit")}
                  value={customVisitType}
                  onChangeText={setCustomVisitType}
                  mode="flat"
                  underlineColor="transparent"
                  activeUnderlineColor="transparent"
                />
              </View>
            </>
          )}

          {/* SÉLECTION DES LANGUES */}
          <Text style={styles.label}>
            {t('guideLanguages')} <Text style={{ color: 'red' }}>*</Text>
          </Text>
          <SelectBox
            label="Label"
            labelStyle={{ color: '#fff', fontSize: 0 }}
            options={languages}
            selectedValues={selectedLang}
            onMultiSelect={onMultiChange()}
            onTapClose={onMultiChange()}
            isMulti
            inputPlaceholder={t('select')}
            width={'100%'}
            containerStyle={styles.multiSelect}
            arrowIconColor={COLOR.gris}
            searchIconColor={COLOR.gris}
            toggleIconColor={COLOR.gris}
            multiOptionContainerStyle={{ backgroundColor: COLOR.gris }}
            hideInputFilter={true}
          />

          {/* DISPONIBILITÉ DE VOITURE */}
          <Text style={styles.label}>
            {t('guideWithCar')} <Text style={{ color: 'red' }}>*</Text>
          </Text>
          <View style={styles.checkboxContainer}>
            <TouchableOpacity onPress={() => setHaveCar(t('yes'))} style={styles.checkboxOption}>
              <Checkbox status={withCar === t('yes') ? 'checked' : 'unchecked'} color={COLOR.gris} />
              <Text style={styles.checkboxLabel}>{t('yes')}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setHaveCar(t('no'))} style={styles.checkboxOption}>
              <Checkbox status={withCar === t('no') ? 'checked' : 'unchecked'} color={COLOR.gris} />
              <Text style={styles.checkboxLabel}>{t('no')}</Text>
            </TouchableOpacity>
          </View>

          {/* COMPTEUR DE PASSAGERS */}
          <Text style={styles.label}>
            {t('passengersNumber')} <Text style={{ color: 'red' }}>*</Text>
          </Text>
          <View style={styles.passengerContainer}>
            <TouchableOpacity onPress={MinusF}>
              <Icon name="minus-circle" size={35} color="#000" />
            </TouchableOpacity>
            <TextInput
              value={nbrpassager.toString()}
              keyboardType="numeric"
              editable={false}
              mode="outlined"
              style={styles.passengerInput}
            />
            <TouchableOpacity onPress={PlusF}>
              <Icon name="plus-circle" size={35} color="#000" />
            </TouchableOpacity>
          </View>
        </View>

        {/* BOUTON D'ACTION */}
        <View style={styles.buttonContainer}>
          <Button
            mode="contained"
            icon="arrow-right"
            contentStyle={{ flexDirection: 'row-reverse' }}
            style={styles.button}
            onPress={navigatee}
          >
            {t('nextStep')}
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// 🎨 Styles de mise en page
const styles = StyleSheet.create({
  background: { flex: 1, backgroundColor: 'transparent' },
  scrollContainer: { flex: 1, paddingHorizontal: 20 },
  descrioptionLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b',
    alignSelf: 'flex-start',
    marginTop: 10,
  },
  descriptionBox: {
    backgroundColor: "#f8fafc",
    borderRadius: 10,
    padding: 15,
    marginTop: 6,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    width: '100%',
  },
  descriptionText: {
    fontSize: 14,
    color: "#334155",
  },
  descriptionToggle: {
    marginLeft: 'auto',
    marginTop: 5,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  descriptionToggleText: {
    fontSize: 13,
    color: '#334155',
    fontWeight: '700',
    marginRight: 5,
  },
  textInput: {
    backgroundColor: '#ffffff',
    flex: 1,
    paddingHorizontal: 12,
    height: 40,
  },
  inputWrapper: {
    borderWidth: 1,
    borderColor: "#cfd4dbff",
    borderRadius: 10,
    backgroundColor: "#fff",
    height: 45,
    width: '100%',
    justifyContent: "center",
    marginTop: 10,
    overflow: 'hidden',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000',
    textTransform: 'uppercase',
    marginTop: 30,
    textAlign: 'center',
  },
  cardContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    alignItems: 'center',
    marginBottom: 25,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b',
    alignSelf: 'flex-start',
    marginTop: 15,
  },
  card: {
    borderWidth: 1,
    width: '100%',
    borderColor: '#cfd4dbff',
    borderRadius: 10,
    height: 45,
    justifyContent: 'center',
    marginTop: 10,
  },
  multiSelect: {
    borderWidth: 1,
    borderColor: '#cfd4dbff',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  checkboxContainer: {
    flexDirection: 'row',
    width: '80%',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  checkboxOption: { flexDirection: 'row', alignItems: 'center' },
  checkboxLabel: { fontSize: 15, color: '#334155', marginLeft: 5 },
  passengerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '60%',
    marginTop: 10,
  },
  passengerInput: {
    width: '40%',
    textAlign: 'center',
    height: 45,
    backgroundColor: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  buttonContainer: { alignItems: 'center', marginBottom: 30 },
  button: {
    height: 50,
    width: 260,
    borderRadius: 12,
    backgroundColor: '#000',
    justifyContent: 'center',
  },
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    color: '#000',
  },
  inputAndroid: {
    fontSize: 16,
    color: '#000',
    paddingHorizontal: 10,
  },
  placeholder: {
    color: '#9ca3af',
  },
});

export default GuideScreen;