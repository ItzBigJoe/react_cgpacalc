import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, Image, TouchableOpacity, Dimensions } from 'react-native';
import { NativeAdView, TestIds } from 'react-native-google-mobile-ads';

const { width } = Dimensions.get('window');

// Ad Unit ID for Custom Native Advanced
const adUnitId = __DEV__ 
  ? TestIds.NATIVE_ADVANCED 
  : 'ca-app-pub-1404226769584050/2753353121';

const CustomNativeAd = () => {
  const [adLoaded, setAdLoaded] = useState(false);

  const handleAdLoaded = () => {
    setAdLoaded(true);
    console.log('Custom Native Advanced ad loaded successfully');
  };

  const handleAdFailedToLoad = (error) => {
    console.log('Custom Native Advanced ad failed to load:', error);
  };

  return (
    <View style={styles.container}>
      <NativeAdView
        unitId={adUnitId}
        onAdLoaded={handleAdLoaded}
        onAdFailedToLoad={handleAdFailedToLoad}
        onAdOpened={() => console.log('Custom Native Advanced ad opened')}
        onAdClosed={() => console.log('Custom Native Advanced ad closed')}
      >
        <View style={styles.adContainer}>
          {/* Ad Icon */}
          <NativeAdView
            style={styles.iconContainer}
            nativeAdStyle={{
              icon: true,
            }}
          >
            <Image
              style={styles.icon}
              source={{ uri: 'https://via.placeholder.com/50x50' }}
            />
          </NativeAdView>

          {/* Ad Content */}
          <View style={styles.contentContainer}>
            <NativeAdView
              style={styles.headlineContainer}
              nativeAdStyle={{
                headline: true,
              }}
            >
              <Text style={styles.headline}>Loading Ad...</Text>
            </NativeAdView>

            <NativeAdView
              style={styles.bodyContainer}
              nativeAdStyle={{
                body: true,
              }}
            >
              <Text style={styles.body} numberOfLines={2}>Loading ad content...</Text>
            </NativeAdView>

            <View style={styles.infoContainer}>
              <NativeAdView
                style={styles.advertiserContainer}
                nativeAdStyle={{
                  advertiser: true,
                }}
              >
                <Text style={styles.advertiser}>Sponsored</Text>
              </NativeAdView>

              <NativeAdView
                style={styles.priceContainer}
                nativeAdStyle={{
                  price: true,
                }}
              >
                <Text style={styles.price}>Free</Text>
              </NativeAdView>
            </View>
          </View>

          {/* Ad Image */}
          <NativeAdView
            style={styles.imageContainer}
            nativeAdStyle={{
              image: true,
            }}
          >
            <Image
              style={styles.adImage}
              source={{ uri: 'https://via.placeholder.com/120x80' }}
            />
          </NativeAdView>

          {/* Call to Action Button */}
          <NativeAdView
            style={styles.ctaContainer}
            nativeAdStyle={{
              callToAction: true,
            }}
          >
            <TouchableOpacity style={styles.ctaButton}>
              <Text style={styles.ctaText}>Learn More</Text>
            </TouchableOpacity>
          </NativeAdView>
        </View>
      </NativeAdView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginVertical: 10,
    paddingHorizontal: 16,
  },
  adContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
  },
  icon: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  contentContainer: {
    flex: 1,
    marginLeft: 12,
  },
  headlineContainer: {
    marginBottom: 4,
  },
  headline: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  bodyContainer: {
    marginBottom: 8,
  },
  body: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  advertiserContainer: {
    flex: 1,
  },
  advertiser: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
  priceContainer: {
    flex: 1,
  },
  price: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0056b3',
  },
  imageContainer: {
    marginTop: 12,
    width: '100%',
    height: 120,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
  },
  adImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  ctaContainer: {
    marginTop: 12,
  },
  ctaButton: {
    backgroundColor: '#0056b3',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
    alignItems: 'center',
  },
  ctaText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default CustomNativeAd;
