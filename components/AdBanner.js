import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';

const { width } = Dimensions.get('window');

// Ad Unit ID for Banner 1
const adUnitId = __DEV__ 
  ? TestIds.BANNER 
  : 'ca-app-pub-1404226769584050/8524710083';

const AdBanner = () => {
  const [adLoaded, setAdLoaded] = useState(false);

  const handleAdLoaded = () => {
    setAdLoaded(true);
    console.log('Banner ad loaded successfully');
  };

  const handleAdFailedToLoad = (error) => {
    console.log('Banner ad failed to load:', error);
  };

  return (
    <View style={styles.container}>
      <BannerAd
        unitId={adUnitId}
        size={BannerAdSize.BANNER}
        requestOptions={{
          requestNonPersonalizedAdsOnly: false,
        }}
        onAdLoaded={handleAdLoaded}
        onAdFailedToLoad={handleAdFailedToLoad}
        onAdOpened={() => console.log('Banner ad opened')}
        onAdClosed={() => console.log('Banner ad closed')}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f9fa',
    paddingVertical: 8,
    minHeight: 60,
  },
});

export default AdBanner;
