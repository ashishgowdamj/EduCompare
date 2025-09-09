import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, LayoutChangeEvent } from 'react-native';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';

const ACTIVE = '#2196F3';
const INACTIVE = '#999';

const AnimatedTabBar: React.FC<BottomTabBarProps> = ({ state, descriptors, navigation }) => {
  const translate = useRef(new Animated.Value(state.index)).current;
  const [width, setWidth] = useState(0);
  const tabCount = state.routes.length;
  const tabWidth = width > 0 ? width / tabCount : 0;

  useEffect(() => {
    Animated.timing(translate, {
      toValue: state.index,
      duration: 220,
      useNativeDriver: true,
    }).start();
  }, [state.index]);

  const onLayout = (e: LayoutChangeEvent) => {
    setWidth(e.nativeEvent.layout.width);
  };

  const pillStyle = useMemo(() => {
    if (tabWidth === 0) return { transform: [{ translateX: 0 }] };
    const x = translate.interpolate({
      inputRange: state.routes.map((_, i) => i),
      outputRange: state.routes.map((_, i) => i * tabWidth),
    });
    return { transform: [{ translateX: x }], width: tabWidth };
  }, [translate, tabWidth, state.routes]);

  return (
    <View style={styles.container} onLayout={onLayout}>
      {tabWidth > 0 && (
        <Animated.View style={[styles.pill, pillStyle]} />
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
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };

        const color = isFocused ? ACTIVE : INACTIVE;
        const scale = translate.interpolate({
          inputRange: [index - 1, index, index + 1],
          outputRange: [1, 1.12, 1],
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
            <Animated.View style={[styles.item, { transform: [{ scale }] }] }>
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
    height: 60,
  },
  pill: {
    position: 'absolute',
    height: 36,
    left: 0,
    top: 12,
    borderRadius: 18,
    backgroundColor: '#E8F0FE',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  item: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -16,
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

export default AnimatedTabBar;

