import React, { useState, useRef } from 'react';
import { 
  View, 
  TextInput, 
  TouchableOpacity, 
  FlatList, 
  StyleSheet 
} from 'react-native';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { ChatBubble } from './ChatBubble';
import { VoiceInput } from './VoiceInput';

export function ChatInterface({ onSendMessage }) {
  const { t } = useTranslation();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const flatListRef = useRef();

  const handleSend = async () => {
    if (!message.trim()) return;

    const newMessage = {
      id: Date.now(),
      content: message,
      sender: 'USER',
    };

    setMessages(prev => [...prev, newMessage]);
    setMessage('');

    // Get bot response
    const response = await onSendMessage(message);
    setMessages(prev => [...prev, {
      id: Date.now(),
      content: response,
      sender: 'BOT',
    }]);

    // Scroll to bottom
    flatListRef.current?.scrollToEnd();
  };

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={({ item }) => <ChatBubble message={item} />}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.messageList}
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={message}
          onChangeText={setMessage}
          placeholder={t('chat.type_message')}
          multiline
        />
        
        <VoiceInput onResult={setMessage} />

        <TouchableOpacity 
          style={styles.sendButton} 
          onPress={handleSend}
        >
          <Icon name="send" size={24} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  messageList: {
    padding: 15,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: 'white',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 10,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: '#4CAF50',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 