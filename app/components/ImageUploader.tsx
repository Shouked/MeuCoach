import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';

interface ImageUploaderProps {
  onImageUploaded: (url: string) => void;
  image?: string;
  title?: string;
  size?: 'small' | 'medium' | 'large';
  type?: 'avatar' | 'post' | 'cover';
  maxSize?: number; // Em MB
  shape?: 'circle' | 'square';
}

export default function ImageUploader({
  onImageUploaded,
  image,
  title = 'Adicionar imagem',
  size = 'medium',
  type = 'avatar',
  maxSize = 5, // Default 5MB
  shape = 'circle',
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [imageUri, setImageUri] = useState<string | null>(image || null);

  // Configurações baseadas no tamanho
  const getSizeStyle = () => {
    switch (size) {
      case 'small':
        return { width: 80, height: 80 };
      case 'large':
        return { width: 200, height: 200 };
      case 'medium':
      default:
        return { width: 120, height: 120 };
    }
  };

  // Tamanho do ícone baseado no tamanho do componente
  const getIconSize = () => {
    switch (size) {
      case 'small':
        return 24;
      case 'large':
        return 40;
      case 'medium':
      default:
        return 32;
    }
  };

  // Solicitar permissão para acessar a biblioteca de fotos
  const requestPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert(
        'Permissão necessária',
        'Precisamos de acesso à sua galeria para selecionar imagens.',
        [{ text: 'OK' }]
      );
      return false;
    }
    
    return true;
  };

  // Abrir a biblioteca de fotos
  const pickImage = async () => {
    const hasPermission = await requestPermission();
    
    if (!hasPermission) return;
    
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      
      if (!result.canceled) {
        // Verificar o tamanho do arquivo (limite em MB)
        const asset = result.assets[0];
        
        // Se estiver no formato de url, será necessário baixar para verificar o tamanho
        // Para simplificar, estamos apenas fazendo upload
        
        await uploadImage(asset.uri);
      }
    } catch (error) {
      console.error('Erro ao selecionar imagem:', error);
      Alert.alert('Erro', 'Não foi possível selecionar a imagem.');
    }
  };

  // Abrir a câmera
  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert(
        'Permissão necessária',
        'Precisamos de acesso à sua câmera para tirar fotos.',
        [{ text: 'OK' }]
      );
      return;
    }
    
    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      
      if (!result.canceled) {
        await uploadImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Erro ao tirar foto:', error);
      Alert.alert('Erro', 'Não foi possível tirar a foto.');
    }
  };

  // Enviar imagem para o Supabase Storage
  const uploadImage = async (uri: string) => {
    try {
      setUploading(true);
      
      // Preparar nome da imagem (usar tipo e timestamp)
      const fileExt = uri.split('.').pop();
      const fileName = `${type}_${Date.now()}.${fileExt}`;
      const filePath = `${type}s/${fileName}`;
      
      // Converter URI para Blob
      const response = await fetch(uri);
      const blob = await response.blob();
      
      // Upload para o Supabase Storage
      // Em produção, use o código abaixo:
      /*
      const { data, error } = await supabase.storage
        .from('images')
        .upload(filePath, blob, {
          contentType: `image/${fileExt}`,
          upsert: true
        });
        
      if (error) throw error;
      
      // Obter URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(filePath);
      */
      
      // Para o desenvolvimento, simulamos o upload
      setTimeout(() => {
        // Atualizar estado local
        setImageUri(uri);
        
        // Chamar callback com o URL
        onImageUploaded(uri);
        
        setUploading(false);
      }, 1500);
      
    } catch (error) {
      console.error('Erro no upload:', error);
      Alert.alert('Erro', 'Falha no upload da imagem. Tente novamente.');
      setUploading(false);
    }
  };

  const handleImageAction = () => {
    Alert.alert(
      'Adicionar Imagem',
      'Escolha uma opção:',
      [
        { text: 'Tirar Foto', onPress: takePhoto },
        { text: 'Escolher da Galeria', onPress: pickImage },
        imageUri ? { text: 'Remover Imagem', style: 'destructive', onPress: () => {
          setImageUri(null);
          onImageUploaded('');
        }} : null,
        { text: 'Cancelar', style: 'cancel' },
      ].filter(Boolean)
    );
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={handleImageAction}
        style={[
          styles.imageContainer,
          getSizeStyle(),
          shape === 'circle' && styles.circle,
          shape === 'square' && styles.square,
        ]}
        disabled={uploading}
      >
        {uploading ? (
          <View style={styles.uploadingContainer}>
            <ActivityIndicator color="#3B82F6" size="large" />
          </View>
        ) : imageUri ? (
          <>
            <Image
              source={{ uri: imageUri }}
              style={[
                styles.image,
                shape === 'circle' && styles.circle,
                shape === 'square' && styles.square,
              ]}
            />
            <View style={styles.editIconContainer}>
              <Ionicons name="pencil" size={18} color="#fff" />
            </View>
          </>
        ) : (
          <View style={styles.placeholder}>
            <Ionicons
              name="image-outline"
              size={getIconSize()}
              color="#94A3B8"
            />
          </View>
        )}
      </TouchableOpacity>
      
      {title && <Text style={styles.title}>{title}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 16,
  },
  imageContainer: {
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  circle: {
    borderRadius: 999,
  },
  square: {
    borderRadius: 12,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(241, 245, 249, 0.8)',
  },
  title: {
    marginTop: 8,
    fontSize: 14,
    color: '#64748B',
  },
  editIconContainer: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    backgroundColor: '#3B82F6',
    borderRadius: 16,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
}); 