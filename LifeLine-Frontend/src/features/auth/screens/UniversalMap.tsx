import React from 'react'
import { View, StyleSheet } from 'react-native'
import { WebView } from 'react-native-webview'

type Props = {
  latitude: number | undefined
  longitude: number | undefined
}

const UniversalMap = ({ latitude, longitude }: Props) => {
  const mapUrl = `https://www.google.com/maps?q=${latitude},${longitude}&z=15&output=embed`

  return (
    <View style={styles.container}>
      <WebView
        source={{ uri: mapUrl }}
        style={styles.map}
        javaScriptEnabled
        domStorageEnabled
      />
    </View>
  )
}

export default UniversalMap


const styles = StyleSheet.create({
  container: {
    height: 250,
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
  },
  map: {
    flex: 1,
  },
})
