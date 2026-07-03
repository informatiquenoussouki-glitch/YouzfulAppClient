import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View,
  TouchableOpacity,

} from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import Toast from 'react-native-toast-message';
import { settings } from '../../api';
import DatePicker from 'react-native-date-picker';
import moment from 'moment';
import { useSelector, useDispatch } from 'react-redux';
import { Text, TextInput, Button, Checkbox } from 'react-native-paper';
import { setFinalInfo } from '../../redux/actions/guide';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import { COLOR } from '../../helpers/functions';
import Datee from '../../assets/icons/dateOrange.svg';
import Time from '../../assets/icons/timeOrange.svg';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { useTranslation } from "react-i18next";
import i18n from '../../i18n/i18n';
import { useRoute } from '@react-navigation/native';


moment.locale('fr');
const GuideStep2: React.FC<{ navigation: any; route: any }> = ({
  navigation,
  route,
}) => {

  const { selectedCityId, selectedCityName, price, selectedType } = route.params;

useEffect(() => {
  console.log("✅ Ville reçue :", selectedCityName, "(id:", selectedCityId, ")");
}, []);




const { t } = useTranslation();

  var new_date = moment(moment(), 'YYYY-MM-DD')
    .add(1, 'days')
    .format('YYYY-MM-DD');
  
  const dispatch = useDispatch();
  const globalsettings = useSelector(({ globalSetting }: any) => globalSetting);
  const id = useSelector(({ userReducer }: any) => userReducer.user.id);
  const data = useSelector(({ GuideReducer }: any) => GuideReducer);
  const [startDate, setstartDate] = useState(new Date(new_date));
  const [open, setOpen] = useState(false);
  const [startTime, setstartTime] = useState(new Date(new_date));
  const [openT, setOpenT] = useState(false);
  const [duree, setDuree] = useState('1');

  const [items, setItems] = useState<any[]>([]);
  const [info, setInfo] = useState('');
  const [adress, setAddress] = useState('');
  const [sexe, setsexe] = useState('');

 

useEffect(() => {
  if (selectedType && selectedType.periode) {
    setDuree(String(selectedType.periode));
    console.log("🕒 Période reçue :", selectedType.periode);
  }
}, [selectedType]);



console.log("description reçueee :", selectedType.description);
console.log("🚀 ENVOI VERS REDUX :", {
  typevisite:selectedType?.label,
  desc: selectedType?.description,
  duree: selectedType?.periode,
  
});
function navigatee() {
  if (adress  && sexe !== '') {
    const numericDuree = parseFloat(duree); // extrait "3" de "3 heures"
    const PriceT =
      price === null
        ? numericDuree * Number(globalsettings?.THG || 0)
        : price;
  
  
    dispatch(
      setFinalInfo(
        moment(startDate).format('YYYY-MM-DD'),
        moment(startTime).format('HH:mm'),
        adress,
        selectedCityName,
        info,
        id,
        selectedType?.periode || duree,
        selectedType?.label,
        selectedType?.description ,
        
        sexe,
        PriceT,
       
      ),
    );

    navigation.navigate("GuideRecap");
  } else {
    Toast.show({
      text1: "error",
      text2: t("errorIncomplete"),
      type: "error",
      position: "top",
    });
  }
}


  useEffect(() => {
    const fetchData = async () => {
      const data2 = await settings.Cities();
      const x = data2.map((val: any) => ({ label: val?.name, value: val?.name }));
      setItems(x);
    };
    fetchData().catch(console.error);
    
  }, []);
  console.log('price', { t: price === null, price });
  return (
  <SafeAreaView style={styles.backgroundStyle}>
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      style={styles.backgroundStyle}>
      
      <Text style={[styles.Title]}>
        {t("guideStep1")}
      </Text>

      <View style={[styles.ContentContainer]}>
        
        {/* GENRE */}
        <View style={[styles.inputContainer , { flexDirection:  "row" }]}>
          <Text style={[styles.LabelText]}>
            {t("guideGender")} <Text style={{ color: 'red' }}>*</Text> :
          </Text>
        </View>

          {/* GENRE */}
<View style={[styles.inputContainer ]}>
  {/* Homme */}
  <TouchableOpacity
    onPress={() => setsexe("Homme")}
    style={[
      styles.CheckboxContainer,
      { flexDirection:  "row" },
    ]}
  >
    <Checkbox
      status={sexe === "Homme" ? "checked" : "unchecked"}
      color={COLOR.arrow}
      onPress={() => setsexe("Homme")}
    />
    <Text style={styles.LabelCheckBox}>{t("male")}</Text>
  </TouchableOpacity>

  {/* Femme */}
  <TouchableOpacity
    onPress={() => setsexe("Femme")}
    style={[
      styles.CheckboxContainer,
      { flexDirection:  "row" }
    ]}
  >
    <Checkbox
      status={sexe === "Femme" ? "checked" : "unchecked"}
      color={COLOR.arrow}
      onPress={() => setsexe("Femme")}
    />
    <Text style={styles.LabelCheckBox}>{t("female")}</Text>
  </TouchableOpacity>

  {/* Indifférent */}
  <TouchableOpacity
    onPress={() => setsexe("Indifférent")}
    style={[
      styles.CheckboxContainer,
      { flexDirection: "row" }
    ]}
  >
    <Checkbox
      status={sexe === "Indifférent" ? "checked" : "unchecked"}
      color={COLOR.arrow}
      onPress={() => setsexe("Indifférent")}
    />
    <Text style={styles.LabelCheckBox}>{t("indifferent")}</Text>
  </TouchableOpacity>
</View>

        {/* DATE */}
        <View style={[styles.inputContainer , { flexDirection:  "row" } ]}>
          <Text style={[styles.LabelText]}>
            {t("visitStart")} <Text style={{ color: "red" }}>*</Text> :
          </Text>
        </View>

        <View style={styles.inputRow}>
  <FontAwesome name="calendar" size={24} color="#000" />

  <TouchableOpacity onPress={() => setOpen(true)} style={styles.inputTouchable}>
    <Text style={styles.inputText}>
      {moment(startDate).format("DD/MM/YYYY")}
    </Text>
  </TouchableOpacity>
</View>

         {/* heure */}
        <View style={[styles.inputContainer , { flexDirection:  "row" } ]}>
          <Text style={[styles.LabelText]}>
            {t("heureVisite")} <Text style={{ color: "red" }}>*</Text> :
          </Text>
        </View>

      <View style={styles.inputRow}>
  <FontAwesome name="clock-o" size={26} color="#000" />

  <TouchableOpacity onPress={() => setOpenT(true)} style={styles.inputTouchable}>
    <Text style={styles.inputText}>
      {moment(startTime).format("HH:mm")}
    </Text>
  </TouchableOpacity>
</View>

       {/* DUREE */}
{selectedType?.periode && (
  <View style={[styles.inputContainer, { flexDirection: "row" }]}>
    <Text style={[styles.LabelText, { textAlign: "left" }]}>
      {t("durationVisit")} <Text style={{ color: "red" }}>*</Text> :
    </Text>
  </View>
)}

{selectedType?.periode && (

  <View style={[styles.inputWrapper]}>
    <TextInput
      style={[styles.textInput1]}
      placeholder={t("durationPlaceholder")}
      value={duree}  // ✅ Affiche automatiquement la période du type sélectionné
      onChangeText={(text) => setDuree(text)} // ✅ reste modifiable manuellement
      autoCapitalize="none"
      disabled
    />
  </View>
)}


       {/* ADRESSE */}
<View style={[styles.inputContainer, { flexDirection:  "row" }]}>
  <Text 
    style={[
      styles.LabelText, 
    
    ]}
  >
    {t("meetingAddress")} <Text style={{ color: "red" }}>*</Text> :
  </Text>
</View>

<View style={styles.inputWrapper}>
  <TextInput
    style={[
      styles.textInput, 
     
    ]}
    placeholder={t("addressPlaceholder")}
    value={adress}
    onChangeText={(text) => setAddress(text)}
    keyboardType="default"
  />
</View>


{/* VILLE */}
<View style={[styles.inputContainer, { flexDirection:  "row" }]}>
  <Text style={[styles.LabelText]}>
    {t("city")} <Text style={{ color: "red" }}>*</Text> :
  </Text>
</View>

<View style={styles.inputWrapper}>
  <TextInput
    style={[
      styles.textInput, 
     
    ]}
    placeholder={t("addressPlaceholder")}
    value={selectedCityName}
    editable={false} 
  />
</View>

 
        {/* INFO SUPP */}
        <View style={[styles.inputContainer , { flexDirection: "row" }]}>
          <Text style={[styles.LabelText]}>
            {t("additionalInfo")} :
          </Text>
        </View>
        <TextInput
          placeholder={t("additionalInfoPlaceholder")}
          value={info}
          onChangeText={(text) => setInfo(text)}
          keyboardType="default"
          mode="outlined"
          multiline
          numberOfLines={5}
          style={styles.textarea}
            activeOutlineColor="#000"
        />
      </View>

      {/* DIALOGUES DATES */}
      <DatePicker
        modal
        open={open}
        date={startDate}
        mode="date"
       locale={i18n.language.startsWith("ar") ? "ar" : i18n.language.startsWith("en") ? "en" : "fr"}
                title={t("selectDate")}
                confirmText={t("confirmtDate")}
                cancelText={t("canceltDate")}
                theme="light"           // ✅ Forcer le thème clair (fond blanc)
                textColor="#000000"     // ✅ Texte noir lisible
        minimumDate={new Date(new_date)}
        onConfirm={(date) => {
          setOpen(false);
          setstartDate(date);
        }}
        onCancel={() => setOpen(false)}
      />
      <DatePicker
        modal
        open={openT}
        date={startTime}
        mode="time"
        locale={i18n.language.startsWith("ar") ? "ar" : i18n.language.startsWith("en") ? "en" : "fr"}
                title={t("selectDate")}
                confirmText={t("confirmtDate")}
                cancelText={t("canceltDate")}
                theme="light"           // ✅ Forcer le thème clair (fond blanc)
                textColor="#000000"     // ✅ Texte noir lisible
        onConfirm={(date) => {
          setOpenT(false);
          setstartTime(date);
        }}
        onCancel={() => setOpenT(false)}
      />

      {/* BOUTON FINAL */}
      <View style={styles.buttonContainer}>
        <Button
          mode="outlined"
          color={COLOR.blanc}
          icon={ "arrow-right"} 
          style={styles.buttonStyle}
          contentStyle={{ flexDirection: "row-reverse" }}
          onPress={() => navigatee()}
        >
          {t("finalize")}
        </Button>
      </View>

    </ScrollView>
  </SafeAreaView>
);
}
const styles = StyleSheet.create({
  inputRow: {
  flexDirection: "row",
  marginRight:170,
  backgroundColor: "#fff",
  borderRadius: 10,
  borderWidth: 1,
  borderColor: "#ddd",
  padding: 10,
  marginBottom: 12,
  marginHorizontal: 20,
  height: 55,
  width: 150
},

inputTouchable: {
  flex: 1,
  marginLeft: 12,
  justifyContent: "center",
  
},

inputText: {
  fontSize: 16,
  color: "#333",
},

  textarea: {
    width: '80%',
    backgroundColor: '#fff',
    marginBottom: 10,
    borderRadius: 8,
  },
    textInput : {

    backgroundColor: '#ffffff',
    width:270,
    height:46.5,
    marginTop:5
  

  },
  textInput1 : {

    backgroundColor: '#ffffff',
    width:270,
    height:46.5,
    marginTop:-2
  

  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ced4da',
    height: 50,
    paddingHorizontal: 15,
    marginTop:10
  },
  backgroundStyle: {
    backgroundColor: 'transparent',
    flex: 1,
  },
    Title: {
    fontSize: 22,
    fontWeight: 'bold',
    
    color: '#000',
    textTransform: 'uppercase',
      marginTop:20,
    textAlign: 'center',
  }, 
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b',
    alignSelf: 'flex-start',
    marginTop: 10,
   
  },
  LabelCheckBox: {
    fontSize: 14,
    fontWeight: '400',
    paddingVertical: 5,
    lineHeight: 16,
    textAlign: 'left',
    color: COLOR.arrow,
  },
 buttonContainer: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingBottom: 20,
  },
 buttonStyle: {
    height: 45,
    width: 230,
    backgroundColor: '#000000',
    borderRadius: 12,  
    justifyContent: 'center',
    alignItems: 'center', color: '#fff',
    marginTop:10
  },
  Label: {
    fontSize: 16,
    fontWeight: '400',
    paddingVertical: 5,
    lineHeight: 20,
    textAlign: 'left',
    color: COLOR.arrow,
  },
  CheckboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingLeft: '10%',
  },
  ContentContainer: {
    flex: 1,
    alignItems: 'center',
    width: '100%',
    //paddingVertical: 10,
  },
  inputContainer: {
    width: '100%',
    alignItems: 'flex-start',
    paddingLeft: '10%',
    marginTop: 10,
    marginBottom:5
  },
  card: {
     borderWidth: 1,
    width: "80%",
    borderRadius: 10,
    borderColor: '#ced4da',
    marginTop: 10,
    height: 50
  },
});
const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 4,
    color: 'black',
    paddingRight: 30, // to ensure the text is never behind the icon
  },
  inputAndroid: {
    fontSize: 16,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 0.5,
    borderColor: 'purple',
    borderRadius: 8,
    color: 'black',
    paddingRight: 30, // to ensure the text is never behind the icon
  },
});
export default GuideStep2;
