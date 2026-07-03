import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View,
  TouchableOpacity,
} from "react-native";
import moment from "moment/min/moment-with-locales"; // ✅ version complète avec toutes les langues
import DatePicker from "react-native-date-picker";
import { Text, TextInput, Checkbox, Button } from "react-native-paper";
import { Colors } from "react-native/Libraries/NewAppScreen";
import { COLOR } from "../../helpers/functions";
import Toast from "react-native-toast-message";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useTranslation } from "react-i18next";
import i18n from "../../i18n/i18n";

// ✅ langue française par défaut
moment.locale("fr");

const InscriptionScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { t } = useTranslation();

  const [fname, setName] = useState("");
  const [lname, setLname] = useState("");
  const [Efname, setEfname] = useState(false);
  const [Elname, setElname] = useState(false);
  const [birthday, setBirthday] = useState(new Date());
  const [Ebirthday, setEbirthday] = useState(false);
  const [formattedDate, setFormattedDate] = useState("");
  const [open, setOpen] = useState(false);
  const [sex, setSex] = useState("");

  // ✅ Appliquer la bonne langue à Moment à chaque changement
  useEffect(() => {
    let locale = "fr"; // 🇫🇷 par défaut
    if (i18n.language.startsWith("ar")) locale = "ar";
    else if (i18n.language.startsWith("en")) locale = "en-gb";

    moment.locale(locale);
    setFormattedDate(moment(birthday).format("LL"));
  }, [i18n.language, birthday]);

  function navigatee() {
    const years = moment().diff(birthday, "years", false);

    setEfname(!fname);
    setElname(!lname);
    setEbirthday(years < 18);

    if (sex === "") {
      Toast.show({
        text1: t("selectGenderFirst"),
        type: "info",
        position: "top",
      });
    }

    if (years >= 18 && fname && lname && sex !== "") {
      navigation.navigate("InscriptionScreenStep2", {
        fname,
        lname,
        birthday: moment(birthday).format("l"),
        sex,
      });
    }
  }

  return (
    <SafeAreaView style={styles.backgroundStyle}>
      <ScrollView contentInsetAdjustmentBehavior="automatic" style={styles.backgroundStyle}>
        <View
          style={{
            backgroundColor: Colors.white,
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            paddingTop: 30,
          }}
        >
          <ScrollView style={styles.container} contentContainerStyle={{ alignItems: "center" }}>
            <Text style={styles.Title}>{t("registerStep1")}</Text>

            {/* --- Champ Nom --- */}
            <View style={styles.fieldContainer}>
              <Text style={[styles.label]}>{t("lastName")}</Text>
              <View
                style={[
                  styles.inputWrapper,
                  Efname && styles.inputWrapperError,
                  { flexDirection: "row", alignItems: "center" },
                ]}
              >
                <Ionicons
                  name="person-outline"
                  size={20}
                  color="#6c757d"
                  style={[styles.icon, { marginHorizontal: 8 }]}
                />
                <TextInput
                  style={[styles.textInput]}
                  placeholder={t("enterLastName")}
                  value={fname}
                  onChangeText={(text) => setName(text)}
                  underlineColorAndroid="transparent"
                />
              </View>
              {Efname && <Text style={styles.labelError}>{t("lastNameRequired")}</Text>}
            </View>

            {/* --- Champ Prénom --- */}
            <View style={styles.fieldContainer}>
              <Text style={[styles.label]}>{t("firstName")}</Text>
              <View
                style={[
                  styles.inputWrapper,
                  Elname && styles.inputWrapperError,
                  { flexDirection: "row", alignItems: "center" },
                ]}
              >
                <Ionicons
                  name="person-outline"
                  size={20}
                  color="#6c757d"
                  style={[styles.icon, { marginHorizontal: 8 }]}
                />
                <TextInput
                  style={[styles.textInput]}
                  placeholder={t("enterFirstName")}
                  value={lname}
                  onChangeText={(text) => setLname(text)}
                  underlineColorAndroid="transparent"
                />
              </View>
              {Elname && <Text style={styles.labelError}>{t("firstNameRequired")}</Text>}
            </View>

            {/* --- Champ Date de naissance --- */}
            <View style={styles.fieldContainer}>
              <Text style={[styles.label]}>{t("birthday")}</Text>

              <TouchableOpacity onPress={() => setOpen(true)}>
                <View
                  style={[
                    styles.inputWrapper,
                    Ebirthday && styles.inputWrapperError,
                    { flexDirection: "row", alignItems: "center" },
                  ]}
                >
                  <Ionicons
                    name="calendar-outline"
                    size={20}
                    style={[styles.icon, { marginHorizontal: 8 }]}
                  />
                  <Text style={[styles.dateText]}>
                    {formattedDate || t("selectDate")}
                  </Text>
                </View>
              </TouchableOpacity>

              {Ebirthday && <Text style={styles.labelError}>{t("mustBe18")}</Text>}

              {/* ✅ DatePicker traduit */}
              <DatePicker
                modal
                open={open}
                date={birthday}
                mode="date"
                locale={i18n.language.startsWith("ar") ? "ar" : i18n.language.startsWith("en") ? "en" : "fr"}
                title={t("selectDate")}
                confirmText={t("confirmtDate")}
                cancelText={t("canceltDate")}
                theme="light"           // ✅ Forcer le thème clair (fond blanc)
                textColor="#000000"     // ✅ Texte noir lisible

                onConfirm={(date) => {
                  setOpen(false);
                  setBirthday(date);
                }}
                onCancel={() => setOpen(false)}
              />
            </View>

            {/* --- Genre --- */}
            <View style={styles.checkboxContainer}>
              <TouchableOpacity
                onPress={() => setSex("M")}
                style={{ flexDirection: "row", alignItems: "center", marginVertical: 5 }}
              >
                <Checkbox
                  status={sex === "M" ? "checked" : "unchecked"}
                  color="#000"
                  onPress={() => setSex("M")}
                />
                <Text style={[styles.LabelCheckBox, { marginHorizontal: 8 }]}>{t("male")}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setSex("F")}
                style={{ flexDirection: "row", alignItems: "center", marginVertical: 5 }}
              >
                <Checkbox
                  status={sex === "F" ? "checked" : "unchecked"}
                  color="#000"
                  onPress={() => setSex("F")}
                />
                <Text style={[styles.Label, { color: "#000", marginHorizontal: 8 }]}>{t("female")}</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>

          <View style={styles.buttonContainer}>
            <Button
              mode="contained"
              color="#000000"
              icon="arrow-right"
              style={styles.buttonStyle}
              contentStyle={{ flexDirection: "row-reverse" }}
              onPress={() => navigatee()}
            >
              {t("nextStep")}
            </Button>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// 🎨 Styles
