import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TextInput, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform,
  ActivityIndicator,
  Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../components/auth/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { supabase } from '../../lib/supabase';
import { useSearchParams, router } from 'expo-router';

// Tipos
interface Message {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  room_id: string;
  user?: {
    id: string;
    name: string;
    avatar_url?: string;
  };
}

interface ChatRoom {
  id: string;
  name: string;
  last_message?: string;
  last_message_time?: string;
  unread_count?: number;
  participants: {
    id: string;
    name: string;
    avatar_url?: string;
    user_type: 'trainer' | 'student';
  }[];
}

// Componente de bolha de mensagem
const MessageBubble = ({ message, isCurrentUser }) => (
  <View style={[
    styles.messageBubble,
    isCurrentUser ? styles.currentUserBubble : styles.otherUserBubble
  ]}>
    {!isCurrentUser && (
      <Image 
        source={{ 
          uri: message.user?.avatar_url || 
          'https://ui-avatars.com/api/?name=' + encodeURIComponent(message.user?.name || 'User') 
        }}
        style={styles.avatarSmall}
      />
    )}
    <View style={[
      styles.messageContent,
      isCurrentUser ? styles.currentUserContent : styles.otherUserContent
    ]}>
      {!isCurrentUser && (
        <Text style={styles.messageSender}>{message.user?.name}</Text>
      )}
      <Text style={[
        styles.messageText,
        isCurrentUser ? styles.currentUserText : styles.otherUserText
      ]}>
        {message.content}
      </Text>
      <Text style={[
        styles.messageTime,
        isCurrentUser ? styles.currentUserTime : styles.otherUserTime
      ]}>
        {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </Text>
    </View>
  </View>
);

// Componente de sala de chat
const ChatRoomItem = ({ room, onPress, currentUserId }) => {
  // Determinar o outro participante (não o usuário atual)
  const otherParticipant = room.participants.find(p => p.id !== currentUserId) || room.participants[0];
  
  return (
    <TouchableOpacity 
      style={styles.roomItem}
      onPress={onPress}
    >
      <Image 
        source={{ 
          uri: otherParticipant.avatar_url || 
          'https://ui-avatars.com/api/?name=' + encodeURIComponent(otherParticipant.name) 
        }}
        style={styles.avatar}
      />
      
      <View style={styles.roomInfo}>
        <View style={styles.roomHeader}>
          <Text style={styles.roomName}>{otherParticipant.name}</Text>
          {room.last_message_time && (
            <Text style={styles.roomTime}>
              {new Date(room.last_message_time).toLocaleDateString()}
            </Text>
          )}
        </View>
        
        <View style={styles.roomPreview}>
          <Text 
            numberOfLines={1} 
            style={styles.lastMessage}
          >
            {room.last_message || 'Nenhuma mensagem ainda'}
          </Text>
          
          {room.unread_count > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>{room.unread_count}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default function ChatScreen() {
  const { user } = useAuth();
  const params = useSearchParams();
  const roomId = params.roomId;
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
  
  const flatListRef = useRef<FlatList>(null);

  // Carregar salas de chat
  useEffect(() => {
    if (user) {
      fetchChatRooms();
      
      // Se tiver um roomId na URL, selecione essa sala
      if (roomId) {
        fetchRoomDetails(roomId as string);
      }
    }
  }, [user, roomId]);

  // Carregar mensagens quando uma sala for selecionada
  useEffect(() => {
    if (selectedRoom) {
      fetchMessages(selectedRoom.id);
      
      // Inscrever-se para receber atualizações em tempo real
      const subscription = supabase
        .channel(`room:${selectedRoom.id}`)
        .on('postgres_changes', { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'messages',
          filter: `room_id=eq.${selectedRoom.id}` 
        }, (payload) => {
          // Adicionar a nova mensagem ao estado
          const newMessage = payload.new as Message;
          
          // Adicionar dados do usuário à mensagem
          const userInfo = selectedRoom.participants.find(p => p.id === newMessage.user_id);
          newMessage.user = userInfo ? {
            id: userInfo.id,
            name: userInfo.name,
            avatar_url: userInfo.avatar_url
          } : undefined;
          
          setMessages(prev => [...prev, newMessage]);
          
          // Rolar para a última mensagem
          setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: true });
          }, 100);
        })
        .subscribe();
        
      return () => {
        supabase.removeChannel(subscription);
      };
    }
  }, [selectedRoom]);

  const fetchChatRooms = async () => {
    setLoading(true);
    
    try {
      // Em produção, buscar dados reais do Supabase
      // const { data, error } = await supabase
      //   .from('chat_rooms')
      //   .select('*, participants:chat_room_participants(user_id, user:profiles(id, name, avatar_url, user_type))')
      //   .contains('participants.user_id', [user.id])
      
      // Simulando dados para desenvolvimento
      setTimeout(() => {
        const mockRooms: ChatRoom[] = [
          {
            id: '1',
            name: 'João Silva',
            last_message: 'Olá, como está indo o treino?',
            last_message_time: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
            unread_count: 2,
            participants: [
              {
                id: user?.id || '123',
                name: user?.user_metadata?.name || 'Você',
                user_type: user?.user_metadata?.user_type || 'student',
              },
              {
                id: '456',
                name: 'João Silva',
                avatar_url: 'https://images.unsplash.com/photo-1607990281513-2c110a25bd8c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OXx8dHJhaW5lcnxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=500&q=60',
                user_type: 'trainer',
              }
            ]
          },
          {
            id: '2',
            name: 'Maria Fernandes',
            last_message: 'Vamos marcar uma avaliação física para a próxima semana?',
            last_message_time: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            unread_count: 0,
            participants: [
              {
                id: user?.id || '123',
                name: user?.user_metadata?.name || 'Você',
                user_type: user?.user_metadata?.user_type || 'student',
              },
              {
                id: '789',
                name: 'Maria Fernandes',
                avatar_url: 'https://images.unsplash.com/photo-1594381898411-846e7d193883?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGZpdG5lc3MlMjB0cmFpbmVyfGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60',
                user_type: 'trainer',
              }
            ]
          },
        ];
        
        setRooms(mockRooms);
        setLoading(false);
        
        // Se tiver um ID de sala na URL, selecionar essa sala
        if (roomId) {
          const room = mockRooms.find(r => r.id === roomId);
          if (room) {
            setSelectedRoom(room);
          }
        }
      }, 1000);
    } catch (error) {
      console.error('Erro ao buscar salas de chat:', error);
      setLoading(false);
    }
  };
  
  const fetchRoomDetails = async (id: string) => {
    // Em produção, buscar detalhes da sala específica do Supabase
    const room = rooms.find(r => r.id === id);
    if (room) {
      setSelectedRoom(room);
    }
  };

  const fetchMessages = async (roomId: string) => {
    setLoading(true);
    
    try {
      // Em produção, buscar mensagens reais do Supabase
      // const { data, error } = await supabase
      //   .from('messages')
      //   .select('*, user:profiles(id, name, avatar_url)')
      //   .eq('room_id', roomId)
      //   .order('created_at', { ascending: true })
      
      // Simulando dados para desenvolvimento
      setTimeout(() => {
        const otherUserId = selectedRoom?.participants.find(p => p.id !== user?.id)?.id;
        
        const mockMessages: Message[] = [
          {
            id: '1',
            user_id: otherUserId || '',
            content: 'Olá, como está indo o treino desta semana?',
            created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            room_id: roomId,
            user: selectedRoom?.participants.find(p => p.id === otherUserId)
          },
          {
            id: '2',
            user_id: user?.id || '',
            content: 'Está indo bem! Consegui completar todos os exercícios.',
            created_at: new Date(Date.now() - 23 * 60 * 60 * 1000).toISOString(),
            room_id: roomId,
            user: selectedRoom?.participants.find(p => p.id === user?.id)
          },
          {
            id: '3',
            user_id: otherUserId || '',
            content: 'Ótimo! Vamos aumentar a carga na próxima semana então?',
            created_at: new Date(Date.now() - 22 * 60 * 60 * 1000).toISOString(),
            room_id: roomId,
            user: selectedRoom?.participants.find(p => p.id === otherUserId)
          },
          {
            id: '4',
            user_id: user?.id || '',
            content: 'Sim, acho que estou pronto para um desafio maior!',
            created_at: new Date(Date.now() - 21 * 60 * 60 * 1000).toISOString(),
            room_id: roomId,
            user: selectedRoom?.participants.find(p => p.id === user?.id)
          },
        ];
        
        setMessages(mockMessages);
        setLoading(false);
        
        // Rolar para a última mensagem
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: false });
        }, 100);
      }, 1000);
    } catch (error) {
      console.error('Erro ao buscar mensagens:', error);
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedRoom || !user) return;
    
    setSending(true);
    const messageContent = newMessage.trim();
    setNewMessage('');
    
    try {
      // Em produção, enviar mensagem para o Supabase
      // const { data, error } = await supabase
      //   .from('messages')
      //   .insert({
      //     content: messageContent,
      //     user_id: user.id,
      //     room_id: selectedRoom.id
      //   })
      //   .select('*, user:profiles(id, name, avatar_url)')
      //   .single()
      
      // Simulando o envio para desenvolvimento
      setTimeout(() => {
        const newMsg: Message = {
          id: Date.now().toString(),
          user_id: user.id,
          content: messageContent,
          created_at: new Date().toISOString(),
          room_id: selectedRoom.id,
          user: {
            id: user.id,
            name: user.user_metadata?.name || 'Você',
            avatar_url: user.user_metadata?.avatar_url
          }
        };
        
        setMessages(prev => [...prev, newMsg]);
        setSending(false);
        
        // Rolar para a última mensagem
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }, 500);
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      setSending(false);
    }
  };

  // Renderizar a lista de salas se nenhuma sala for selecionada
  if (!selectedRoom) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />
        
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Mensagens</Text>
        </View>
        
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text style={styles.loadingText}>Carregando conversas...</Text>
          </View>
        ) : (
          <FlatList
            data={rooms}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <ChatRoomItem 
                room={item}
                currentUserId={user?.id || ''}
                onPress={() => {
                  setSelectedRoom(item);
                  router.push(`/chat?roomId=${item.id}`);
                }}
              />
            )}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={() => (
              <View style={styles.emptyContainer}>
                <Ionicons name="chatbubble-ellipses-outline" size={48} color="#CBD5E1" />
                <Text style={styles.emptyText}>
                  Nenhuma conversa encontrada.
                </Text>
              </View>
            )}
          />
        )}
      </SafeAreaView>
    );
  }

  // Renderizar a conversa selecionada
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            setSelectedRoom(null);
            router.push('/chat');
          }}
        >
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        
        <View style={styles.roomTitleContainer}>
          {selectedRoom.participants.map(p => (
            p.id !== user?.id && (
              <React.Fragment key={p.id}>
                <Image 
                  source={{ 
                    uri: p.avatar_url || 
                    'https://ui-avatars.com/api/?name=' + encodeURIComponent(p.name) 
                  }}
                  style={styles.headerAvatar}
                />
                <Text style={styles.headerTitle}>{p.name}</Text>
              </React.Fragment>
            )
          ))}
        </View>
        
        <TouchableOpacity style={styles.headerButton}>
          <Ionicons name="ellipsis-vertical" size={24} color="#0F172A" />
        </TouchableOpacity>
      </View>
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text style={styles.loadingText}>Carregando mensagens...</Text>
          </View>
        ) : (
          <>
            <FlatList
              ref={flatListRef}
              data={messages}
              keyExtractor={item => item.id}
              renderItem={({ item }) => (
                <MessageBubble 
                  message={item}
                  isCurrentUser={item.user_id === user?.id}
                />
              )}
              contentContainerStyle={styles.messagesContent}
              ListEmptyComponent={() => (
                <View style={styles.emptyMessagesContainer}>
                  <Ionicons name="chatbubble-outline" size={48} color="#CBD5E1" />
                  <Text style={styles.emptyText}>
                    Nenhuma mensagem ainda. Comece a conversa!
                  </Text>
                </View>
              )}
            />
            
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={newMessage}
                onChangeText={setNewMessage}
                placeholder="Escreva sua mensagem..."
                multiline
              />
              
              <TouchableOpacity 
                style={[
                  styles.sendButton,
                  (!newMessage.trim() || sending) && styles.sendButtonDisabled
                ]}
                onPress={sendMessage}
                disabled={!newMessage.trim() || sending}
              >
                {sending ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Ionicons name="send" size={20} color="#fff" />
                )}
              </TouchableOpacity>
            </View>
          </>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backButton: {
    padding: 4,
  },
  headerButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  roomTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  keyboardView: {
    flex: 1,
  },
  listContent: {
    padding: 16,
  },
  roomItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 16,
  },
  avatarSmall: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
  },
  roomInfo: {
    flex: 1,
  },
  roomHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  roomName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  roomTime: {
    fontSize: 12,
    color: '#64748B',
  },
  roomPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  lastMessage: {
    fontSize: 14,
    color: '#64748B',
    flex: 1,
  },
  unreadBadge: {
    backgroundColor: '#3B82F6',
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  unreadText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 20,
  },
  messageBubble: {
    flexDirection: 'row',
    marginBottom: 16,
    maxWidth: '80%',
  },
  currentUserBubble: {
    alignSelf: 'flex-end',
  },
  otherUserBubble: {
    alignSelf: 'flex-start',
  },
  messageContent: {
    borderRadius: 16,
    padding: 12,
  },
  currentUserContent: {
    backgroundColor: '#3B82F6',
  },
  otherUserContent: {
    backgroundColor: '#F1F5F9',
  },
  messageSender: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748B',
    marginBottom: 4,
  },
  messageText: {
    fontSize: 16,
  },
  currentUserText: {
    color: '#fff',
  },
  otherUserText: {
    color: '#0F172A',
  },
  messageTime: {
    fontSize: 10,
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  currentUserTime: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  otherUserTime: {
    color: '#64748B',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    paddingRight: 48,
    fontSize: 16,
    maxHeight: 120,
  },
  sendButton: {
    backgroundColor: '#3B82F6',
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    right: 24,
    bottom: 24,
  },
  sendButtonDisabled: {
    backgroundColor: '#CBD5E1',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#64748B',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyMessagesContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 12,
  },
}); 