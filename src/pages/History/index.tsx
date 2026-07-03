import React, { useEffect, useState, useRef, memo } from "react";
import {
  SafeAreaView,
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  ScrollView,
  Vibration,
  Alert,
} from "react-native";
import { Card, Divider } from "react-native-paper";
import { useSelector, useDispatch } from "react-redux";
import { settings } from "../../api";
import moment from "moment";
import { useTranslation } from "react-i18next";
import Toast from "react-native-toast-message";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { COLOR } from "../../helpers/functions";
import { setHistory } from "../../redux/actions/babySitting";
import { logAlert } from "../../helpers/alertsLog";
import Map from "../../assets/icons/map.svg";
import Callendar from "../../assets/icons/callendar.svg";
import { ButtonComponent } from "../../components";

moment.locale("fr");

// --- STABILITÉ ET PERSISTANCE DES TIMERS HORS-COMPOSANT ---
const alertesMissionRef: { [key: string]: number } = {};
const alertes24hRef: { [key: string]: boolean } = {};

// Structure enrichie pour suivre précisément "temps_ajoute" (+0.5, +1.0, etc.)
const extensionsData: {
  [key: string]: {
    prixInitial: number;
    dureeInitiale: number;
    temps_ajoute: number; // Cumul ex: 0.5, 1.0, 1.5...
    nextAlertAt: number;
  };
} = {};
const alertesActivesSet = new Set<string>();

// Résout les villes indépendamment de l'écran Guide : lit le cache, et si vide,
// va chercher la liste directement (au lieu de dépendre d'une visite préalable du Guide).
const ensureCities = async (): Promise<any[]> => {
  try {
    const cached = await AsyncStorage.getItem("cities");
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
    const res = await settings.Cities();
    const cityArray = res?.data ?? [];
    if (!Array.isArray(cityArray) || cityArray.length === 0) return [];
    const cityOptions = cityArray.map((val: any) => ({
      label: val.name,
      value: val.id,
      id: val.id,
    }));
    await AsyncStorage.setItem("cities", JSON.stringify(cityOptions));
    return cityOptions;
  } catch (e) {
    console.error("❌ Erreur ensureCities :", e);
    return [];
  }
};

// Variable globale pour stocker le Tarif Horaire Baby-Sitting (THBS) extrait des paramètres
let globalTHBS: number | null = null;

// =========================================================================
// OPTIMISATION NIVEAU 1 : SOUS-COMPOSANT AUTONOME POUR LE TEXTE DU CHRONO
// =========================================================================
const TimerText = ({ item, t }: { item: any; t: any }) => {
  const [resteText, setResteText] = useState("...");

  useEffect(() => {
    const formatRemaining = () => {
      const now = Date.now();
      const extKey = `dur-${item.id}`;
      const ext = extensionsData[extKey];
      
      // La durée initiale (ex: 2h ou 3h) + cumul du temps ajouté (temps_ajoute)
      const dureeInitiale = ext ? ext.dureeInitiale : parseFloat(item.duree) || 1;
      const tempsAjoute = ext ? ext.temps_ajoute : 0;
      const dureeTotalMs = (dureeInitiale + tempsAjoute) * 3600000; // Conversion en millisecondes

      const h = String(item.time).substring(0, 5);
      const formattedDate = moment(item.date).format("YYYY-MM-DD");
      const missionStart = new Date(`${formattedDate}T${h}:00`).getTime();
      
      // Calcul exact du compte à rebours
      const finAt = missionStart + dureeTotalMs;
      const reste = finAt - now;

      if (reste <= 0) {
        setResteText("Terminé");
      } else {
        const totalSec = Math.floor(reste / 1000);
        const h2 = Math.floor(totalSec / 3600);
        const m = Math.floor((totalSec % 3600) / 60);
        const s = totalSec % 60;
        
        setResteText(
          h2 > 0
            ? `${h2}h ${String(m).padStart(2, "0")}m`
            : `${String(m).padStart(2, "0")}m ${String(s).padStart(2, "0")}s`
        );
      }
    };

    formatRemaining();
    const interval = setInterval(formatRemaining, 1000);
    return () => clearInterval(interval);
  }, [item]);

  const isTermine = resteText === "Terminé";

  return (
    <Text style={[styles.timerText, isTermine && styles.timerTermine]}>
      {isTermine ? `⏰ ${t("Mission terminée !")}` : `⏱ ${resteText} ${t("restant")}`}
    </Text>
  );
};

