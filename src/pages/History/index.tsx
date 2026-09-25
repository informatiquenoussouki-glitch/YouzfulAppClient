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
  Modal,
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
import { scheduleLocalNotification, cancelScheduledNotification } from "../../helpers/pushNotification";
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
    pendingAutoEnd: boolean; // true si le client a refusé la prolongation : la mission se terminera seule à l'heure prévue
  };
} = {};
const alertesActivesSet = new Set<string>();

const EXTENSION_DURATIONS = [0.5, 1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0, 5.5, 6.0, 6.5, 7.0, 7.5, 8.0];

const TYPE_LABELS: Record<string, string> = {
  babysitter: "Baby-sitting",
  guide: "Visite guidée",
  transfert: "Transfert",
  activité: "Activité",
  resto: "Restaurant",
};

async function scheduleReservationReminders(items: any[]) {
  const now = Date.now();
  for (const item of items) {
    const statut = item.statut_prestataire || "en_attente";
    if (statut !== "accepte" && statut !== "en_cours") continue;

    const typeNorm: string = item.normalizedType || item.type || "";
    const label = TYPE_LABELS[typeNorm] || typeNorm;

    if (!item.date || !item.time) continue;
    const heure = String(item.time).substring(0, 5);
    const formattedDate = moment(item.date).format("YYYY-MM-DD");
    const missionStart = new Date(`${formattedDate}T${heure}:00`).getTime();
    if (isNaN(missionStart)) continue;

    // Rappel J-1 (24h avant)
    const j1Time = missionStart - 24 * 60 * 60 * 1000;
    const notifJ1Id = `j1-${typeNorm}-${item.id}`;
    if (j1Time > now) {
      await cancelScheduledNotification(notifJ1Id);
      await scheduleLocalNotification(
        notifJ1Id,
        `Rappel ${label}`,
        `Demain à ${heure} vous avez une prestation ${label} planifiée.`,
        j1Time,
        { reservationId: String(item.id), type: typeNorm },
      );
    }

    // Rappel à l'heure H (début de mission)
    const notifH0Id = `h0-${typeNorm}-${item.id}`;
    if (missionStart > now) {
      await cancelScheduledNotification(notifH0Id);
      await scheduleLocalNotification(
        notifH0Id,
        `Début ${label}`,
        `Votre prestation ${label} commence maintenant (${heure}).`,
        missionStart,
        { reservationId: String(item.id), type: typeNorm },
      );
    }

    // Rappel fin babysitter (30 min avant la fin)
    if (typeNorm === "babysitter" && statut === "en_cours") {
      const duree = parseFloat(item.duree) || 1;
      const tempsAjoute = parseFloat(item.temps_ajoute) || 0;
      const finMission = missionStart + (duree + tempsAjoute) * 3600000;
      const notifFinId = `fin-babysitter-${item.id}`;
      const preavis = finMission - 30 * 60 * 1000;
      if (preavis > now) {
        await cancelScheduledNotification(notifFinId);
        await scheduleLocalNotification(
          notifFinId,
          "Mission bientôt terminée",
          `La garde d'enfants se termine dans 30 minutes.`,
          preavis,
          { reservationId: String(item.id), type: "babysitter" },
        );
      }
    }
  }
}

