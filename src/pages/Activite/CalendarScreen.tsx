import React, { useState, useMemo, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import dayjs from "dayjs";
import Ionicons from "react-native-vector-icons/Ionicons";
import { t } from "i18next";
import i18n from "../../i18n/i18n";

export default function CalendarScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { packageData } = route.params;

  const today = dayjs();
  const [currentMonth, setCurrentMonth] = useState(dayjs());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [childCount, setChildCount] = useState(0);
  const [adultCount, setAdultCount] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Créneaux horaires proposés (08h-20h, pas d'1h)
  const TIME_SLOTS = [
    "08:00", "09:00", "10:00", "11:00", "12:00", "13:00",
    "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00",
  ];

  // ⭐ Ref pour le scroll automatique vers le formulaire
  const scrollRef = useRef<ScrollView>(null);

  const ADULT_PRICE = Number(packageData?.price) || 43.98;
  const CHILD_PRICE = 13.33;

  const formatDuration = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h === 0) return `${m} min`;
    if (m === 0) return h === 1 ? "1 heure" : `${h} heures`;
    return `${h}h${m}`;
  };

  const total = useMemo(
    () => (adultCount * ADULT_PRICE + childCount * CHILD_PRICE).toFixed(2),
    [adultCount, childCount, ADULT_PRICE]
  );

  const handleContinue = () => {
    if (!selectedDate) {
      Alert.alert("Erreur", t("selct"));
      return;
    }
    if (!selectedTime) {
      Alert.alert("Erreur", t("selctTime") || "Veuillez choisir une heure");
      return;
    }
    navigation.navigate("CheckoutScreen", {
      packageData,
      selectedDate,
      selectedTime,
      childCount,
      adultCount,
      total: parseFloat(total),
    });
  };

  const daysArray = (month: dayjs.Dayjs) => {
    const start = month.startOf("month").startOf("week");
    const end = month.endOf("month").endOf("week");
    const days = [];
    let d = start;
    while (d.isBefore(end)) {
      days.push(d);
      d = d.add(1, "day");
    }
    return days;
  };

  const handleNextMonth = () => setCurrentMonth((p) => p.add(1, "month"));
  const handlePrevMonth = () => setCurrentMonth((p) => p.subtract(1, "month"));
  const isCurrentMonth = currentMonth.isSame(today, "month");

  dayjs.locale(i18n.language);

  return (
    <ScrollView ref={scrollRef} style={styles.container}>
      <Text style={styles.header}>{packageData?.name || "Package"}</Text>
      {packageData?.duration ? (
        <Text style={styles.durationSub}>{formatDuration(Number(packageData.duration))}</Text>
      ) : null}

      {/* Month Header */}
      <View style={styles.monthHeader}>
        {!isCurrentMonth ? (
          <TouchableOpacity onPress={handlePrevMonth}>
            <Ionicons name="chevron-back" size={28} color="#1da3c6" />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 28 }} />
        )}

        <Text style={styles.monthText}>
          {t("months", { returnObjects: true })[currentMonth.month()]}{" "}
          {currentMonth.year()}
        </Text>

        <TouchableOpacity onPress={handleNextMonth}>
          <Ionicons name="chevron-forward" size={28} color="#1da3c6" />
        </TouchableOpacity>
      </View>

      {/* Weekdays */}
      <View style={styles.calendarHeader}>
        {t("daysShort", { returnObjects: true }).map((d, idx) => (
          <Text key={idx} style={styles.dayHeader}>
            {d}
          </Text>
        ))}
      </View>

      {/* Calendar Grid */}
      <View style={styles.calendarGrid}>
        {daysArray(currentMonth).map((day) => {
          const isPast = day.isBefore(today, "day");
          const isSelected = selectedDate === day.format("YYYY-MM-DD");
          const isToday = day.isSame(today, "day");
          const inCurrentMonth = day.isSame(currentMonth, "month");

          return (
            <TouchableOpacity
              key={day.format()}
              disabled={isPast || !inCurrentMonth}
              style={[
                styles.dayBox,
                isToday && styles.todayBox,
                isSelected && styles.selectedDay,
                (isPast || !inCurrentMonth) && styles.disabledDay,
              ]}
              onPress={() => {
                setSelectedDate(day.format("YYYY-MM-DD"));

                // ⭐ Scroll automatique vers le formulaire
                setTimeout(() => {
                  scrollRef.current?.scrollToEnd({ animated: true });
                }, 200);
              }}
            >
              <Text
                style={[
                  styles.dayText,
                  (isPast || !inCurrentMonth) && styles.disabledText,
                  isSelected && styles.selectedText,
                ]}
              >
                {day.date()}
              </Text>
              {inCurrentMonth && !isPast && (
                <Text style={styles.priceText}>
                  USD {ADULT_PRICE.toFixed(2)}
                </Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Form Section */}
      {selectedDate && (
        <View style={styles.detailsBox}>
          <Text style={styles.dateText}>
            {dayjs(selectedDate).format("dddd, D MMM YYYY")}
          </Text>

          <Text style={styles.label}>{t("heure") || "Heure"}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.timeRow}>
            {TIME_SLOTS.map((slot) => {
              const isSelected = slot === selectedTime;
              return (
                <TouchableOpacity
                  key={slot}
                  style={[styles.timeChip, isSelected && styles.timeChipSelected]}
                  onPress={() => setSelectedTime(slot)}
                >
                  <Text style={[styles.timeChipText, isSelected && styles.timeChipTextSelected]}>
                    {slot}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
          <View style={styles.separator} />

          <View style={styles.quantityRow}>
            <Text style={styles.label}>{t("Adult")}</Text>
            <Counter
              value={adultCount}
              onChange={(v) => setAdultCount(Math.max(1, v))}
              min={1}
            />
          </View>

          <Text style={styles.subPrice}>USD {CHILD_PRICE.toFixed(2)}</Text>
          <View style={styles.separator} />

          <View style={styles.quantityRow}>
            <Text style={styles.label}>{t("Child")} (5–12)</Text>
            <Counter
              value={childCount}
              onChange={(v) => setChildCount(Math.max(0, v))}
              min={0}
            />
          </View>

          <Text style={styles.subPrice}>USD {ADULT_PRICE.toFixed(2)}</Text>
          <Text style={styles.note}>{t("allprice")}</Text>

          <View style={styles.footer}>
            {isLoading ? (
              <ActivityIndicator size="small" color="#1da3c6" />
            ) : (
              <>
                <Text style={styles.totalText}>USD {total}</Text>
                <TouchableOpacity
                  style={styles.continueBtn}
                  onPress={handleContinue}
                >
                  <Text style={styles.continueText}>Continue</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      )}
    </ScrollView>
  );
}

/* Counter Component */
function Counter({ value, onChange, min = 0, max = 99 }) {
  const decDisabled = value <= min;
  const incDisabled = value >= max;

  return (
    <View style={styles.counter}>
      <TouchableOpacity
        onPress={() => !decDisabled && onChange(value - 1)}
        disabled={decDisabled}
        style={[styles.counterBtn, decDisabled && styles.counterBtnDisabled]}
      >
        <Ionicons name="remove" size={18} color={decDisabled ? "#bbb" : "#1da3c6"} />
      </TouchableOpacity>

      <Text style={styles.counterValue}>{value}</Text>

      <TouchableOpacity
        onPress={() => !incDisabled && onChange(value + 1)}
        disabled={incDisabled}
        style={[styles.counterBtn, incDisabled && styles.counterBtnDisabled]}
      >
        <Ionicons name="add" size={18} color={incDisabled ? "#bbb" : "#1da3c6"} />
      </TouchableOpacity>
    </View>
  );
}

/* STYLES */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "transparent", padding: 16 },
  header: { fontSize: 24, fontWeight: "bold", textAlign: "center", marginBottom: 2 },
  durationSub: { fontSize: 14, color: "#1da3c6", textAlign: "center", marginBottom: 10, fontWeight: "600" },
  monthHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  monthText: { fontSize: 18, fontWeight: "600", color: "#1da3c6" },
  calendarHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  dayHeader: { width: 45, textAlign: "center", fontWeight: "bold", color: "#777" },
  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  dayBox: {
    width: 45,
    height: 65,
    justifyContent: "center",
    alignItems: "center",
    margin: 2,
    borderRadius: 8,
  },
  todayBox: { borderWidth: 1, borderColor: "#1da3c6" },
  selectedDay: { backgroundColor: "#1da3c6" },
  disabledDay: { backgroundColor: "#f0f0f0" },
  dayText: { fontSize: 16, color: "#000" },
  disabledText: { color: "#999" },
  selectedText: { color: "#fff", fontWeight: "bold" },
  priceText: { fontSize: 10, color: "#1da3c6", marginTop: 2 },
  detailsBox: { marginTop: 20, padding: 15, backgroundColor: "#f9f9f9", borderRadius: 10 },
  dateText: { fontSize: 16, fontWeight: "600", marginBottom: 10 },
  timeRow: { marginBottom: 10, marginTop: 4 },
  timeChip: {
    borderWidth: 1,
    borderColor: "#1da3c6",
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 14,
    marginRight: 8,
  },
  timeChipSelected: { backgroundColor: "#1da3c6" },
  timeChipText: { fontSize: 14, fontWeight: "600", color: "#1da3c6" },
  timeChipTextSelected: { color: "#fff" },
  quantityRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  label: { fontSize: 16 },
  subPrice: { color: "#666", marginBottom: 8 },
  separator: { height: 1, backgroundColor: "#ddd", marginVertical: 8 },
  note: { fontSize: 12, color: "#888", textAlign: "center", marginTop: 8 },
  footer: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 10 },
  totalText: { fontSize: 18, fontWeight: "bold", color: "#1da3c6" },
  continueBtn: {
    backgroundColor: "#1da3c6",
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 10,
  },
  continueText: { color: "#fff", fontWeight: "bold" },

  counter: { flexDirection: "row", alignItems: "center" },
  counterBtn: {
    width: 34,
    height: 34,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#1da3c6",
    justifyContent: "center",
    alignItems: "center",
  },
  counterBtnDisabled: { borderColor: "#ddd", backgroundColor: "#f3f3f3" },
  counterValue: { width: 38, textAlign: "center", fontSize: 16, fontWeight: "600" },
});