// =========================================================================
// OPTIMISATION NIVEAU 2 : COMPOSANT DE CARTE MÉMORISÉ VIA REACT.MEMO
// =========================================================================
const HistoryCard = memo(({ item, t, navigation }: any) => {
  const currentStatus = item.statut_prestataire || "en_attente";
  
  const extKey = `dur-${item.id}`;
  const ext = extensionsData[extKey];
  const tempsAjoute = ext ? ext.temps_ajoute : 0;

  const normalizeTypeLocal = (type: any) => {
    if (!type) return "";
    const tStr = type.toString().trim().toLowerCase();
    if (tStr.includes("rest")) return "resto";
    if (tStr.includes("baby")) return "babysitter";
    if (tStr.includes("guid")) return "guide";
    if (tStr.includes("trans")) return "transfert";
    if (tStr.includes("acti")) return "activité";
    return tStr;
  };

  const getImageByTypeLocal = (type: string) => {
    switch (normalizeTypeLocal(type)) {
      case "resto": return require("../../assets/images/food.png");
      case "babysitter": return require("../../assets/images/babysitting.png");
      case "guide": return require("../../assets/images/guide.png");
      case "activité": return require("../../assets/images/activites.png");
      case "transfert": return require("../../assets/images/travelV.png");
      default: return null;
    }
  };

  const formatTypeLabelLocal = (type: string) => {
    const typeNorm = normalizeTypeLocal(type);
    switch (typeNorm) {
      case "activité": return "Activité";
      case "babysitter": return "Babysitter";
      case "guide": return "Guide";
      case "transfert": return "Transfert";
      case "resto": return "Restaurant";
      default: return type ? type.charAt(0).toUpperCase() + type.slice(1) : "";
    }
  };

  const getBadgeStyleLocal = (status: string) => {
    const s = status ? status.toLowerCase().trim() : "";
    switch (s) {
      case "accepte": return styles.accepted;
      case "termine": return styles.finished;
      case "en_cours": return styles.inProgress;
      default: return styles.pending;
    }
  };

  const formatStatusLabelLocal = (status: string) => {
    if (!status) return t("En attente");
    const s = status.toLowerCase().trim();
    switch (s) {
      case "en_attente": return t("En attente");
      case "accepte": return t("Accepté");
      case "en_cours": return t("En cours");
      case "termine": return t("Terminé");
      default: return t(status);
    }
  };

  return (
    <Card
      style={styles.card}
      onPress={() => navigation.navigate(t("details"), { id: item.id, type: normalizeTypeLocal(item.type) })}
    >
      <View style={styles.cardHeader}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Image source={getImageByTypeLocal(item.type)} style={{ width: 35, height: 35, marginRight: 10 }} resizeMode="contain" />
          <Text style={styles.cardTitle}>{formatTypeLabelLocal(item.type)}</Text>
        </View>
        <Text style={styles.price}>{Number(item.totalprice || 0)} {item.currency}</Text>
      </View>

      <Divider style={styles.divider} />

      <View style={styles.cardInfo}>
        <Map width={18} height={18} />
        <Text style={styles.cardText}>{item.ville}</Text>
      </View>

      <View style={styles.cardInfo}>
        <Callendar width={16} height={16} />
        <Text style={styles.cardText}>
          {t("dateSelec")} {item?.date ? moment(item.date).format("DD/MM/YYYY") : "-"}
          {(["babysitter", "guide", "transfert"].includes(normalizeTypeLocal(item.type)) && item?.time) ? ` ${t("at")} ${item.time} h` : ""}
        </Text>
      </View>

      {/* ZONE TEMPS RÉEL INTERNE À LA CARTE */}
      {currentStatus === "en_cours" && (
        <View style={styles.timerRow}>
          <TimerText item={item} t={t} />
          {tempsAjoute > 0 && (
            <Text style={styles.extensionText}>
              +{tempsAjoute * 60}min ({t("temps ajouté")}: {tempsAjoute}h)
            </Text>
          )}
        </View>
      )}

      <View style={styles.cardFooter}>
        <Text style={[styles.badge, getBadgeStyleLocal(currentStatus)]}>
          {formatStatusLabelLocal(currentStatus)}
        </Text>
      </View>
    </Card>
  );
});

