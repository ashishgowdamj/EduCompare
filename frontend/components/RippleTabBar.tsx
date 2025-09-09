import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, LayoutChangeEvent, Platform, Easing } from 'react-native';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';

const ACTIVE = '#2196F3';
const INACTIVE = '#999';

const RippleTabBar: React.FC<BottomTabBarProps> = ({ state, descriptors, navigation }) => {
  const [width, setWidth] = useState(0);
  const tabCount = state.routes.length;
  const tabWidth = width > 0 ? width / tabCount : 0;

  // Underline indicator (follows active tab)
  const activeIndex = useRef(new Animated.Value(state.index)).current;
  const bounce = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(activeIndex, {
      toValue: state.index,
      duration: 240,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
    // trigger quick bounce for icon scale
    bounce.setValue(0);
    Animated.timing(bounce, { toValue: 1, duration: 180, useNativeDriver: true }).start();
  }, [state.index]);

  const onLayout = (e: LayoutChangeEvent) => {
    setWidth(e.nativeEvent.layout.width);
  };

  const underlineStyle = useMemo(() => {
    if (tabWidth === 0) return {} as any;
    const centerX = activeIndex.interpolate({
      inputRange: state.routes.map((_, i) => i),
      outputRange: state.routes.map((_, i) => i * tabWidth + tabWidth / 2),
    });
    const underlineWidth = 44;
    const translateX = Animated.subtract(centerX, new Animated.Value(underlineWidth / 2));
    return { transform: [{ translateX }] };
  }, [activeIndex, tabWidth, state.routes]);

  return (
    <View style={styles.container} onLayout={onLayout}>
      {/* Sliding underline under active tab */}
      {tabWidth > 0 && (
        <Animated.View pointerEvents="none" style={[styles.underline, underlineStyle]} />
      )}

      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label =
          options.tabBarLabel !== undefined
            ? (options.tabBarLabel as string)
            : options.title !== undefined
            ? options.title
            : route.name;
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!isFocused && !event.defaultPrevented) navigation.navigate(route.name);
        };
        const onLongPress = () => navigation.emit({ type: 'tabLongPress', target: route.key });

        const color = isFocused ? ACTIVE : INACTIVE;
        // scale icon+label slightly on focus
        const scale = activeIndex.interpolate({
          inputRange: [index - 1, index, index + 1],
          outputRange: [1, 1.1, 1],
          extrapolate: 'clamp',
        });
        const icon = options.tabBarIcon?.({ focused: isFocused, color, size: 22 });
        const badge = (options as any).tabBarBadge;

        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarTestID}
            onPress={onPress}
            onLongPress={onLongPress}
            style={styles.tab}
            activeOpacity={0.8}
          >
            <Animated.View style={[styles.item, { transform: [{ scale }] }]}>
              {icon}
              <Text style={[styles.label, { color }]} numberOfLines={1}>
                {label}
              </Text>
              {typeof badge === 'number' && badge > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{badge > 9 ? '9+' : badge}</Text>
                </View>
              )}
            </Animated.View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    height: Platform.select({ ios: 85, android: 60 }),
    paddingBottom: Platform.select({ ios: 20, android: 4 }),
    paddingTop: 8,
  },
  underline: {
    position: 'absolute',
    bottom: Platform.select({ ios: 16, android: 6 }),
    width: 44,
    height: 4,
    borderRadius: 3,
    backgroundColor: ACTIVE,
  },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  item: { alignItems: 'center', justifyContent: 'center' },
  label: { fontSize: 12, fontWeight: '500', marginTop: 4 },
  badge: {
    position: 'absolute',
    top: -2,
    right: -18,
    backgroundColor: '#FF5252',
    borderRadius: 10,
    paddingHorizontal: 4,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },
});

export default RippleTabBar;
