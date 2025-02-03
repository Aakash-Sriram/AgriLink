/**
 * Home Screen Component
 * 
 * The main entry point of the application. Features a grid-based menu
 * with large, easy-to-tap buttons and voice command support for hands-free
 * operation during farming activities.
 * 
 * Features:
 * - Voice command integration
 * - Large, accessible buttons
 * - Multilingual support
 * - Grid-based navigation
 */
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Voice from 'react-native-voice';
import { useTranslation } from 'react-i18next';
import { VoiceCommand } from '../utils/voiceCommands';

export default function HomeScreen({ navigation }) {
  const { t } = useTranslation();
  const [isListening, setIsListening] = useState(false);
  const [voiceText, setVoiceText] = useState('');

  // Initialize voice recognition
  useEffect(() => {
    Voice.onSpeechResults = onSpeechResults;
    // Cleanup voice recognition on component unmount
    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  // Start voice recognition in current language
  const startListening = async () => {
    try {
      await Voice.start(t('currentLanguage'));
      setIsListening(true);
    } catch (e) {
      console.error(e);
    }
  };

  // Handle voice command results
  const onSpeechResults = (e) => {
    const text = e.value[0];
    setVoiceText(text);
    VoiceCommand.handleCommand(text, navigation);
    setIsListening(false);
  };

  return (
    <View style={styles.container}>
      {/* Main Menu Grid */}
      <View style={styles.menuGrid}>
        {/* Marketplace Navigation Button */}
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => navigation.navigate('Marketplace')}
        >
          <Text style={styles.menuText}>{t('home.marketplace')}</Text>
        </TouchableOpacity>
        
        {/* Training Module Navigation Button */}
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => navigation.navigate('Training')}
        >
          <Text style={styles.menuText}>{t('home.training')}</Text>
        </TouchableOpacity>
      </View>

      {/* Voice Command Button */}
      <TouchableOpacity 
        style={styles.voiceButton}
        onPress={startListening}
      >
        <Text style={styles.voiceButtonText}>
          {isListening ? t('voice.listening') : t('voice.tap_to_speak')}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

// Styles optimized for accessibility and ease of use
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  menuItem: {
    width: '48%',  // Allow two items per row with spacing
    aspectRatio: 1,  // Square buttons for consistency
    backgroundColor: '#4CAF50',  // Green color for agricultural theme
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuText: {
    color: 'white',
    fontSize: 18,  // Large text for better readability
    fontWeight: 'bold',
    textAlign: 'center',
  },
  voiceButton: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 25,  // Circular button for voice commands
    alignItems: 'center',
    marginTop: 20,
  },
  voiceButtonText: {
    color: 'white',
    fontSize: 16,
  },
}); 