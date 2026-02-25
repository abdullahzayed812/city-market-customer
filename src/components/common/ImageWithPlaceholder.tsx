import React, { useState } from 'react';
import { Image, View, StyleSheet, ImageStyle, ViewStyle } from 'react-native';

interface Props {
  uri: string | null | undefined;
  style?: ImageStyle;
  placeholderStyle?: ViewStyle;
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'center';
}

const ImageWithPlaceholder = ({
  uri,
  style,
  placeholderStyle,
  resizeMode = 'cover',
}: Props) => {
  const [hasError, setHasError] = useState(false);

  if (!uri || hasError) {
    return <View style={[styles.placeholder, style, placeholderStyle]} />;
  }

  return (
    <Image
      source={{ uri }}
      style={style}
      resizeMode={resizeMode}
      onError={() => setHasError(true)}
    />
  );
};

const styles = StyleSheet.create({
  placeholder: {
    backgroundColor: '#E0E0E0',
  },
});

export default ImageWithPlaceholder;
