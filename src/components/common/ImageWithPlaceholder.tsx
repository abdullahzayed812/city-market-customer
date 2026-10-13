import React, { useState } from 'react';
import { Image, View, StyleSheet, ImageStyle, ViewStyle, Animated } from 'react-native';
import { Package, type LucideIcon } from 'lucide-react-native';
import { theme } from '../../theme';
import { useShimmer } from '../../hooks/useShimmer';

interface Props {
  uri: string | null | undefined;
  style?: ImageStyle;
  placeholderStyle?: ViewStyle;
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'center';
  /** Icon shown when there is no image or it fails to load. */
  fallbackIcon?: LucideIcon;
}

const ShimmerView = ({ style }: { style?: any }) => {
  const { opacity } = useShimmer();
  return <Animated.View style={[styles.shimmer, style, { opacity }]} />;
};

const ImageWithPlaceholder = ({ uri, style, placeholderStyle, resizeMode = 'cover', fallbackIcon: FallbackIcon = Package }: Props) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  if (!uri || hasError) {
    return (
      <View style={[styles.placeholder, style, placeholderStyle]}>
        <FallbackIcon size={26} color={theme.colors.primaryLight} strokeWidth={1.5} />
      </View>
    );
  }

  return (
    <View style={[style as any]}>
      {isLoading && <ShimmerView style={StyleSheet.absoluteFill} />}
      <Image
        source={{ uri }}
        style={[style, isLoading && styles.hidden]}
        resizeMode={resizeMode}
        onLoad={() => setIsLoading(false)}
        onError={() => { setHasError(true); setIsLoading(false); }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  placeholder: {
    backgroundColor: theme.colors.primaryXLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shimmer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: theme.colors.borderLight,
    zIndex: 1,
  },
  hidden: {
    opacity: 0,
  },
});

export default React.memo(ImageWithPlaceholder);