// =========================================================================
// COMPOSANT PRINCIPAL : HISTORYSCREEN
// =========================================================================
const HistoryScreen = ({ navigation }: any) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const token = useSelector(({ userReducer }: any) => userReducer?.token);
  const id = useSelector(({ userReducer }: any) => userReducer?.user?.id);

  const [items, updateItems] = useState<any[]>([]);
  const [filteredItems, setFilteredItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string>("all");

  const itemsRef = useRef<any[]>([]);
  const activeFilterRef = useRef<string>("all");
  const isBackoffRef = useRef<boolean>(false);
  
  const extensionsRef = useRef(extensionsData);
  const alertesActivesRef = useRef(alertesActivesSet);
  const paramsReadyRef = useRef(false);

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  useEffect(() => {
    activeFilterRef.current = activeFilter;
  }, [activeFilter]);

  // Récupération des types de visites et des paramètres globaux (pour extraire le THBS)
  const loadPlatformParams = async () => {
    try {
      const res = await settings.GetTypesVisites();
      if (res.status === "success" && Array.isArray(res.list)) {
        await AsyncStorage.setItem("guide_typevisite", JSON.stringify(res.list));
      }

      // Simulation ou appel réel de récupération du THBS depuis la table des paramètres
      // Récupération du THBS depuis la table des paramètres via la bonne méthode
      if (typeof settings.getAllParams === "function") {
        const paramsRes = await settings.getAllParams(token);
        // getAllParams renvoie un tableau de lignes { code, value } (table `params`),
        // pas un objet direct — il faut chercher la ligne dont code === "THBS".
        if (Array.isArray(paramsRes)) {
          const thbsParam = paramsRes.find((p: any) => p?.code === "THBS");
          if (thbsParam && thbsParam.value != null) {
            globalTHBS = parseFloat(thbsParam.value);
          }
        } else if (paramsRes && paramsRes.THBS) {
          globalTHBS = parseFloat(paramsRes.THBS);
        }
      }
    } catch (e) {
      console.log("❌ Erreur Récupération Paramètres :", e);
    } finally {
      // Marque les paramètres comme "tentative terminée" dans tous les cas (succès ou échec)
      // pour ne jamais bloquer indéfiniment le calcul du prix de fin de mission.
      paramsReadyRef.current = true;
    }
  };

  const normalizeType = (type: any) => {
    if (!type) return "";
    const tStr = type.toString().trim().toLowerCase();
    if (tStr.includes("rest")) return "resto";
    if (tStr.includes("baby")) return "babysitter";
    if (tStr.includes("guid")) return "guide";
    if (tStr.includes("trans")) return "transfert";
    if (tStr.includes("acti")) return "activité";
    return tStr;
  };

  // 1. Alerte de Ponctualité Heure H
  useEffect(() => {
    const checkPonctualite = () => {
      items.forEach((item: any) => {
        const currentStatus = item.statut_prestataire || "en_attente";
        if (currentStatus !== "accepte") return;

        const typeNorm = normalizeType(item.type);
        const key = `${typeNorm}-${item.id}`;
        const heureRaw = item.time;
        if (!item.date || !heureRaw) return;

        const heure = String(heureRaw).substring(0, 5);
        const formattedDate = moment(item.date).format("YYYY-MM-DD");
        const missionTime = new Date(`${formattedDate}T${heure}:00`);
        if (isNaN(missionTime.getTime())) return;

        const limiteTime = new Date(missionTime.getTime() + 15 * 60 * 1000);
        const now = new Date();

        if (now < missionTime || now > limiteTime) return;

        const lastAlert = alertesMissionRef[key] || 0;
        const fiveMinutes = 5 * 60 * 1000;

        if (now.getTime() - lastAlert < fiveMinutes) return;

        alertesMissionRef[key] = now.getTime();

        if (typeNorm === "babysitter") {
          Vibration.vibrate(2000);
          const msg = `La garde d'enfants prévue à ${heure} doit commencer.`;
          Alert.alert(t("Mission Baby-sitting"), msg);
          logAlert(t("Mission Baby-sitting"), msg);
        } else if (typeNorm === "guide") {
          Vibration.vibrate(1000);
          const msg = `Votre groupe ou client vous attend pour la visite prévue à ${heure}.`;
          Alert.alert(t("Début Visite Guidée"), msg);
          logAlert(t("Début Visite Guidée"), msg);
        } else if (typeNorm === "transfert") {
          Vibration.vibrate(1500);
          const msg = `Le créneau de transfert de ${heure} a démarré.`;
          Alert.alert(t("Prise en Charge Chauffeur"), msg);
          logAlert(t("Prise en Charge Chauffeur"), msg);
        } else {
          Vibration.vibrate(500);
          const msg = `La mission de type ${typeNorm} prévue à ${heure} peut commencer.`;
          Alert.alert(t("Mission prête"), msg);
          logAlert(t("Mission prête"), msg);
        }
      });
    };

    checkPonctualite();
    const interval = setInterval(checkPonctualite, 30000);

    return () => clearInterval(interval);
  }, [items, t]);

  // 2. Rappel J-1 Anticipé
  useEffect(() => {
    const checkRappel24h = () => {
      items.forEach((item: any) => {
        const currentStatus = item.statut_prestataire || "en_attente";
        if (currentStatus !== "accepte") return;

        const typeNorm = normalizeType(item.type);
        const key = `24h-${typeNorm}-${item.id}`;
        if (alertes24hRef[key]) return;

        const heure = item.time;
        if (!item.date || !heure) return;

        const formattedDate = moment(item.date).format("YYYY-MM-DD");
        const missionTime = new Date(`${formattedDate}T${heure}:00`);
        const alerte24hTime = new Date(missionTime.getTime() - 24 * 60 * 60 * 1000);
        const now = new Date();

        // Se déclenche dès que le seuil des 24h avant la mission est franchi (et tant que
        // la mission n'a pas commencé), plutôt que d'exiger une fenêtre étroite d'1 minute
        // pile — sinon un check tardif (écran remonté après coup) rate l'alerte pour de bon.
        if (now >= alerte24hTime && now < missionTime) {
          alertes24hRef[key] = true;
          Vibration.vibrate(2000);

          if (typeNorm === "babysitter") {
            const msg = `Demain à ${heure}, vous avez une garde d'enfants planifiée.`;
            Alert.alert(t("Rappel Baby-sitting"), msg);
            logAlert(t("Rappel Baby-sitting"), msg);
          } else if (typeNorm === "guide") {
            const msg = `Demain à ${heure}, vous devez animer une prestation de guidage.`;
            Alert.alert(t("Rappel Guide Touristique"), msg);
            logAlert(t("Rappel Guide Touristique"), msg);
          } else if (typeNorm === "transfert") {
            const msg = `Demain à ${heure}, vous assurez une course / transport client.`;
            Alert.alert(t("Rappel Transfert"), msg);
            logAlert(t("Rappel Transfert"), msg);
          } else {
            const msg = `Rappel : Vous avez une prestation de type ${typeNorm} prévue demain à ${heure}.`;
            Alert.alert(t("Mission demain"), msg);
            logAlert(t("Mission demain"), msg);
          }
        }
      });
    };

    checkRappel24h();
    const interval = setInterval(checkRappel24h, 30000);

    return () => clearInterval(interval);
  }, [items, t]);

  // 3. BABYSITTER : CHRONO + EXTENSION +30MIN AVEC SAUVEGARDE BACKEND
  useEffect(() => {
    const checkFinMission = async () => {
      // Attend que le THBS (paramètre global) ait fini de charger avant de calculer
      // un prix : sinon on retomberait sur le tarif de repli dérivé de la réservation
      // (prixInitial / durée), qui n'a rien à voir avec le vrai THBS configuré.
      if (!paramsReadyRef.current) return;

      for (const item of items) {
        const typeNorm = normalizeType(item.type);
        if (typeNorm !== "babysitter") continue;

        const currentStatus = item.statut_prestataire || "en_attente";
        if (currentStatus !== "en_cours") continue;
        if (!item.date || !item.time) continue;

        const key = `dur-${item.id}`;
        if (alertesActivesRef.current.has(key)) continue;

        // Initialisation depuis la DB (temps_ajoute inclus pour survivre aux refreshs)
        if (!extensionsRef.current[key]) {
          extensionsRef.current[key] = {
            prixInitial: parseFloat(item.totalprice) || 0,
            dureeInitiale: parseFloat(item.duree) || 1,
            temps_ajoute: parseFloat(item.temps_ajoute) || 0,
            nextAlertAt: -1,
          };
        }

        const ext = extensionsRef.current[key];
        const now = Date.now();

        if (ext.nextAlertAt > 0 && now < ext.nextAlertAt) continue;

        const h = String(item.time).substring(0, 5);
        const formattedDate = moment(item.date).format("YYYY-MM-DD");
        const missionStart = new Date(`${formattedDate}T${h}:00`).getTime();
        const dureeTotal = ext.dureeInitiale + ext.temps_ajoute;

        if (now < missionStart + dureeTotal * 3600000) continue;

        alertesActivesRef.current.add(key);
        Vibration.vibrate(1000);

        const thbs = globalTHBS || (ext.prixInitial / Math.max(ext.dureeInitiale, 1));
        const coutTrenteMin = Math.round((thbs / 2) * 100) / 100;
        const prochainPrix = Math.round((parseFloat(item.totalprice) + coutTrenteMin) * 100) / 100;

        const finMissionMsg = `La durée prévue de ${dureeTotal}h est écoulée.\nVoulez-vous terminer la mission ?`;
        logAlert(t("Mission terminée ?"), finMissionMsg);
        Alert.alert(
          t("Mission terminée ?"),
          finMissionMsg,
          [
            {
              text: t("Oui, terminer"),
              onPress: async () => {
                // Bloquer temporairement le popup pendant l'appel API pour éviter la race condition
                extensionsRef.current[key] = { ...ext, nextAlertAt: Date.now() + 5 * 60 * 1000 };
                try {
                  // "Oui, terminer" ne change que le statut : ni totalprice ni cout_ajoute
                  const result = await settings.UpdateStatusBooking(
                    token,
                    item.id,
                    "babysitter",
                    "termine"
                  );
                  if (result?.status !== "success") {
                    throw new Error(result?.message || "Échec mise à jour statut");
                  }
                  // Statut confirmé en base : on ne redemande plus jamais pour cette mission
                  extensionsRef.current[key] = { ...ext, nextAlertAt: Infinity };
                  const setTermine = (list: any[]) =>
                    list.map((b) =>
                      b.id === item.id ? { ...b, statut_prestataire: "termine" } : b
                    );
                  const updatedList = setTermine(itemsRef.current);
                  updateItems(updatedList);
                  setFilteredItems((prev) => setTermine(prev));
                  // Persister le cache immédiatement pour éviter qu'un remount /
                  // relance de l'app ne compare le statut à une version périmée
                  // et redéclenche à tort le toast "Statut mis à jour"
                  await AsyncStorage.setItem(`cachedHistory_${id}`, JSON.stringify(updatedList));
                  navigation.navigate(t("details"), { id: item.id, type: "babysitter" });
                } catch (e) {
                  console.error("❌ Erreur UpdateStatusBooking:", e);
                  Toast.show({
                    type: "error",
                    text1: "Erreur",
                    text2: "La mission n'a pas pu être terminée, nouvelle tentative bientôt.",
                  });
                  // nextAlertAt reste à +5 min (déjà positionné ci-dessus) pour réessayer
                } finally {
                  alertesActivesRef.current.delete(key);
                }
              },
            },
            {
              text: `Non, +30 min (${coutTrenteMin} ${item.currency || "€"})`,
              onPress: async () => {
                const nouveauTempsAjoute = ext.temps_ajoute + 0.5;
                // Mise à jour optimiste AVANT l'appel API pour éviter re-déclenchement immédiat
                extensionsRef.current[key] = {
                  ...ext,
                  temps_ajoute: nouveauTempsAjoute,
                  nextAlertAt: Date.now() + 30 * 60 * 1000,
                };
                try {
                  await settings.ExtendBabysittingMission(token, {
                    id: item.id,
                    temps_ajoute: nouveauTempsAjoute,
                    totalprice: prochainPrix,
                    cout_ajoute: coutTrenteMin,
                  });
                  const setPrice = (list: any[]) =>
                    list.map((b) =>
                      b.id === item.id ? { ...b, totalprice: prochainPrix } : b
                    );
                  const updatedList = setPrice(itemsRef.current);
                  updateItems(updatedList);
                  setFilteredItems((prev) => setPrice(prev));
                  // Persister le cache immédiatement (même raison que pour "Oui, terminer")
                  await AsyncStorage.setItem(`cachedHistory_${id}`, JSON.stringify(updatedList));
                } catch (e) {
                  console.error("❌ Erreur ExtendBabysittingMission:", e);
                } finally {
                  alertesActivesRef.current.delete(key);
                }
              },
            },
          ],
          { cancelable: false }
        );
      }
    };

    checkFinMission();
    const interval = setInterval(checkFinMission, 60000);

    return () => clearInterval(interval);
  }, [items, t, navigation, token]);

  const filters = [
    { key: "all", label: t("Tous") },
    { key: "babysitter", label: t("Babysitters") },
    { key: "guide", label: t("Guides") },
    { key: "transfert", label: t("Transferts") },
    { key: "activité", label: t("Activités") },
    { key: "resto", label: t("Restaurants") },
  ];

  const getCurrency = (type: string) => {
    const tStr = normalizeType(type);
    if (tStr === "transfert" || tStr === "guide") return "SAR";
    if (tStr === "activité") return "USD";
    return "€";
  };

  const fetchData = async (isBackground = false) => {
    if (isBackground && isBackoffRef.current) return;

    try {
      if (!isBackground) setIsLoading(true);
      const res = await settings.AllReservationsHistory(token, id);

      if (!res || typeof res !== "object" || res.status !== "success" || !Array.isArray(res.data)) {
        isBackoffRef.current = true;
        setTimeout(() => { isBackoffRef.current = false; }, 60000);
        return;
      }

      const cities = await ensureCities();

      const cleaned = res.data.map((item: any) => {
        const type = normalizeType(item.type);
        let realReservationDate = item?.date;
        if (type === "guide") realReservationDate = item?.date || item?.date_selected || null;

        let villeName = item.ville;
        if (cities.length > 0 && !isNaN(item.ville)) {
          const found = cities.find((c: any) => c.id == item.ville || c.value == item.ville);
          if (found) villeName = found.label || found.name;
        }

        // Conserver les prix locaux déjà incrémentés par les extensions +30 min en tâche de fond
        const extKey = `dur-${item.id}`;
        const localExt = extensionsRef.current[extKey];
        let finalizedPrice = item.totalprice;
        
        if (type === "babysitter" && localExt && localExt.temps_ajoute > 0) {
          const tarifHoraireEffectif = globalTHBS || (localExt.prixInitial / localExt.dureeInitiale);
          finalizedPrice = localExt.prixInitial + (localExt.temps_ajoute * tarifHoraireEffectif);
        }

        return {
          ...item,
          totalprice: finalizedPrice,
          date: realReservationDate,
          ville: villeName,
          normalizedType: type,
          currency: getCurrency(item.type),
        };
      });

      const sorted = sortByDate(cleaned);

      // Toast uniquement si statut_prestataire change sur une demande déjà connue
      if (itemsRef.current.length > 0) {
        sorted.forEach((newBooking) => {
          const oldBooking = itemsRef.current.find((old: any) => old.id === newBooking.id);
          const ancienStatut = oldBooking?.statut_prestataire;
          const nouveauStatut = newBooking?.statut_prestataire;
          if (oldBooking && ancienStatut && nouveauStatut && ancienStatut !== nouveauStatut) {
            const statutMsg = `Votre demande est maintenant : ${nouveauStatut}`;
            Toast.show({
              type: "info",
              text1: "🔔 Statut mis à jour !",
              text2: statutMsg,
              visibilityTime: 8000,
            });
            logAlert("🔔 Statut mis à jour !", statutMsg);
          }
        });
      }

      updateItems(sorted);
      
      const currentFilter = activeFilterRef.current;
      if (currentFilter === "all") {
        setFilteredItems(sorted);
      } else {
        setFilteredItems(sorted.filter((i) => normalizeType(i.type) === normalizeType(currentFilter)));
      }

      dispatch(setHistory(sorted));
      await AsyncStorage.setItem(`cachedHistory_${id}`, JSON.stringify(sorted));
    } catch (err) {
      console.error("❌ Erreur Historique :", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval>;

    const loadHistory = async () => {
      setIsLoading(true);
      const cached = await AsyncStorage.getItem(`cachedHistory_${id}`);
      if (cached) {
        const parsed = JSON.parse(cached);
        updateItems(parsed);
        setFilteredItems(parsed);
        dispatch(setHistory(parsed));
        setIsLoading(false);
      }
      
      await loadPlatformParams();
      await fetchData();

      intervalId = setInterval(() => { fetchData(true); }, 60000);
    };

    if (token && id) loadHistory();

    return () => { if (intervalId) clearInterval(intervalId); };
  }, [token, id]);

  const sortByDate = (data: any[]) => {
    return [...data].sort((a, b) => {
      const dateA = new Date(a.createdat || 0).getTime();
      const dateB = new Date(b.createdat || 0).getTime();
      return dateB - dateA;
    });
  };

  const applyFilter = (filterKey: string) => {
    setActiveFilter(filterKey);
    if (filterKey === "all") {
      setFilteredItems(sortByDate(items));
    } else {
      const filtered = items.filter((i) => normalizeType(i.type) === normalizeType(filterKey));
      setFilteredItems(sortByDate(filtered));
    }
  };

  const renderItem = ({ item }: any) => (
    <HistoryCard item={item} t={t} navigation={navigation} />
  );

  if (isLoading && items.length === 0)
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={COLOR.gris} />
      </View>
    );

  return (
    <SafeAreaView style={styles.background}>
      <View style={styles.container}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
          {filters.map((f) => (
            <TouchableOpacity
              key={f.key}
              style={[styles.filterButton, activeFilter === f.key && styles.filterButtonActive]}
              onPress={() => applyFilter(f.key)}
            >
              <Text style={[styles.filterText, activeFilter === f.key && styles.filterTextActive]}>{f.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {token && id ? (
          <FlatList
            data={filteredItems}
            renderItem={renderItem}
            keyExtractor={(item, index) => `${item.id}_${index}`}
            onRefresh={() => fetchData(false)}
            refreshing={isLoading}
            initialNumToRender={5}
            maxToRenderPerBatch={5}
            windowSize={5}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>{t("aucunreservation")}</Text>
              </View>
            }
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>{t("connectreser")}</Text>
            <ButtonComponent title="Se connecter" press={() => navigation.navigate("ProfileStack")} isLoading={false} />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  background: { flex: 1, backgroundColor: "transparent" },
  container: { flex: 1, padding: 15 },
  loader: { flex: 1, justifyContent: "center", alignItems: "center" },
  filterContainer: { marginBottom: 10, flexGrow: 0, flexDirection: "row" },
  filterButton: { backgroundColor: "#fff", borderRadius: 25, paddingVertical: 8, paddingHorizontal: 18, marginRight: 8, elevation: 2 },
  filterButtonActive: { backgroundColor: "#2C7BE5" },
  filterText: { color: "#333", fontSize: 14, fontWeight: "500" },
  filterTextActive: { color: "#fff" },
  card: { backgroundColor: "#FFFFFF", borderRadius: 14, padding: 16, marginBottom: 14, elevation: 2 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  cardTitle: { fontSize: 17, fontWeight: "600", color: "#222" },
  divider: { marginVertical: 10, height: 1, backgroundColor: "#EEE" },
  cardInfo: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  cardText: { fontSize: 14, color: "#555", marginLeft: 10 },
  cardFooter: { marginTop: 10, alignItems: "flex-start" },
  badge: { paddingVertical: 4, paddingHorizontal: 12, borderRadius: 20, color: "#fff", fontSize: 12, fontWeight: "600", overflow: "hidden" },
  accepted: { backgroundColor: "#4CAF50" },
  finished: { backgroundColor: "#888888" },
  pending: { backgroundColor: "#FFC107" },
  inProgress: { backgroundColor: "#2C7BE5" },
  refused: { backgroundColor: "#F44336" },
  price: { fontSize: 16, fontWeight: "700", color: "#1A1A1A" },
  emptyContainer: { alignItems: "center", justifyContent: "center", paddingVertical: 60 },
  emptyText: { fontSize: 18, color: "#888", marginTop: 100, textAlign: "center", paddingBottom: 10 },
  timerRow: { marginTop: 4, marginBottom: 8, flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 8 },
  timerText: { fontSize: 13, fontWeight: "600", color: "#2C7BE5" },
  timerTermine: { color: "#D32F2F" },
  extensionText: { fontSize: 12, color: "#FF9800", fontWeight: "500" },
});

export default HistoryScreen;