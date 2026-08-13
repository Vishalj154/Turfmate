import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TextInput, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '../../components/ui/Text';
import { Card } from '../../components/ui/Card';
import { Colors, Spacing, BorderRadius, Typography } from '../../theme';
import { useApp } from '../../store/AppContext';
import { Ionicons } from '@expo/vector-icons';

const SUGGESTIONS = [
  "Find cricket turfs near me",
  "Suggest a venue for 20 players",
  "Plan a weekend sports event",
  "Which turf is best for football?"
];

export default function AiScreen() {
  const { isDark } = useApp();
  const themeColors = isDark ? Colors.dark : Colors.light;
  
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { id: '1', role: 'ai', text: 'Hi there! I am your TurfMate AI assistant. I can help you find the perfect sports venue, plan an event, or answer any questions about our turfs. What are you looking for today?' }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const sendMessage = (text: string) => {
    if (!text.trim()) return;
    
    // Add user message
    const newMsg = { id: Date.now().toString(), role: 'user', text };
    setMessages(prev => [...prev, newMsg]);
    setInput('');
    setIsTyping(true);

    // Mock AI response
    setTimeout(() => {
      let aiText = "I can definitely help with that. Based on your request, I recommend checking out Champions Arena. It's highly rated and has great availability this weekend.";
      if (text.toLowerCase().includes('cricket')) {
        aiText = "For cricket, Greenfield Cricket Arena is your best bet! It has tournament-level pitches and is perfect for a big game.";
      } else if (text.toLowerCase().includes('event')) {
        aiText = "Planning an event? City Sports Complex can host up to 500 people and has excellent catering options.";
      }
      
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'ai', text: aiText }]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: themeColors.background }} edges={['top']}>
      <View style={styles.header}>
        <View style={[styles.aiIcon, { backgroundColor: themeColors.primary }]}>
          <Ionicons name="sparkles" size={20} color={Colors.light.surface} />
        </View>
        <View>
          <Text variant="h2">TurfMate AI</Text>
          <Text variant="caption" color={themeColors.textSecondary}>Your smart sports companion</Text>
        </View>
      </View>

      <KeyboardAvoidingView 
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView contentContainerStyle={styles.chatContent} showsVerticalScrollIndicator={false}>
          {messages.map(msg => (
            <View 
              key={msg.id} 
              style={[
                styles.messageBubble, 
                msg.role === 'user' ? styles.userBubble : styles.aiBubble,
                { backgroundColor: msg.role === 'user' ? themeColors.primary : themeColors.surface }
              ]}
            >
              <Text 
                variant="body" 
                color={msg.role === 'user' ? Colors.light.surface : themeColors.textPrimary}
              >
                {msg.text}
              </Text>
            </View>
          ))}

          {isTyping && (
            <View style={[styles.messageBubble, styles.aiBubble, { backgroundColor: themeColors.surface, width: 60 }]}>
              <Text color={themeColors.textSecondary}>...</Text>
            </View>
          )}

          {messages.length === 1 && (
            <View style={styles.suggestionsContainer}>
              <Text variant="caption" color={themeColors.textSecondary} style={{ marginBottom: Spacing.sm }}>Suggestions</Text>
              {SUGGESTIONS.map((sug, idx) => (
                <TouchableOpacity 
                  key={idx} 
                  style={[styles.suggestionChip, { borderColor: themeColors.primary }]}
                  onPress={() => sendMessage(sug)}
                >
                  <Text variant="caption" color={themeColors.primary}>{sug}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScrollView>

        <View style={[styles.inputContainer, { backgroundColor: themeColors.surface, borderTopColor: themeColors.border }]}>
          <TextInput
            style={[styles.input, { color: themeColors.textPrimary }]}
            placeholder="Ask me anything..."
            placeholderTextColor={themeColors.textSecondary}
            value={input}
            onChangeText={setInput}
            onSubmitEditing={() => sendMessage(input)}
          />
          <TouchableOpacity 
            style={[styles.sendButton, { backgroundColor: themeColors.primary }]}
            onPress={() => sendMessage(input)}
          >
            <Ionicons name="send" size={16} color={Colors.light.surface} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(150,150,150,0.1)',
  },
  aiIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  chatContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  messageBubble: {
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
    maxWidth: '80%',
  },
  userBubble: {
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
  },
  suggestionsContainer: {
    marginTop: Spacing.lg,
  },
  suggestionChip: {
    borderWidth: 1,
    borderRadius: BorderRadius.round,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.sm,
    alignSelf: 'flex-start',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: Spacing.md,
    borderTopWidth: 1,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    height: 40,
    fontSize: Typography.sizes.md,
    paddingHorizontal: Spacing.sm,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: Spacing.sm,
  }
});
