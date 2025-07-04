import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { PushNotifications } from '@capacitor/push-notifications';
import { Geolocation } from '@capacitor/geolocation';
import { Device } from '@capacitor/device';
import { Share } from '@capacitor/share';
import { Capacitor } from '@capacitor/core';
import { useState, useEffect } from 'react';
import { useToast } from './use-toast';

export const useNativeFeatures = () => {
  const { toast } = useToast();
  const [isNative, setIsNative] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState<any>(null);

  useEffect(() => {
    setIsNative(Capacitor.isNativePlatform());
    if (Capacitor.isNativePlatform()) {
      loadDeviceInfo();
      requestNotificationPermissions();
    }
  }, []);

  const loadDeviceInfo = async () => {
    try {
      const info = await Device.getInfo();
      setDeviceInfo(info);
    } catch (error) {
      console.error('Error getting device info:', error);
    }
  };

  // Camera functionality
  const takePhoto = async () => {
    try {
      if (!isNative) {
        toast({
          title: "Camera not available",
          description: "Camera is only available in the native mobile app",
          variant: "destructive"
        });
        return null;
      }

      const photo = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera
      });

      return photo.dataUrl;
    } catch (error) {
      console.error('Error taking photo:', error);
      toast({
        title: "Camera Error",
        description: "Failed to take photo",
        variant: "destructive"
      });
      return null;
    }
  };

  const selectFromGallery = async () => {
    try {
      if (!isNative) {
        toast({
          title: "Gallery not available", 
          description: "Photo gallery is only available in the native mobile app",
          variant: "destructive"
        });
        return null;
      }

      const photo = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Photos
      });

      return photo.dataUrl;
    } catch (error) {
      console.error('Error selecting photo:', error);
      return null;
    }
  };

  // Geolocation functionality
  const getCurrentLocation = async () => {
    try {
      if (!isNative) {
        // Fallback to web geolocation
        return new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            (position) => resolve({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy
            }),
            reject
          );
        });
      }

      const coordinates = await Geolocation.getCurrentPosition();
      return {
        latitude: coordinates.coords.latitude,
        longitude: coordinates.coords.longitude,
        accuracy: coordinates.coords.accuracy
      };
    } catch (error) {
      console.error('Error getting location:', error);
      toast({
        title: "Location Error",
        description: "Failed to get current location",
        variant: "destructive"
      });
      return null;
    }
  };

  // Push Notifications
  const requestNotificationPermissions = async () => {
    if (!isNative) return;

    try {
      const result = await PushNotifications.requestPermissions();
      
      if (result.receive === 'granted') {
        await PushNotifications.register();
        
        PushNotifications.addListener('registration', (token) => {
          console.log('Push registration success, token: ' + token.value);
        });

        PushNotifications.addListener('registrationError', (error) => {
          console.error('Error on registration: ' + JSON.stringify(error));
        });

        PushNotifications.addListener('pushNotificationReceived', (notification) => {
          console.log('Push received: ' + JSON.stringify(notification));
          toast({
            title: notification.title || "New Notification",
            description: notification.body || "You have a new notification"
          });
        });
      }
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
    }
  };

  // Share functionality  
  const shareContent = async (content: { title?: string; text?: string; url?: string }) => {
    try {
      if (!isNative) {
        // Fallback to web share API
        if (navigator.share) {
          await navigator.share(content);
          return;
        } else {
          toast({
            title: "Share not supported",
            description: "Sharing is not supported in this browser",
            variant: "destructive"
          });
          return;
        }
      }

      await Share.share(content);
    } catch (error) {
      console.error('Error sharing:', error);
      toast({
        title: "Share Error", 
        description: "Failed to share content",
        variant: "destructive"
      });
    }
  };

  // Share trip invitation
  const shareTrip = async (tripTitle: string, inviteUrl: string) => {
    await shareContent({
      title: `Join my trip: ${tripTitle}`,
      text: `I'm planning a group trip and would love for you to join!`,
      url: inviteUrl
    });
  };

  return {
    isNative,
    deviceInfo,
    takePhoto,
    selectFromGallery,
    getCurrentLocation,
    shareContent,
    shareTrip,
    requestNotificationPermissions
  };
};