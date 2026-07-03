import AsyncStorage from "@react-native-async-storage/async-storage";
import { InteractionManager } from "react-native";

/**
 * PerformanceOptimizer : Centralise toutes les techniques d'accélération
 */
export const PerformanceOptimizer = {
  
  /**
   * ACCÉLÉRATION 1 : Smart Cache (Affichage instantané)
   * Charge le cache d'abord, puis met à jour silencieusement depuis l'API.
   */
  async smartFetch(key: string, apiCall: () => Promise<any>, onData: (data: any) => void) {
    // 1. On récupère le cache immédiatement
    const cached = await AsyncStorage.getItem(key);
    if (cached) {
      onData(JSON.parse(cached));
    }

    // 2. On attend que les animations de l'écran soient finies pour ne pas ramer
    InteractionManager.runAfterInteractions(async () => {
      try {
        const res = await apiCall();
        if (res?.status === "success") {
          const freshData = res.data || res.list;
          // 3. On ne met à jour l'écran que si les données ont changé
          if (JSON.stringify(freshData) !== cached) {
            onData(freshData);
            await AsyncStorage.setItem(key, JSON.stringify(freshData));
          }
        }
      } catch (e) {
        console.error(`Erreur PerformanceOptimizer [${key}]:`, e);
      }
    });
  },

  /**
   * ACCÉLÉRATION 2 : Mise en cache des images (Logique de préchargement)
   */
  async prefetchImages(imageArray: string[]) {
    // Utile pour charger les icônes de services en avance
    // Nécessite une lib comme FastImage ou Image.prefetch de RN
  },

  /**
   * ACCÉLÉRATION 3 : Optimisation du rendu des listes (FlatList)
   * Retourne les props optimales pour tes FlatList
   */
  getFlatListProps() {
    return {
      initialNumToRender: 7,
      maxToRenderPerBatch: 10,
      windowSize: 5,
      removeClippedSubviews: true,
      updateCellsBatchingPeriod: 50,
    };
  },

  /**
   * ACCÉLÉRATION 4 : Normalisation Ultra-rapide
   * Transforme les types de services et devises sans ralentir le thread UI
   */
  normalizeData(data: any[]) {
    return data.map(item => {
      const t = item.type?.toLowerCase() || "";
      let currency = "€";
      if (t.includes("trans") || t.includes("guid")) currency = "SAR";
      else if (t.includes("acti")) currency = "USD";
      
      return { ...item, currency };
    });
  }
};