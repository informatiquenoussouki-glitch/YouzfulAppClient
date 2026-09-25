import { useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { checkUnpaidMissions } from '../api/settings';

export interface UnpaidMission {
  id: number | string;
  type: string;
  totalprice: number | string;
  date?: string;
  prestataire_nom?: string;
}

interface Result {
  checking: boolean;
  unpaidMission: UnpaidMission | null;
  // Appeler avant toute soumission ; retourne true si on peut soumettre, false si bloqué
  checkBeforeSubmit: () => Promise<boolean>;
  clearUnpaid: () => void;
}

export function useUnpaidCheck(): Result {
  const token = useSelector(({ userReducer }: any) => userReducer.token);
  const [checking, setChecking] = useState(false);
  const [unpaidMission, setUnpaidMission] = useState<UnpaidMission | null>(null);

  const checkBeforeSubmit = useCallback(async (): Promise<boolean> => {
    if (!token) return true;
    setChecking(true);
    try {
      const res = await checkUnpaidMissions(token);
      if (res?.code === 200 && Array.isArray(res.data) && res.data.length > 0) {
        setUnpaidMission(res.data[0]); // Affiche la première mission non payée
        setChecking(false);
        return false; // bloqué
      }
    } catch {
      // En cas d'erreur réseau on laisse passer (ne pas bloquer le client)
    }
    setChecking(false);
    return true; // OK, on peut soumettre
  }, [token]);

  const clearUnpaid = useCallback(() => setUnpaidMission(null), []);

  return { checking, unpaidMission, checkBeforeSubmit, clearUnpaid };
}
