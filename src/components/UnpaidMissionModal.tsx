import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { CreditCardInput } from 'react-native-credit-card-input-view';
import Toast from 'react-native-toast-message';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { SetBabySettingPayment } from '../api/settings';

const TYPE_LABELS: Record<string, string> = {
  babysitter: 'Baby-sitting',
  guide: 'Guide touristique',
  transfert: 'Transfert',
  resto: 'Restaurant',
  activite: 'Activité',
};

interface UnpaidMission {
  id: number | string;
  type: string;
  totalprice: number | string;
  date?: string;
  prestataire_nom?: string;
}

interface Props {
  visible: boolean;
  mission: UnpaidMission | null;
  onPaid: () => void;   // appelé après paiement réussi
  onDismiss: () => void; // appelé si le client ferme sans payer
}

const UnpaidMissionModal: React.FC<Props> = ({ visible, mission, onPaid, onDismiss }) => {
  const { t } = useTranslation();
  const token   = useSelector(({ userReducer }: any) => userReducer.token);
  const user    = useSelector(({ userReducer }: any) => userReducer.user);

  const [card, setCard] = useState({ card_number: '', cvc: '', exp_month: '', exp_year: '' });
  const [cardError, setCardError] = useState({ cvc: 'incomplete', expiry: 'incomplete', number: 'incomplete' });
  const [paying, setPaying] = useState(false);

  function onCardChange(form: any) {
    setCard({
      card_number: form.values.number,
      cvc: form.values.cvc,
      exp_month: form.values.expiry[0] + '' + form.values.expiry[1],
      exp_year: '20' + form.values.expiry[3] + '' + form.values.expiry[4],
    });
    setCardError(form.status);
  }

  async function handlePay() {
    if (!mission) return;
    if (cardError.cvc === 'incomplete' || cardError.expiry === 'incomplete' || cardError.number === 'incomplete') {
      Toast.show({ type: 'error', text1: 'Carte invalide', text2: 'Vérifiez les informations de votre carte.', position: 'top' });
      return;
    }
    setPaying(true);
    try {
      const payload = {
        card,
        user: { name: (user?.fname ?? '') + ' ' + (user?.lname ?? ''), email: user?.mail ?? '' },
        request: { id: mission.id, type: mission.type, price: Number(mission.totalprice) },
      };
      const res = await SetBabySettingPayment(payload, token);
      if (res?.code === 200 || res === 'success' || (typeof res === 'string' && res.includes('success'))) {
        Toast.show({ type: 'success', text1: 'Paiement réussi !', text2: 'Vous pouvez maintenant confirmer votre commande.', position: 'top' });
        onPaid();
      } else {
        Toast.show({ type: 'error', text1: 'Échec du paiement', text2: 'Vérifiez vos informations bancaires.', position: 'top' });
      }
    } catch {
      Toast.show({ type: 'error', text1: 'Erreur', text2: 'Impossible de traiter le paiement.', position: 'top' });
    }
    setPaying(false);
  }

  if (!mission) return null;

  const label = TYPE_LABELS[mission.type] ?? mission.type;
  const amount = Number(mission.totalprice).toFixed(2);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onDismiss}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* En-tête */}
            <View style={styles.header}>
              <Text style={styles.title}>⚠️ Mission non payée</Text>
              <Text style={styles.subtitle}>
                Vous avez une prestation {label} terminée non réglée. Payez-la pour continuer.
              </Text>
            </View>

            {/* Récapitulatif mission */}
            <View style={styles.missionBox}>
              <Text style={styles.missionType}>{label}</Text>
              <Text style={styles.missionAmount}>{amount} €</Text>
              {!!mission.date && (
                <Text style={styles.missionDate}>
                  📅 {new Date(mission.date).toLocaleDateString('fr-FR')}
                </Text>
              )}
              {!!mission.prestataire_nom && mission.prestataire_nom.trim() !== '' && (
                <Text style={styles.missionPrestataire}>
                  👤 {mission.prestataire_nom.trim()}
                </Text>
              )}
            </View>

            {/* Formulaire carte */}
            <Text style={styles.cardLabel}>Payer par carte</Text>
            <CreditCardInput onChange={onCardChange} />

            {/* Bouton payer */}
            <TouchableOpacity style={styles.payBtn} onPress={handlePay} disabled={paying}>
              {paying
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.payBtnText}>Payer {amount} €</Text>}
            </TouchableOpacity>

            {/* Lien fermer */}
            <TouchableOpacity onPress={onDismiss} style={styles.dismissBtn}>
              <Text style={styles.dismissText}>Payer plus tard (commande bloquée)</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    maxHeight: '90%',
  },
  header: { marginBottom: 16 },
  title: { fontSize: 20, fontWeight: '700', color: '#c0392b', textAlign: 'center', marginBottom: 6 },
  subtitle: { fontSize: 14, color: '#555', textAlign: 'center', lineHeight: 20 },
  missionBox: {
    backgroundColor: '#fff3cd',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ffc107',
  },
  missionType: { fontSize: 15, fontWeight: '700', color: '#333', marginBottom: 4 },
  missionAmount: { fontSize: 22, fontWeight: '800', color: '#c0392b' },
  missionDate: { fontSize: 12, color: '#777', marginTop: 4 },
  missionPrestataire: { fontSize: 12, color: '#555', marginTop: 4, fontWeight: '600' },
  cardLabel: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 8, marginTop: 4 },
  payBtn: {
    backgroundColor: '#1D9E75',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  payBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  dismissBtn: { alignItems: 'center', paddingVertical: 10 },
  dismissText: { color: '#aaa', fontSize: 13 },
});

export default UnpaidMissionModal;
