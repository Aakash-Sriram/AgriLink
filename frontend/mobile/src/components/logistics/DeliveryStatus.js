import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export function DeliveryStatus({ delivery }) {
  const { t } = useTranslation();

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PENDING': return 'clock-outline';
      case 'IN_TRANSIT': return 'truck-delivery';
      case 'DELIVERED': return 'check-circle';
      default: return 'information';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Icon 
          name={getStatusIcon(delivery.status)} 
          size={24} 
          color="#4CAF50" 
        />
        <Text style={styles.status}>
          {t(`delivery.status.${delivery.status.toLowerCase()}`)}
        </Text>
      </View>

      <View style={styles.details}>
        <Text style={styles.label}>{t('delivery.from')}:</Text>
        <Text style={styles.value}>{delivery.origin}</Text>

        <Text style={styles.label}>{t('delivery.to')}:</Text>
        <Text style={styles.value}>{delivery.destination}</Text>

        {delivery.temperature && (
          <>
            <Text style={styles.label}>{t('delivery.temperature')}:</Text>
            <Text style={styles.value}>{delivery.temperature}°C</Text>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  status: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  details: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 10,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  value: {
    fontSize: 16,
    marginBottom: 10,
  },
}); 