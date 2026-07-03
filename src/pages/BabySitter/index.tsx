import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { Text, Button, IconButton } from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { settings } from '../../api';
import { COLOR } from '../../helpers/functions';
import SelectBox from 'react-native-multi-selectbox-typescript';
import { xorBy } from 'lodash';
import { setSkillLang } from '../../redux/actions/babySitting';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RNPickerSelect from 'react-native-picker-select';

const BabySitterScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const token = useSelector(({ userReducer }: any) => userReducer.token);

  const [skills, setSkills] = useState<any[]>([]);
  const [languages, setLanguages] = useState<any[]>([]);
  const [selectedLang, setSelectedLang] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [selectedVille, setSelectedVille] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  /** --- CHARGEMENT INITIAL AVEC CACHE --- **/
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // 1️⃣ Charger instantanément le cache s'il existe
        const [cachedSkills, cachedLangs, cachedCities] = await Promise.all([
          AsyncStorage.getItem("cachedSkills"),
          AsyncStorage.getItem("cachedLangs"),
          AsyncStorage.getItem("cachedCities"),
        ]);

        if (cachedSkills) setSkills(JSON.parse(cachedSkills));
        if (cachedLangs) setLanguages(JSON.parse(cachedLangs));
        if (cachedCities) setItems(JSON.parse(cachedCities));

        // 2️⃣ Mise à jour des données en arrière-plan
        setTimeout(async () => {
          const [skillRes, LangRes, CityRes] = await Promise.all([
            settings.Skills(token),
            settings.Languages(token),
            settings.Cities(),
          ]);

          const skill = skillRes?.data ?? [];
          const Langs = LangRes?.data ?? [];
          const Cities = CityRes?.data ?? [];

          const newSkills = skill.map((val: any) => ({
            label: val?.name,
            value: val?.code,
            price: val?.price,
            id: val?.id,
            hours: 0, // Initialisé à 0 heure
          }));

          const newLangs = Langs.map((val: any) => ({
            item: val?.name,
            code: val?.code,
            id: val?.id,
          }));

          const newCities = Cities.map((val: any) => ({
            label: val?.name,
            value: val?.name,
          }));

          setSkills(newSkills);
          setLanguages(newLangs);
          setItems(newCities);

          await Promise.all([
            AsyncStorage.setItem("cachedSkills", JSON.stringify(newSkills)),
            AsyncStorage.setItem("cachedLangs", JSON.stringify(newLangs)),
            AsyncStorage.setItem("cachedCities", JSON.stringify(newCities)),
          ]);

          setIsLoading(false);
        }, 500);
      } catch (err) {
        console.error("❌ Erreur fetchData :", err);
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  /** --- Gestion du Compteur d'Heures --- **/
  const incrementHours = (index: number) => {
    const newState = [...skills];
    newState[index].hours += 1;
    setSkills(newState);
  };

  const decrementHours = (index: number) => {
    const newState = [...skills];
    if (newState[index].hours > 0) {
      newState[index].hours -= 1;
      setSkills(newState);
    }
  };

  const onMultiChange = () => (item: any) =>
    setSelectedLang(xorBy(selectedLang, [item], "id"));

  /** --- Navigation --- **/
  const navigatee = () => {
    // On filtre pour envoyer à Redux uniquement les suppléments avec au moins 1 heure
    const selectedSkills = skills.filter((val) => val.hours > 0);

    if (selectedLang.length > 0 && selectedVille) {
      dispatch(setSkillLang(selectedSkills, selectedLang, selectedVille));
      navigation.navigate("BabySitterScreenStep2");
    } else {
      Toast.show({
        text1: t("fillAllFields"),
        text2: t("chooseLangAndCity"),
        type: "info",
        position: "top",
      });
    }
  };

  const renderItem = ({ item, index }: any) => (
    <View style={styles.skillRow}>
      <View style={{ flex: 1, paddingRight: 10 }}>
        <Text style={styles.skillText}>{item.label}</Text>
        <Text style={styles.skillPrice}>{item.price} {t("pricePerHour")}</Text>
      </View>
      
      {/* Sélecteur numérique : [-] H [+][/b] */}
      <View style={styles.counterContainer}>
        <IconButton
          icon="minus-circle-outline"
          iconColor={item.hours > 0 ? COLOR.primary2 : '#cbd5e1'}
          size={24}
          onPress={() => decrementHours(index)}
          disabled={item.hours === 0}
          style={{ margin: 0 }}
        />
        <Text style={styles.counterText}>{item.hours}h</Text>
        <IconButton
          icon="plus-circle"
          iconColor={COLOR.primary2}
          size={24}
          onPress={() => incrementHours(index)}
          style={{ margin: 0 }}
        />
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.background}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ alignItems: 'center', paddingBottom: 60 }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>{t('babysitterRequest')}</Text>

        <View style={styles.card}>
          {/* Ville */}
          <Text style={styles.label}>
            {t('city')} <Text style={{ color: 'red' }}>*</Text>
          </Text>
          <View style={styles.pickerContainer}>
            <RNPickerSelect
              onValueChange={setSelectedVille}
              items={items}
              value={selectedVille}
              placeholder={{ label: t('selectCity1'), value: null }}
              useNativeAndroidPickerStyle={false}
              style={pickerSelectStyles}
            />
          </View>

          {/* Langues */}
          <Text style={styles.label}>
            {t('languagesSpoken')} <Text style={{ color: 'red' }}>*</Text>
          </Text>
          <SelectBox
            label=""
            options={languages}
            selectedValues={selectedLang}
            onMultiSelect={onMultiChange()}
            onTapClose={onMultiChange()}
            isMulti
            inputPlaceholder={t('selectLanguages')}
            width={'100%'}
            containerStyle={styles.multiSelect}
            arrowIconColor={COLOR.gris}
            searchIconColor={COLOR.gris}
            toggleIconColor={COLOR.gris}
            multiOptionContainerStyle={{ backgroundColor: COLOR.gris }}
            hideInputFilter={true}
          />

          {/* Compétences / Suppléments */}
          <Text style={[styles.label, { marginTop: 25 }]}>
            {t('extraOptions')}
          </Text>
          <FlatList
            data={skills}
            renderItem={renderItem}
            keyExtractor={(item: any) => item.id.toString()}
            scrollEnabled={false}
          />
        </View>

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

const styles = StyleSheet.create({
  background: { flex: 1, backgroundColor: 'transparent' },
  scroll: { flex: 1 },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#0f172a',
    textAlign: 'center',
    marginTop: 25,
    marginBottom: 15,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 10,
    width: '90%',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 10,
    alignSelf: 'flex-start',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    height: 46,
    justifyContent: 'center',
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  skillRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderColor: "#e2e8f0",
  },
  skillText: { fontSize: 15, fontWeight: '500', color: '#1e293b' },
  skillPrice: { fontSize: 13, color: "#64748b", marginTop: 2 },
  counterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 20,
    paddingHorizontal: 2,
  },
  counterText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0f172a',
    minWidth: 28,
    textAlign: 'center',
  },
  multiSelect: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: -15,
  },
  buttonContainer: { alignItems: 'center', marginTop: 30, marginBottom: 20 },
  button: {
    height: 50,
    width: 260,
    borderRadius: 12,
    backgroundColor: '#000',
    justifyContent: 'center',
  },
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: { fontSize: 15, paddingHorizontal: 10, color: '#000' },
  inputAndroid: { fontSize: 15, paddingHorizontal: 10, color: '#000' },
  placeholder: { color: '#9ca3af' },
});

export default BabySitterScreen;