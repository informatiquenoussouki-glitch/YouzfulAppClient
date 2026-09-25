import React, { useCallback, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, FlatList } from 'react-native';
import { useNavigation, useRoute, useFocusEffect, NavigationProp } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome';
import moment from 'moment';
import { useTranslation } from 'react-i18next';
import { getRecentAlerts } from '../helpers/alertsLog';

const Header = () => {
    // On définit un type rapide pour permettre la navigation vers des écrans imbriqués
    const navigation = useNavigation<NavigationProp<any>>();
    const route = useRoute();
    const { t } = useTranslation();
    const [alertsVisible, setAlertsVisible] = useState(false);
    const [alerts, setAlerts] = useState<any[]>([]);

    const goHome = () => {
        // TypeScript acceptera maintenant l'appel car navigation n'est plus typé "never"
        navigation.navigate('HomeStack', {
            screen: 'YouzFul',
        });
    };

    const refreshAlerts = useCallback(async () => {
        const recent = await getRecentAlerts(24);
        setAlerts(recent);
    }, []);

    // Charge le badge dès l'affichage de l'écran, puis le rafraîchit
    // régulièrement tant que l'écran est actif (nouvelles alertes en tâche de fond)
    useFocusEffect(
        useCallback(() => {
            refreshAlerts();
            const interval = setInterval(refreshAlerts, 30000);
            return () => clearInterval(interval);
        }, [refreshAlerts])
    );

    const openAlerts = useCallback(async () => {
        await refreshAlerts();
        setAlertsVisible(true);
    }, [refreshAlerts]);

    // Une alerte liée à une réservation (data.reservationId) emmène directement
    // vers son détail ; une alerte générique (rappel horaire sans lien direct) ferme juste la liste.
    const onPressAlert = useCallback((item: any) => {
        setAlertsVisible(false);
        if (item?.data?.reservationId != null && item?.data?.type) {
            navigation.navigate(t("details"), {
                id: item.data.reservationId,
                type: item.data.type,
            });
        }
    }, [navigation, t]);

    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={goHome} style={styles.iconContainer}>
                <Icon name="angle-left" size={24} color="#000" />
            </TouchableOpacity>

            <Text style={styles.title}>
                {route.name}
            </Text>

            <TouchableOpacity onPress={openAlerts} style={styles.bellContainer}>
                <Text style={styles.bellEmoji}>🔔</Text>
                {alerts.length > 0 && (
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>{alerts.length > 9 ? '9+' : alerts.length}</Text>
                    </View>
                )}
            </TouchableOpacity>

            <Modal
                visible={alertsVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setAlertsVisible(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setAlertsVisible(false)}
                >
                    <View style={styles.modalBox} onStartShouldSetResponder={() => true}>
                        <Text style={styles.modalTitle}>Alertes des dernières 24h</Text>
                        <FlatList
                            data={alerts}
                            keyExtractor={(item) => item.id}
                            style={styles.list}
                            ListEmptyComponent={
                                <Text style={styles.emptyText}>Aucune alerte récente</Text>
                            }
                            renderItem={({ item }) => (
                                <TouchableOpacity style={styles.alertItem} onPress={() => onPressAlert(item)}>
                                    <Text style={styles.alertTitle}>{item.title}</Text>
                                    <Text style={styles.alertMessage}>{item.message}</Text>
                                    <Text style={styles.alertTime}>{moment(item.timestamp).fromNow()}</Text>
                                </TouchableOpacity>
                            )}
                        />
                        <TouchableOpacity style={styles.closeButton} onPress={() => setAlertsVisible(false)}>
                            <Text style={styles.closeButtonText}>Fermer</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 15,
        backgroundColor: 'transparent',
        // Optionnel : ajouter une marge en haut si vous n'utilisez pas de SafeAreaView ici
        paddingTop: 40,
    },
    iconContainer: {
        paddingRight: 10,
    },
    title: {
        flex: 1,
        fontSize: 22,
        fontWeight: '600',
        color: '#000',
    },
    bellContainer: {
        paddingLeft: 10,
        paddingVertical: 4,
    },
    bellEmoji: {
        fontSize: 24,
    },
    badge: {
        position: 'absolute',
        top: -2,
        right: -2,
        backgroundColor: '#F44336',
        borderRadius: 9,
        minWidth: 18,
        height: 18,
        paddingHorizontal: 3,
        alignItems: 'center',
        justifyContent: 'center',
    },
    badgeText: {
        color: '#fff',
        fontSize: 11,
        fontWeight: '700',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalBox: {
        width: '88%',
        maxHeight: '70%',
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 18,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#000',
        marginBottom: 12,
    },
    list: {
        flexGrow: 0,
    },
    emptyText: {
        fontSize: 14,
        color: '#888',
        textAlign: 'center',
        paddingVertical: 30,
    },
    alertItem: {
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        paddingVertical: 10,
    },
    alertTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: '#222',
    },
    alertMessage: {
        fontSize: 13,
        color: '#555',
        marginTop: 2,
    },
    alertTime: {
        fontSize: 11,
        color: '#999',
        marginTop: 4,
    },
    closeButton: {
        marginTop: 14,
        alignSelf: 'center',
        paddingVertical: 8,
        paddingHorizontal: 24,
        backgroundColor: '#000',
        borderRadius: 20,
    },
    closeButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
});

export default Header;