const styles = StyleSheet.create({
  dateText: {
    flex: 1,
    fontSize: 16,
    color: "rgba(0, 0, 0, 0.8)",
    paddingVertical: 12,
  },
  labelError: {
    fontSize: 14,
    color: "#dc3545",
    marginTop: 5,
    paddingLeft: 5,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ced4da",
    height: 50,
    paddingHorizontal: 15,
  },
  textInput: {
    backgroundColor: "#ffffff",
    width: 220,
    height: 46.5,
    marginTop: 5,
  },
  inputWrapperError: {
    borderColor: "#dc3545",
  },
  icon: {
    marginRight: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#495057",
    marginBottom: 8,
  },
  fieldContainer: {
    width: "95%",
    marginBottom: 20,
    marginLeft: 8,
  },
  container: {
    flex: 1,
    width: 350,
    padding: 20,
  },
  backgroundStyle: {
    backgroundColor: 'transparent',
    flex: 1,
  },
  checkboxContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "78%",
  },
  Title: {
    fontSize: 26,
    fontWeight: "700",
    paddingVertical: 15,
    paddingHorizontal: 15,
    color: COLOR.gris,
  },
  buttonContainer: {
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingBottom: 20,
  },
  buttonStyle: {
    height: 50,
    width: 200,
    alignItems: "center",
    justifyContent: "center",
  },
  Label: {
    fontSize: 16,
    fontWeight: "400",
    paddingVertical: 5,
    lineHeight: 20,
    textAlign: "left",
    color: COLOR.primary1,
  },
  LabelCheckBox: {
    fontSize: 14,
    fontWeight: "400",
    paddingVertical: 5,
    lineHeight: 16,
    textAlign: "left",
    color: "#000",
  },
});

export default InscriptionScreen;