const formatDuration = (h: number): string => {
  const hours = Math.floor(h);
  const mins = Math.round((h - hours) * 60);
  if (hours === 0) return `${mins} min`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}min`;
};

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

      {/* ZONE TEMPS RÉEL INTERNE À LA CARTE — babysitting uniquement, seul type pour
          lequel la fin de mission et l'extension +30min sont gérées (checkFinMission) */}
      {currentStatus === "en_cours" && normalizeTypeLocal(item.type) === "babysitter" && (
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
  const [currentPage, setCurrentPage] = useState(1);

  const itemsRef = useRef<any[]>([]);
  const activeFilterRef = useRef<string>("all");
  const isBackoffRef = useRef<boolean>(false);
  
  const extensionsRef = useRef(extensionsData);
  const alertesActivesRef = useRef(alertesActivesSet);
  const paramsReadyRef = useRef(false);

  // Extensions en attente de confirmation du prestataire (clé : "dur-<id>")
  const pendingExtensionsRef = useRef<{
    [key: string]: {
      missionStart: number;
      dureeInitiale: number;
      originalFinReelle: number;
      startedAt: number;
      dureeProposee: number;
    };
  }>({});

  const [extensionModalVisible, setExtensionModalVisible] = useState(false);
  const [extensionModalData, setExtensionModalData] = useState<any>(null);
  const [selectedExtDuration, setSelectedExtDuration] = useState(0.5);

  const handleModalCancel = () => {
    if (!extensionModalData) return;
    const { key, finReelle, ext } = extensionModalData;
    extensionsRef.current[key] = { ...ext, pendingAutoEnd: true, nextAlertAt: finReelle };
    alertesActivesRef.current.delete(key);
    setExtensionModalVisible(false);
    setExtensionModalData(null);
  };

  const handleModalConfirm = async () => {
    if (!extensionModalData) return;
    const { item, key, missionStart, finReelle, ext } = extensionModalData;
    const duree = selectedExtDuration;

    extensionsRef.current[key] = { ...ext, pendingAutoEnd: false, nextAlertAt: finReelle + 5 * 60 * 1000 };
    pendingExtensionsRef.current[key] = {
      missionStart,
      dureeInitiale: ext.dureeInitiale,
      originalFinReelle: finReelle,
      startedAt: Date.now(),
      dureeProposee: duree,
    };

    setExtensionModalVisible(false);
    setExtensionModalData(null);

    try {
      const result = await settings.RequestExtension(token, item.id, duree);
      if (result?.status === 'success') {
        Vibration.vibrate(300);
        Toast.show({
          type: 'info',
          text1: '⏳ Demande envoyée',
          text2: `En attente de confirmation du prestataire pour +${formatDuration(duree)}...`,
          visibilityTime: 8000,
        });
        logAlert('Extension demandée', `En attente de la réponse pour +${formatDuration(duree)}.`);
      } else {
        extensionsRef.current[key] = { ...ext, pendingAutoEnd: true, nextAlertAt: finReelle };
        delete pendingExtensionsRef.current[key];
        Toast.show({ type: 'error', text1: 'Erreur', text2: result?.message || "Impossible d'envoyer la demande", visibilityTime: 6000 });
      }
    } catch (e) {
      extensionsRef.current[key] = { ...ext, pendingAutoEnd: true, nextAlertAt: finReelle };
      delete pendingExtensionsRef.current[key];
      console.error('❌ Erreur RequestExtension:', e);
    } finally {
      alertesActivesRef.current.delete(key);
    }
  };

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

        // Initialisation depuis la DB (temps_ajoute = colonne top-level depuis AllReservationsHistory)
        if (!extensionsRef.current[key]) {
          extensionsRef.current[key] = {
            prixInitial: parseFloat(item.totalprice) || 0,
            dureeInitiale: parseFloat(item.duree) || 1,
            temps_ajoute: parseFloat(item.temps_ajoute) || 0,
            nextAlertAt: -1,
            pendingAutoEnd: false,
          };
        }

        const ext = extensionsRef.current[key];
        const now = Date.now();

        if (ext.nextAlertAt > 0 && now < ext.nextAlertAt) continue;

        const h = String(item.time).substring(0, 5);
        const formattedDate = moment(item.date).format("YYYY-MM-DD");
        const missionStart = new Date(`${formattedDate}T${h}:00`).getTime();
        const dureeTotal = ext.dureeInitiale + ext.temps_ajoute;
        const finReelle = missionStart + dureeTotal * 3600000;
        const PREAVIS_FIN_MS = 30 * 60 * 1000;

        // Cas 1 : le client a déjà refusé la prolongation — on ne fait qu'attendre
        // l'heure de fin réelle pour terminer automatiquement, sans jamais couper avant.
        if (ext.pendingAutoEnd) {
          // Ne pas terminer si une demande d'extension est en attente de réponse du prestataire
          if (pendingExtensionsRef.current[key]) continue;

          if (now < finReelle) continue;

          alertesActivesRef.current.add(key);
          try {
            const result = await settings.UpdateStatusBooking(
              token,
              item.id,
              "babysitter",
              "termine"
            );
            if (result?.status !== "success") {
              throw new Error(result?.message || "Échec mise à jour statut");
            }
            extensionsRef.current[key] = { ...ext, nextAlertAt: Infinity };
            const setTermine = (list: any[]) =>
              list.map((b) =>
                b.id === item.id ? { ...b, statut_prestataire: "termine" } : b
              );
            const updatedList = setTermine(itemsRef.current);
            updateItems(updatedList);
            setFilteredItems((prev) => setTermine(prev));
            await AsyncStorage.setItem(`cachedHistory_${id}`, JSON.stringify(updatedList));
            logAlert(t("Mission terminée"), `La mission (durée prévue de ${dureeTotal}h) est terminée.`);
          } catch (e) {
            console.error("❌ Erreur UpdateStatusBooking (auto):", e);
            // Réessaie au prochain cycle (60s) plutôt que de bloquer indéfiniment
            extensionsRef.current[key] = { ...ext, nextAlertAt: Date.now() + 5 * 60 * 1000 };
          } finally {
            alertesActivesRef.current.delete(key);
          }
          continue;
        }

        // Cas 2 : pas encore à 30 min de la fin — rien à faire pour l'instant
        if (now < finReelle - PREAVIS_FIN_MS) continue;

        alertesActivesRef.current.add(key);
        Vibration.vibrate(1000);
        const thbs = globalTHBS || (ext.prixInitial / Math.max(ext.dureeInitiale, 1));
        logAlert(t("Mission bientôt terminée ?"), `La mission se termine dans 30 minutes. Choisissez la durée de prolongation.`);
        setExtensionModalData({ item, key, missionStart, finReelle, ext, thbs });
        setSelectedExtDuration(0.5);
        setExtensionModalVisible(true);
      }
    };

    checkFinMission();
    const interval = setInterval(checkFinMission, 60000);

    return () => clearInterval(interval);
  }, [items, t, navigation, token]);

  // 4. POLLING : attend la réponse du prestataire pour une extension +30min
  useEffect(() => {
    const checkPendingExtensions = async () => {
      const keys = Object.keys(pendingExtensionsRef.current);
      if (keys.length === 0) return;

      for (const key of keys) {
        const pending = pendingExtensionsRef.current[key];
        const itemId = parseInt(key.replace('dur-', ''), 10);

        try {
          const result = await settings.GetExtensionStatus(token, itemId);
          if (!result || result.status !== 'success') continue;

          if (result.extension_status === 'accepted') {
            delete pendingExtensionsRef.current[key];

            // Le backend a mis à jour temps_ajoute/cout_ajoute/totalprice → on sync l'état local
            const nouveauTempsAjoute = parseFloat(result.temps_ajoute) || (extensionsRef.current[key]?.temps_ajoute + 0.5);
            const nouvelleFinReelle  = pending.missionStart + (pending.dureeInitiale + nouveauTempsAjoute) * 3600000;
            const nouveauPrix        = parseFloat(result.totalprice) || 0;

            const ext = extensionsRef.current[key];
            if (ext) {
              extensionsRef.current[key] = {
                ...ext,
                temps_ajoute: nouveauTempsAjoute,
                pendingAutoEnd: true,
                nextAlertAt: nouvelleFinReelle,
              };
            }

            const setPrice = (list: any[]) =>
              list.map((b) => b.id == itemId ? { ...b, totalprice: nouveauPrix } : b);
            const updatedList = setPrice(itemsRef.current);
            updateItems(updatedList);
            setFilteredItems((prev) => setPrice(prev));
            await AsyncStorage.setItem(`cachedHistory_${id}`, JSON.stringify(updatedList));

            Vibration.vibrate(500);
            Toast.show({
              type: 'success',
              text1: '✅ Extension acceptée !',
              text2: `+${formatDuration(pending.dureeProposee || 0.5)} confirmés par le prestataire.`,
              visibilityTime: 8000,
            });
            logAlert('Extension acceptée', `Le prestataire a accepté la prolongation de +${formatDuration(pending.dureeProposee || 0.5)}.`);

          } else if (result.extension_status === 'refused') {
            delete pendingExtensionsRef.current[key];

            const ext = extensionsRef.current[key];
            if (ext) {
              extensionsRef.current[key] = {
                ...ext,
                pendingAutoEnd: true,
                nextAlertAt: pending.originalFinReelle,
              };
            }

            // Si l'heure de fin originale est déjà passée, terminer immédiatement
            if (Date.now() >= pending.originalFinReelle) {
              try {
                await settings.UpdateStatusBooking(token, itemId, 'babysitter', 'termine');
                const setTermine = (list: any[]) =>
                  list.map((b) => b.id == itemId ? { ...b, statut_prestataire: 'termine' } : b);
                const upd = setTermine(itemsRef.current);
                updateItems(upd);
                setFilteredItems((prev) => setTermine(prev));
                await AsyncStorage.setItem(`cachedHistory_${id}`, JSON.stringify(upd));
              } catch (e) {
                console.error('❌ Erreur terminate after refused extension:', e);
              }
            }

            Toast.show({
              type: 'info',
              text1: '❌ Extension refusée',
              text2: 'Le prestataire n\'a pas accepté la prolongation. La mission se terminera à l\'heure prévue.',
              visibilityTime: 8000,
            });
            logAlert('Extension refusée', `Le prestataire a refusé la prolongation de +${formatDuration(pending.dureeProposee || 0.5)}.`);

          } else if (result.extension_status === 'pending') {
            // Timeout : 20 min sans réponse → traiter comme un refus
            if (Date.now() - pending.startedAt > 20 * 60 * 1000) {
              delete pendingExtensionsRef.current[key];
              const ext = extensionsRef.current[key];
              if (ext) {
                extensionsRef.current[key] = { ...ext, pendingAutoEnd: true, nextAlertAt: pending.originalFinReelle };
              }
              Toast.show({
                type: 'info',
                text1: '⏰ Délai dépassé',
                text2: 'Aucune réponse du prestataire. La mission se terminera à l\'heure prévue.',
                visibilityTime: 8000,
              });
            }
          }
        } catch (e) {
          console.error('❌ Erreur polling extension:', e);
        }
      }
    };

    const interval = setInterval(checkPendingExtensions, 30000);
    return () => clearInterval(interval);
  }, [token, id]);

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
            const alertTitle = "🔔 Statut mis à jour !";
            // Design d'origine (Toast) + vibration ajoutée ; déclenché une seule fois
            // puisqu'on ne compare qu'au dernier statut connu à chaque rafraîchissement.
            Vibration.vibrate(500);
            Toast.show({
              type: "info",
              text1: alertTitle,
              text2: statutMsg,
              visibilityTime: 8000,
            });
            logAlert(alertTitle, statutMsg, {
              reservationId: newBooking.id,
              type: normalizeType(newBooking.type),
            });
          }
        });
      }

      updateItems(sorted);

      // Programme les notifications locales pour J-1 et début de mission
      // → se déclenchent même si l'app est fermée
      scheduleReservationReminders(sorted).catch(() => {});

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
    let intervalId: ReturnType<typeof setInterval> | undefined;
    let cancelled = false;

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

      // Le composant a pu être démonté pendant ces appels asynchrones (navigation
      // rapide hors de l'écran) : ne surtout pas démarrer l'intervalle dans ce cas,
      // sinon il continue de sonder l'API indéfiniment en arrière-plan (fuite qui,
      // cumulée à chaque aller-retour sur l'onglet, peut déclencher un 429).
      if (!cancelled) {
        intervalId = setInterval(() => { fetchData(true); }, 60000);
      }
    };

    if (token && id) loadHistory();

    return () => {
      cancelled = true;
      if (intervalId) clearInterval(intervalId);
    };
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
    setCurrentPage(1);
    if (filterKey === "all") {
      setFilteredItems(sortByDate(items));
    } else {
      const filtered = items.filter((i) => normalizeType(i.type) === normalizeType(filterKey));
      setFilteredItems(sortByDate(filtered));
    }
  };

  // Pagination côté app (20 demandes par page) pour alléger le rendu de la liste,
  // sans changer l'appel API qui renvoie toujours l'historique complet.
  const PAGE_SIZE = 20;
  const totalPages = Math.max(1, Math.ceil(filteredItems.length / PAGE_SIZE));

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [filteredItems.length, totalPages, currentPage]);

  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

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
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterContainer}
          contentContainerStyle={styles.filterContent}
        >
          {filters.map((f) => (
            <TouchableOpacity
              key={f.key}
              style={[styles.filterButton, activeFilter === f.key && styles.filterButtonActive]}
              onPress={() => applyFilter(f.key)}
            >
              <Text
                style={[styles.filterText, activeFilter === f.key && styles.filterTextActive]}
                numberOfLines={1}
              >
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {token && id ? (
          <FlatList
            key={`page-${currentPage}`}
            data={paginatedItems}
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

        {token && id && filteredItems.length > 0 && (
          <View style={styles.paginationRow}>
            <TouchableOpacity
              disabled={currentPage === 1}
              onPress={() => setCurrentPage((p) => Math.max(1, p - 1))}
              style={[styles.pageButton, currentPage === 1 && styles.pageButtonDisabled]}
            >
              <Text style={styles.pageButtonText}>‹ Préc.</Text>
            </TouchableOpacity>
            <Text style={styles.pageIndicator}>{currentPage} / {totalPages}</Text>
            <TouchableOpacity
              disabled={currentPage === totalPages}
              onPress={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              style={[styles.pageButton, currentPage === totalPages && styles.pageButtonDisabled]}
            >
              <Text style={styles.pageButtonText}>Suiv. ›</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <Modal
        visible={extensionModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={handleModalCancel}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Prolonger la mission ?</Text>
            <Text style={styles.modalSubtitle}>{`La mission se termine dans 30 minutes.\nChoisissez la durée de prolongation :`}</Text>
            <ScrollView style={styles.durationList} showsVerticalScrollIndicator={false}>
              {EXTENSION_DURATIONS.map((h) => {
                const thbs = extensionModalData?.thbs || 0;
                const price = Math.round(thbs * h * 100) / 100;
                const currency = extensionModalData?.item?.currency || '€';
                const isSelected = selectedExtDuration === h;
                return (
                  <TouchableOpacity
                    key={h}
                    style={[styles.durationOption, isSelected && styles.durationOptionSelected]}
                    onPress={() => setSelectedExtDuration(h)}
                  >
                    <View style={[styles.radioCircle, isSelected && styles.radioCircleSelected]} />
                    <Text style={[styles.durationLabel, isSelected && styles.durationLabelSelected]}>
                      {formatDuration(h)}
                    </Text>
                    <Text style={[styles.durationPrice, isSelected && styles.durationPriceSelected]}>
                      {price.toFixed(2)} {currency}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalBtnCancel} onPress={handleModalCancel}>
                <Text style={styles.modalBtnCancelText}>Terminer à l'heure</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalBtnConfirm} onPress={handleModalConfirm}>
                <Text style={styles.modalBtnConfirmText}>Prolonger</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  background: { flex: 1, backgroundColor: "transparent" },
  container: { flex: 1, padding: 15 },
  loader: { flex: 1, justifyContent: "center", alignItems: "center" },
  filterContainer: { marginBottom: 10, flexGrow: 0, height: 46 },
  filterContent: { flexDirection: "row", alignItems: "center", paddingRight: 4 },
  paginationRow: { flexDirection: "row", justifyContent: "flex-end", alignItems: "center", marginTop: 10 },
  pageButton: { backgroundColor: "#2C7BE5", borderRadius: 16, paddingVertical: 6, paddingHorizontal: 12 },
  pageButtonDisabled: { backgroundColor: "#CBD5E0" },
  pageButtonText: { color: "#fff", fontSize: 13, fontWeight: "600" },
  pageIndicator: { marginHorizontal: 10, fontSize: 13, color: "#333", fontWeight: "600" },
  filterButton: { backgroundColor: "#fff", borderRadius: 25, paddingVertical: 8, paddingHorizontal: 18, marginRight: 8, elevation: 2, justifyContent: "center", alignItems: "center" },
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
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'center', alignItems: 'center', padding: 16 },
  modalContainer: { backgroundColor: '#fff', borderRadius: 16, padding: 20, width: '100%', maxHeight: '80%', elevation: 10 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#222', marginBottom: 8, textAlign: 'center' },
  modalSubtitle: { fontSize: 14, color: '#555', marginBottom: 14, textAlign: 'center', lineHeight: 20 },
  durationList: { maxHeight: 300, marginBottom: 16 },
  durationOption: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 12, borderRadius: 10, marginBottom: 6, backgroundColor: '#F5F5F5' },
  durationOptionSelected: { backgroundColor: '#EDE7F6' },
  radioCircle: { width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: '#999', marginRight: 12 },
  radioCircleSelected: { borderColor: '#6C2B8F', backgroundColor: '#6C2B8F' },
  durationLabel: { flex: 1, fontSize: 15, color: '#333', fontWeight: '500' },
  durationLabelSelected: { color: '#6C2B8F', fontWeight: '700' },
  durationPrice: { fontSize: 14, color: '#666', fontWeight: '500' },
  durationPriceSelected: { color: '#6C2B8F', fontWeight: '700' },
  modalButtons: { flexDirection: 'row', gap: 10 },
  modalBtnCancel: { flex: 1, paddingVertical: 12, borderRadius: 10, backgroundColor: '#F0F0F0', alignItems: 'center' },
  modalBtnCancelText: { color: '#555', fontSize: 14, fontWeight: '600' },
  modalBtnConfirm: { flex: 1, paddingVertical: 12, borderRadius: 10, backgroundColor: '#6C2B8F', alignItems: 'center' },
  modalBtnConfirmText: { color: '#fff', fontSize: 14, fontWeight: '600' },
});

export default HistoryScreen;